import React from 'react';
import {
  DndContext,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import Button from '../ui/Button';

// Sortable wrapper for columns
const SortableColumn = ({ id, status, tasks, onAddTask, onView }) => {
  const { setNodeRef } = useSortable({ id });

  const displayNames = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'In Review',
    done: 'Completed',
  };

  const statusColors = {
    todo: 'bg-on-surface-var/30',
    'in-progress': 'bg-cyan',
    review: 'bg-primary-container',
    done: 'bg-emerald',
  };

  return (
    <div className="flex flex-col w-full min-w-[280px] bg-surface-low/30 border border-black/[0.06] rounded-lg p-4">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[status] || statusColors.todo}`} />
          <h3 className="text-label-md text-on-surface font-semibold uppercase tracking-wider">
            {displayNames[status] || status}
          </h3>
          <span className="text-label-sm bg-surface-high px-2 py-0.5 rounded-full text-on-surface-var/60">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1 hover:bg-surface-high rounded-md text-on-surface-var/60 hover:text-on-surface transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List container */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-[350px]"
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskItem key={task._id} task={task} onView={onView} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

// Sortable Task Card wrapper
const SortableTaskItem = ({ task, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        dragHandleProps={listeners}
        isDragging={isDragging}
        view="board"
      />
    </div>
  );
};

export const TaskBoard = ({ tasks, onDragEnd, onAddTask, onView = 'board', onTaskClick }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const statuses = ['todo', 'in-progress', 'review', 'done'];

  // Filter tasks into columns
  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const handleDragEndEvent = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Check if dragged over a column or another card
    let newStatus = overId;
    if (!statuses.includes(overId)) {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    onDragEnd(activeId, newStatus, overId);
  };

  if (onView === 'list') {
    return (
      <div className="flex flex-col gap-2">
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskItem key={task._id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center py-12 text-on-surface-var/40">No tasks found.</div>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEndEvent}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start h-full">
        {statuses.map((status) => (
          <SortableColumn
            key={status}
            id={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onAddTask={onAddTask}
            onView={onTaskClick}
          />
        ))}
      </div>
    </DndContext>
  );
};

export default TaskBoard;
