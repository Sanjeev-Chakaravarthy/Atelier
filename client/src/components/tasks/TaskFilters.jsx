import React from 'react';
import { Search, Filter, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export const TaskFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  view,
  setView,
}) => {
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['todo', 'in-progress', 'review', 'done'];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4.5 h-4.5" />}
          />
        </div>

        {/* View togglers & actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex bg-surface-lowest border border-black/[0.08] p-1 rounded-md">
            <button
              onClick={() => setView('board')}
              className={`p-1.5 rounded transition-all ${
                view === 'board' ? 'bg-surface-high text-on-surface' : 'text-on-surface-var/60 hover:text-on-surface'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded transition-all ${
                view === 'list' ? 'bg-surface-high text-on-surface' : 'text-on-surface-var/60 hover:text-on-surface'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-var/80 border-t border-black/[0.06] pt-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-on-surface-var/50" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-base bg-surface-lowest text-on-surface py-1 pl-2.5 pr-8 text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] focus:ring-1 focus:ring-accent-olive shadow-sm h-8 w-auto"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="select-base bg-surface-lowest text-on-surface py-1 pl-2.5 pr-8 text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] focus:ring-1 focus:ring-accent-olive shadow-sm h-8 w-auto"
          >
            <option value="">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <ArrowUpDown className="w-4 h-4 text-on-surface-var/50" />
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-base bg-surface-lowest text-on-surface py-1 pl-2.5 pr-8 text-xs font-semibold border border-black/[0.08] dark:border-white/[0.08] focus:ring-1 focus:ring-accent-olive shadow-sm h-8 w-auto"
          >
            <option value="-createdAt">Created (Newest)</option>
            <option value="createdAt">Created (Oldest)</option>
            <option value="dueDate">Due Date (Soonest)</option>
            <option value="-priority">Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
