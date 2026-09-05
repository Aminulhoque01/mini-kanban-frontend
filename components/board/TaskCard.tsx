"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import type { ColumnTask } from "@/types/column";

interface TaskCardProps {
  task: ColumnTask;

  onEdit: (task: ColumnTask) => void;

  onDelete: (taskId: string) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group cursor-grab rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md active:cursor-grabbing ${
        isDragging
          ? "z-50 opacity-50 shadow-lg"
          : ""
      }`}
    >
      {/* Task Top */}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">
            {task.title}
          </p>

          {task.description && (
            <p className="mt-2 text-sm leading-5 text-slate-500">
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}

        <div
          className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            title="Edit task"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            title="Delete task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Priority + Status */}

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            task.priority === "HIGH"
              ? "bg-red-100 text-red-700"
              : task.priority === "MEDIUM"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {task.priority}
        </span>

        <span className="text-xs font-medium text-slate-400">
          {task.status === "IN_PROGRESS"
            ? "In Progress"
            : task.status === "TODO"
            ? "To Do"
            : "Done"}
        </span>
      </div>

      {/* Assignee */}

      {task.assignee && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            Assigned to{" "}
            <span className="font-medium text-slate-700">
              {task.assignee.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}