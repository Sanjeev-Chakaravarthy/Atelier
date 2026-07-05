import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckSquare, MessageSquare, GripVertical, AlertTriangle } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';

export const TaskCard = ({
  task,
  dragHandleProps = {},
  isDragging = false,
  className = '',
  view = 'board', // board, list
}) => {
  const navigate = useNavigate();
  const { title, description, priority, dueDate, checklist = [], comments = [], status, _id } = task;

  const completedChecklist = checklist.filter((item) => item.completed).length;
  const totalChecklist = checklist.length;

  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'done';

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  if (view === 'list') {
    return (
      <Card
        onClick={() => navigate(`/tasks/${_id}`)}
        className={`hover:cursor-pointer flex items-center justify-between p-4 py-3 border border-black/[0.06]  hover:border-primary/20 hover: ${
          isDragging ? 'opacity-40 border-primary-container' : ''
        } ${className}`}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div {...dragHandleProps} className="drag-handle p-1 hover:bg-surface-high rounded">
            <GripVertical className="w-4 h-4 text-on-surface-var/30" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-body-sm font-semibold text-on-surface truncate">
                {title}
              </h4>
              {isOverdue && (
                <span className="text-[10px] text-error flex items-center gap-0.5 font-medium px-1 bg-error/10 rounded">
                  <AlertTriangle className="w-3 h-3" /> Overdue
                </span>
              )}
            </div>
            {description && (
              <p className="text-body-sm text-on-surface-var/50 truncate max-w-lg mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Details */}
          {totalChecklist > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-on-surface-var/60">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{completedChecklist}/{totalChecklist}</span>
            </div>
          )}

          {comments.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-on-surface-var/60">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{comments.length}</span>
            </div>
          )}

          {formattedDate && (
            <div className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-error' : 'text-on-surface-var/60'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}

          <Badge variant={priority}>{priority}</Badge>
          <Badge variant={status}>{status.replace('-', ' ')}</Badge>

          {task.assignee && (
            <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" />
          )}
        </div>
      </Card>
    );
  }

  // Board View Card
  return (
    <Card
      onClick={() => navigate(`/tasks/${_id}`)}
      className={`hover:cursor-pointer p-4 flex flex-col gap-4 border border-black/[0.06]  hover:border-primary/20 hover: select-none ${
        isDragging ? 'opacity-40 border-primary-container' : ''
      } ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <Badge variant={priority} className="w-fit">{priority}</Badge>
          <h4 className="text-body-sm font-semibold text-on-surface line-clamp-2 mt-1">
            {title}
          </h4>
        </div>

        <div {...dragHandleProps} className="drag-handle p-1 hover:bg-surface-high rounded mt-0.5">
          <GripVertical className="w-4 h-4 text-on-surface-var/30" />
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-body-sm text-on-surface-var/50 line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-black/[0.06]">
        <div className="flex items-center gap-3">
          {formattedDate && (
            <div className={`flex items-center gap-1 text-[10px] font-semibold ${isOverdue ? 'text-error bg-error/10 px-1.5 py-0.5 rounded' : 'text-on-surface-var/60'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          )}

          {totalChecklist > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-on-surface-var/60">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{completedChecklist}/{totalChecklist}</span>
            </div>
          )}

          {comments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-on-surface-var/60">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{comments.length}</span>
            </div>
          )}
        </div>

        {task.assignee && (
          <Avatar name={task.assignee.name} src={task.assignee.avatar} size="xs" />
        )}
      </div>
    </Card>
  );
};

export default TaskCard;
