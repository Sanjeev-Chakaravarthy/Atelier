import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckSquare, MessageSquare, Calendar, AlertTriangle, 
  Trash2, User, Play, Edit3, Eye, Plus, Send, Activity, Settings, CheckCircle2 
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Details task details viewer
export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Editor State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editorMode, setEditorMode] = useState('write'); // write vs preview
  const [editedDesc, setEditedDesc] = useState('');

  // Checklist Item State
  const [newCheckItem, setNewCheckItem] = useState('');

  // Comment State
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchTaskDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await tasksAPI.getById(id);
        if (data && data.task) {
          setTask(data.task);
          setEditedTitle(data.task.title);
          setEditedDesc(data.task.description || '');
        } else {
          setError("Task not found");
        }
      } catch (err) {
        console.error("Failed fetching task", err);
        setError("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };
    fetchTaskDetail();
  }, [id]);

  // Update specific fields
  const handleUpdateField = async (fields) => {
    if (!task) return;
    
    // Optimistic Update
    const originalTask = { ...task };
    const updated = { ...task, ...fields };
    
    // Add timeline log locally
    if (fields.status) {
      updated.timeline = [
        { id: `log-${Date.now()}`, user: user?.name || 'You', action: `updated status to ${fields.status}`, time: 'just now' },
        ...(updated.timeline || [])
      ];
    }
    if (fields.priority) {
      updated.timeline = [
        { id: `log-${Date.now()}`, user: user?.name || 'You', action: `updated priority to ${fields.priority}`, time: 'just now' },
        ...(updated.timeline || [])
      ];
    }

    setTask(updated);

    try {
      await tasksAPI.update(task._id, fields);
      toast.success("Changes saved successfully");
    } catch (err) {
      toast.error("Failed to save updates to database");
      setTask(originalTask); // Rollback
    }
  };

  // Description Editor Save
  const handleSaveDescription = async () => {
    setSaving(true);
    await handleUpdateField({ description: editedDesc });
    setSaving(false);
    toast.success("Description updated");
  };

  // Title Save
  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    setIsEditingTitle(false);
    await handleUpdateField({ title: editedTitle.trim() });
  };

  // Checklist Actions
  const handleToggleChecklist = async (itemId) => {
    const updatedChecklist = task.checklist.map(item => 
      item._id === itemId ? { ...item, completed: !item.completed } : item
    );
    await handleUpdateField({ checklist: updatedChecklist });
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;

    const newItem = {
      _id: `c-${Date.now()}`,
      text: newCheckItem.trim(),
      completed: false
    };

    const updatedChecklist = [...(task.checklist || []), newItem];
    setNewCheckItem('');
    await handleUpdateField({ checklist: updatedChecklist });
    toast.success("Milestone item added");
  };

  const handleDeleteChecklistItem = async (itemId) => {
    const updatedChecklist = task.checklist.filter(item => item._id !== itemId);
    await handleUpdateField({ checklist: updatedChecklist });
    toast.success("Checklist item removed");
  };

  // Comments Action
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    const newCommentPayload = {
      text: commentText.trim()
    };

    // Submit real API comment

    try {
      const { data } = await tasksAPI.addComment(task._id, newCommentPayload);
      if (data && data.task) {
        setTask(data.task);
      } else {
        // Fallback fetch
        const res = await tasksAPI.getById(task._id);
        setTask(res.data.task);
      }
      setCommentText('');
      toast.success("Comment posted");
    } catch (err) {
      toast.error("Failed to submit comment");
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  // Task Delete
  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this task?")) return;

    // Delete real API task

    try {
      await tasksAPI.delete(task._id);
      toast.success("Task deleted successfully");
      navigate('/tasks');
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  if (loading) {
    return (
      <PageLayout title="Task Details">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="h-6 w-32  skeleton" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-10 w-full  skeleton" />
              <div className="h-64 w-full  skeleton" />
            </div>
            <div className="h-96 w-full  skeleton" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !task) {
    return (
      <PageLayout title="Task Details">
        <div className="max-w-md mx-auto text-center py-16 flex flex-col items-center gap-4">
          <AlertTriangle className="w-12 h-12 text-error" />
          <h2 className="text-headline-md font-bold text-on-surface">Task Not Found</h2>
          <p className="text-body-sm text-on-surface-var/60">
            {error || "The requested task could not be retrieved from the server."}
          </p>
          <Button onClick={() => navigate('/tasks')} variant="secondary">
            Return to Tasks Board
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={`Mission Board: Details`}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* Back Link & Quick Actions */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/tasks')} 
            className="flex items-center gap-2 text-body-sm text-on-surface-var/60 hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" /> Back to missions list
          </button>
          <Button 
            variant="danger" 
            size="sm" 
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleDeleteTask}
          >
            Delete Task
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT SIDE: WORKSPACE DESCRIPTION, CHECKLIST, COMMENTS */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* TASK TITLE EDITOR */}
            <Card className="p-6 border-black/[0.08] ">
              {isEditingTitle ? (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="input-base text-headline-sm font-semibold flex-1"
                    autoFocus
                  />
                  <Button variant="primary" size="sm" onClick={handleSaveTitle}>
                    Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setIsEditingTitle(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-headline-md font-bold text-on-surface tracking-tight">
                    {task.title}
                  </h1>
                  <button 
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1.5 hover:bg-surface-high rounded-md text-on-surface-var/50 hover:text-on-surface transition-colors"
                  >
                    <Edit3 className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}
            </Card>

            {/* DESCRIPTION TEXT WORKSPACE EDITOR */}
            <Card className="p-6 border-black/[0.08]  flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-var/70">
                  Mission Directive
                </span>
                
                {/* Editor Tabs */}
                <div className="flex bg-surface-lowest border border-black/[0.08] p-0.5 rounded-md text-xs">
                  <button
                    onClick={() => setEditorMode('write')}
                    className={`px-3 py-1 rounded transition-colors ${editorMode === 'write' ? 'bg-surface-high text-on-surface' : 'text-on-surface-var/60 hover:text-on-surface'}`}
                  >
                    <Edit3 className="w-3 h-3 inline-block mr-1" /> Write
                  </button>
                  <button
                    onClick={() => setEditorMode('preview')}
                    className={`px-3 py-1 rounded transition-colors ${editorMode === 'preview' ? 'bg-surface-high text-on-surface' : 'text-on-surface-var/60 hover:text-on-surface'}`}
                  >
                    <Eye className="w-3 h-3 inline-block mr-1" /> Markdown Preview
                  </button>
                </div>
              </div>

              {editorMode === 'write' ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={editedDesc}
                    onChange={(e) => setEditedDesc(e.target.value)}
                    placeholder="Enter task details, supporting resources, or checklist details..."
                    className="input-base min-h-[220px] font-mono text-body-sm resize-y leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" onClick={handleSaveDescription} isLoading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-nexus min-h-[220px] bg-surface-low/30 p-4 border border-black/[0.06] rounded-md overflow-y-auto max-w-none text-body-sm whitespace-pre-wrap leading-relaxed">
                  {editedDesc || <span className="text-on-surface-var/30 italic">No description provided.</span>}
                </div>
              )}
            </Card>

            {/* CHECKLIST WORKSPACE */}
            <Card className="p-6 border-black/[0.08]  flex flex-col gap-4">
              <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-var/70">
                Operational Milestones
              </span>

              <div className="space-y-2">
                {task.checklist && task.checklist.map((item) => (
                  <div 
                    key={item._id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-surface-high/30 transition-colors group"
                  >
                    <div 
                      onClick={() => handleToggleChecklist(item._id)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4.5 h-4.5 text-cyan" />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded border border-black/15" />
                      )}
                      <span className={`text-body-sm truncate ${item.completed ? 'line-through text-on-surface-var/40' : 'text-on-surface-var'}`}>
                        {item.text || item.title}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteChecklistItem(item._id)}
                      className="p-1 hover:bg-surface-highest rounded text-on-surface-var/30 hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {task.checklist?.length === 0 && (
                  <div className="text-center py-6 text-on-surface-var/30 text-body-sm">
                    No checklists found. Add steps below to track completion velocity.
                  </div>
                )}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklistItem} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  placeholder="Create checklist subtask..."
                  className="input-base flex-1"
                />
                <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </form>
            </Card>

            {/* COMMENTS WORKSPACE */}
            <Card className="p-6 border-black/[0.08]  flex flex-col gap-4">
              <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-var/70 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Team Activity Logs
              </span>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {task.comments && task.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3 text-body-sm items-start">
                    <Avatar name={comment.user?.name || 'Team member'} size="sm" />
                    <div className="flex-1 bg-surface-low/20 border border-black/[0.06] p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-on-surface">{comment.user?.name || 'Member'}</span>
                        <span className="text-[10px] text-on-surface-var/40">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-on-surface-var/80 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                ))}

                {(!task.comments || task.comments.length === 0) && (
                  <div className="text-center py-6 text-on-surface-var/30 text-body-sm">
                    No updates logged. Start the operational discussion.
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-3 items-end mt-2 pt-2 border-t border-black/[0.06]">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Post an updates log or response..."
                  className="input-base flex-1 min-h-[60px] resize-y"
                  required
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-4 py-2.5 h-fit"
                  isLoading={commentLoading}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </form>
            </Card>

          </div>

          {/* RIGHT SIDEBAR: MODIFIERS AND TIMELINE LOGS */}
          <div className="flex flex-col gap-6">
            
            {/* TASK METADATA MODIFIER CONTAINER */}
            <Card className="p-6 border-black/[0.08]  flex flex-col gap-5">
              <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-var/70">
                Mission Attributes
              </span>

              {/* Status Select Modifier */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-on-surface-var/60 uppercase tracking-wide">Status State</label>
                <select
                  value={task.status}
                  onChange={(e) => handleUpdateField({ status: e.target.value })}
                  className="input-base bg-surface-lowest text-on-surface"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">In Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              {/* Priority Select Modifier */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-on-surface-var/60 uppercase tracking-wide">Priority Rating</label>
                <select
                  value={task.priority}
                  onChange={(e) => handleUpdateField({ priority: e.target.value })}
                  className="input-base bg-surface-lowest text-on-surface"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Due Date Modifier */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-on-surface-var/60 uppercase tracking-wide">Due Deadline</label>
                <input
                  type="date"
                  value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                  onChange={(e) => handleUpdateField({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="input-base bg-surface-lowest text-on-surface"
                />
              </div>

              <div className="divider" />

              {/* Assignee Details */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-on-surface-var/60 uppercase tracking-wide">Responsible Operator</label>
                {task.assignee ? (
                  <div className="flex items-center gap-3 bg-surface-low/20 border border-black/[0.06] p-2.5 rounded-md">
                    <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
                    <div>
                      <div className="text-body-sm font-semibold text-on-surface">{task.assignee.name}</div>
                      <div className="text-[10px] text-cyan">Lead Developer</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-surface-low/20 border border-dashed border-black/10 p-2.5 rounded-md text-on-surface-var/30 text-xs">
                    <User className="w-5 h-5" />
                    <span>Unassigned command</span>
                  </div>
                )}
              </div>
            </Card>

            {/* TASK TIMELINE LOGS */}
            <Card className="p-6 border-black/[0.08]  flex flex-col gap-4">
              <span className="text-label-sm font-bold uppercase tracking-wider text-on-surface-var/70 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Operations Log
              </span>

              <div className="relative pl-3 space-y-4 before:content-[''] before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/[0.08]">
                {task.timeline && task.timeline.map((log) => (
                  <div key={log.id} className="relative text-xs">
                    <div className="absolute -left-[14px] top-1.5 w-1.5 h-1.5 rounded-full bg-primary-container" />
                    <div>
                      <p className="text-on-surface-var/80">
                        <span className="text-on-surface font-semibold">{log.user}</span>
                        {' '}{log.action}
                      </p>
                      <span className="text-[10px] text-on-surface-var/40 block mt-0.5">
                        {log.time}
                      </span>
                    </div>
                  </div>
                ))}

                {(!task.timeline || task.timeline.length === 0) && (
                  <div className="text-center py-4 text-on-surface-var/30 text-xs">
                    No timeline logs generated.
                  </div>
                )}
              </div>
            </Card>

          </div>

        </div>

      </div>
    </PageLayout>
  );
}
