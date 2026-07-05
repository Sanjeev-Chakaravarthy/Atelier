import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ListFilter, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskFilters from '../components/tasks/TaskFilters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';

const MOCK_TASKS = [
  { _id: 't-101', title: 'Design system tokens deployment', description: 'Deploy Tailwind updates for Apex Velocity dark containers and outlines.', priority: 'high', status: 'todo', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), checklist: [], comments: [], createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 't-102', title: 'Verify server environment parameters', description: 'Configure docker-compose and environment variables for local database replication.', priority: 'medium', status: 'in-progress', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), checklist: [], comments: [], createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 't-103', title: 'Resolve race conditions in task reorder API', description: 'Fix database transaction locking in tasks reorder backend controller.', priority: 'urgent', status: 'review', dueDate: new Date().toISOString(), checklist: [], comments: [], createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 't-104', title: 'Configure global SEO tags and sitemap', description: 'Generate automated robot.txt and configure meta tags for landing page index.', priority: 'low', status: 'done', dueDate: new Date(Date.now() - 86400000).toISOString(), checklist: [], comments: [], createdAt: new Date(Date.now() - 86400000 * 2).toISOString() }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [view, setView] = useState('board');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStatusForModal, setNewStatusForModal] = useState('todo');
  const [createLoading, setCreateLoading] = useState(false);

  // New Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [checklistInput, setChecklistInput] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status: statusFilter,
        priority: priorityFilter,
        sort: sortBy,
      };
      
      const { data } = await tasksAPI.getAll(params);
      
      if (data && data.tasks) {
        setTasks(data.tasks);
      } else {
        setTasks(MOCK_TASKS);
      }
    } catch (err) {
      console.error("Failed to load tasks: ", err);
      // fallback
      setTasks(MOCK_TASKS);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, sortBy]);

  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenAddModal('todo');
      // Clear navigation state so reload doesn't keep opening it
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle Drag & Drop with latency compensation (optimistic UI update)
  const handleDragEnd = async (activeId, newStatus) => {
    // 1. Optimistic Update
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map((t) =>
      t._id === activeId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    // 2. Network Sync
    try {
      await tasksAPI.update(activeId, { status: newStatus });
      toast.success(`Task status updated to ${newStatus.replace('-', ' ')}`);
    } catch (err) {
      toast.error('Failed to sync status change with server');
      // Rollback
      setTasks(originalTasks);
    }
  };

  const handleOpenAddModal = (status = 'todo') => {
    setNewStatusForModal(status);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    // Reset Form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setChecklistInput('');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setCreateLoading(true);
    try {
      // Parse checklist items
      const checklist = checklistInput
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => ({ text: line.trim(), completed: false }));

      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status: newStatusForModal,
        dueDate: dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        checklist,
      };

      const { data } = await tasksAPI.create(payload);
      
      if (data && data.task) {
        setTasks((prev) => [data.task, ...prev]);
        toast.success('Task created successfully');
      } else {
        // Mock fallback create
        const mockNew = {
          _id: `t-${Date.now()}`,
          ...payload,
          comments: [],
          createdAt: new Date().toISOString()
        };
        setTasks((prev) => [mockNew, ...prev]);
        toast.success('Task added successfully (Demo mode)');
      }
      
      handleCloseAddModal();
    } catch (err) {
      toast.error('Failed to create task');
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  // Client-side fallback filter & search (if API doesn't support them fully)
  const getFilteredTasks = () => {
    let result = [...tasks];

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Filter by status (mostly done by TaskBoard, but useful in List View)
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      } else if (sortBy === '-createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === '-priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return 0;
    });

    return result;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <PageLayout title="Tasks">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">
        
        {/* Header Title with quick add */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-md font-bold text-on-surface">Tasks</h1>
            <p className="text-body-sm text-on-surface-var/60 mt-1">
              Manage, prioritize, and track your work velocity.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => handleOpenAddModal('todo')}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            New Mission
          </Button>
        </div>

        {/* Search and filter block */}
        <Card className="p-4  border-black/[0.06]">
          <TaskFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            view={view}
            setView={setView}
          />
        </Card>

        {/* Kanban Board / Tasks Grid List */}
        <div className="flex-1 min-h-[500px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[400px]">
              {[0, 1, 2, 3].map((col) => (
                <div key={col} className=" border border-black/[0.06] p-4 rounded-lg flex flex-col gap-4">
                  <div className="h-4 w-24 bg-surface-high rounded skeleton" />
                  <div className="h-32 bg-surface-high rounded skeleton" />
                  <div className="h-32 bg-surface-high rounded skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <TaskBoard
              tasks={filteredTasks}
              onDragEnd={handleDragEnd}
              onAddTask={handleOpenAddModal}
              onView={view}
            />
          )}
        </div>

        {/* INTERACTIVE ADD TASK DIALOG CARD */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          title={`Add Mission: ${newStatusForModal.toUpperCase()}`}
          size="md"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <Button variant="ghost" onClick={handleCloseAddModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateTask}
                isLoading={createLoading}
              >
                Launch Mission
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateTask} className="flex flex-col gap-5">
            <Input
              label="Mission Title"
              placeholder="e.g. Implement authentication guard routes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />

            <div className="w-full flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-var/60">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details, scope, or instructions for this mission..."
                className="input-base min-h-[100px] resize-y"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-var/60">Priority Rating</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="select-base bg-surface-lowest text-on-surface"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-var/60 flex items-center justify-between">
                <span>Checklist Items (One per line)</span>
                <span className="text-[10px] text-on-surface-var/40 lowercase tracking-normal font-normal">Optional</span>
              </label>
              <textarea
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                placeholder="Checklist step 1&#10;Checklist step 2&#10;Checklist step 3"
                className="input-base min-h-[90px] font-mono text-xs"
              />
            </div>
          </form>
        </Modal>

      </div>
    </PageLayout>
  );
}
