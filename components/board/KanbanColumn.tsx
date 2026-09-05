"use client";

import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

import {
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type {
  Column,
  ColumnTask,
} from "@/types/column";

import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  column: Column;

  onAddTask: (columnId: string) => void;

  onEditColumn: (column: Column) => void;

  onDeleteColumn: (columnId: string) => void;

  onEditTask: (task: ColumnTask) => void;

  onDeleteTask: (taskId: string) => void;
}

export default function KanbanColumn({
  column,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-[320px] min-w-[320px] flex-col rounded-xl bg-slate-100 p-3 transition ${
        isOver
          ? "ring-2 ring-blue-400"
          : ""
      }`}
    >
      {/* Column Header */}

      <div className="mb-3 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-semibold text-slate-800">
            {column.name}
          </h3>

          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
            {column.tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEditColumn(column)}
            className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
            title="Rename column"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={() =>
              onDeleteColumn(column.id)
            }
            className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Delete column"
          >
            <Trash2 size={15} />
          </button>

          <button
            type="button"
            className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Tasks */}

      <SortableContext
        items={column.tasks.map(
          (task) => task.id
        )}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[80px] space-y-3">
          {column.tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center">
              <p className="text-sm text-slate-400">
                No tasks yet
              </p>
            </div>
          ) : (
            column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Add Task */}

      <button
        type="button"
        onClick={() =>
          onAddTask(column.id)
        }
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:bg-white hover:text-slate-700"
      >
        <Plus size={16} />

        Add task
      </button>
    </div>
  );
}