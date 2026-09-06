

"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Column, ColumnTask } from "@/types/column";
import { useMoveTaskMutation } from "@/redux/features/task/taskApi";
import KanbanColumn from "./KanbanColumn";

interface KanbanBoardProps {
  columns: Column[];
  onReorderColumn: (columnId: string, position: number) => Promise<void>;
  onAddTask: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditTask: (task: ColumnTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function KanbanBoard({
  columns,
  onReorderColumn,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [activeTask, setActiveTask] = useState<ColumnTask | null>(null);
  const [movingColumnId, setMovingColumnId] = useState<string | null>(null);

  const [moveTask, { isLoading: movingTask }] = useMoveTaskMutation();

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const findTask = (taskId: string) => {
    for (const column of localColumns) {
      const task = column.tasks.find((item) => item.id === taskId);
      if (task) return { task, column };
    }
    return null;
  };

  const findColumn = (id: string) =>
    localColumns.find((column) => column.id === id);

  const handleMoveColumn = async (columnId: string, direction: -1 | 1) => {
    if (movingColumnId) return;

    const oldIndex = localColumns.findIndex((column) => column.id === columnId);
    if (oldIndex === -1) return;

    const newIndex = oldIndex + direction;
    if (newIndex < 0 || newIndex >= localColumns.length) return;

    const previous = localColumns;
    const next = [...localColumns];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    setLocalColumns(next);
    setMovingColumnId(columnId);

    try {
      await onReorderColumn(columnId, newIndex);
    } catch {
      setLocalColumns(previous);
    } finally {
      setMovingColumnId(null);
    }
  };

  const handleDragStart = (event: { active: { id: string | number } }) => {
    const result = findTask(String(event.active.id));
    if (result) setActiveTask(result.task);
  };

  const handleDragCancel = () => setActiveTask(null);

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);

    if (!event.over) return;

    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const sourceResult = findTask(activeId);
    if (!sourceResult) return;

    const sourceColumn = sourceResult.column;
    let targetColumn = findColumn(overId);

    if (!targetColumn) {
      const overTaskResult = findTask(overId);
      targetColumn = overTaskResult?.column;
    }

    if (!targetColumn) return;

    // Same-column reorder
    if (sourceColumn.id === targetColumn.id) {
      const oldIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId
      );
      if (oldIndex === -1) return;

      let newIndex = targetColumn.tasks.length - 1;
      const overTaskIndex = targetColumn.tasks.findIndex(
        (task) => task.id === overId
      );

      if (overTaskIndex !== -1) {
        newIndex = overTaskIndex;
        if (oldIndex < newIndex) newIndex -= 1;
      }

      newIndex = Math.max(0, newIndex);
      if (newIndex === oldIndex) return;

      const previous = localColumns;
      const next = localColumns.map((column) => {
        if (column.id !== sourceColumn.id) return column;

        const tasks = [...column.tasks];
        const [movedTask] = tasks.splice(oldIndex, 1);
        tasks.splice(newIndex, 0, movedTask);

        return {
          ...column,
          tasks: tasks.map((task, index) => ({
            ...task,
            position: index,
          })),
        };
      });

      setLocalColumns(next);

      try {
        await moveTask({
          taskId: activeId,
          boardId: sourceColumn.boardId,
          data: {
            columnId: sourceColumn.id,
            position: newIndex,
          },
        }).unwrap();
      } catch {
        setLocalColumns(previous);
      }

      return;
    }

    // Cross-column move
    const sourceTasks = [...sourceColumn.tasks];
    const movedTaskIndex = sourceTasks.findIndex(
      (task) => task.id === activeId
    );
    if (movedTaskIndex === -1) return;

    const [movedTask] = sourceTasks.splice(movedTaskIndex, 1);

    const targetTasks = targetColumn.tasks.filter(
      (task) => task.id !== activeId
    );

    let targetIndex = targetTasks.length;
    const overTaskIndex = targetTasks.findIndex(
      (task) => task.id === overId
    );
    if (overTaskIndex !== -1) targetIndex = overTaskIndex;

    targetTasks.splice(targetIndex, 0, {
      ...movedTask,
      columnId: targetColumn.id,
    });

    const previous = localColumns;
    const next = localColumns.map((column) => {
      if (column.id === sourceColumn.id) {
        return {
          ...column,
          tasks: sourceTasks.map((task, index) => ({
            ...task,
            position: index,
          })),
        };
      }

      if (column.id === targetColumn!.id) {
        return {
          ...column,
          tasks: targetTasks.map((task, index) => ({
            ...task,
            position: index,
          })),
        };
      }

      return column;
    });

    setLocalColumns(next);

    try {
      await moveTask({
        taskId: activeId,
        boardId: sourceColumn.boardId,
        data: {
          columnId: targetColumn.id,
          position: targetIndex,
        },
      }).unwrap();
    } catch {
      setLocalColumns(previous);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-6">
        {localColumns.map((column, index) => (
          <div key={column.id} className=" shrink-0 gap-5">
            <div className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Position {index + 1}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Move column left"
                  disabled={index === 0 || !!movingColumnId}
                  onClick={() => handleMoveColumn(column.id, -1)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>

                <button
                  type="button"
                  title="Move column right"
                  disabled={
                    index === localColumns.length - 1 || !!movingColumnId
                  }
                  onClick={() => handleMoveColumn(column.id, 1)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <KanbanColumn
              column={column}
              onAddTask={onAddTask}
              onEditColumn={onEditColumn}
              onDeleteColumn={onDeleteColumn}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-[300px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
            <p className="font-medium text-slate-900">{activeTask.title}</p>
            <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {activeTask.priority}
            </span>
          </div>
        ) : null}
      </DragOverlay>

      {(movingTask || movingColumnId) && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          Saving...
        </div>
      )}
    </DndContext>
  );
}
