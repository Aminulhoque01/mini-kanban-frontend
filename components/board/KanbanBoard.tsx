"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";

import type {
  Column,
  ColumnTask,
} from "@/types/column";

import {
  useMoveTaskMutation,
} from "@/redux/features/task/taskApi";

import KanbanColumn from "./KanbanColumn";

interface KanbanBoardProps {
  columns: Column[];

  onAddTask: (columnId: string) => void;

  onEditColumn: (column: Column) => void;

  onDeleteColumn: (columnId: string) => void;

  onEditTask: (task: ColumnTask) => void;

  onDeleteTask: (taskId: string) => void;
}

export default function KanbanBoard({
  columns,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
}: KanbanBoardProps) {
  const [
    localColumns,
    setLocalColumns,
  ] = useState<Column[]>(columns);

  const [
    activeTask,
    setActiveTask,
  ] = useState<ColumnTask | null>(null);

  const [
    moveTask,
    {
      isLoading: movingTask,
    },
  ] = useMoveTaskMutation();

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  // =====================================================
  // FIND TASK
  // =====================================================

  const findTask = (
    taskId: string
  ) => {
    for (const column of localColumns) {
      const task = column.tasks.find(
        (item) =>
          item.id === taskId
      );

      if (task) {
        return {
          task,
          column,
        };
      }
    }

    return null;
  };

  // =====================================================
  // FIND COLUMN
  // =====================================================

  const findColumn = (
    id: string
  ) => {
    return localColumns.find(
      (column) =>
        column.id === id
    );
  };

  // =====================================================
  // DRAG START
  // =====================================================

  const handleDragStart = (
    event: any
  ) => {
    const taskId = String(
      event.active.id
    );

    const result =
      findTask(taskId);

    if (result) {
      setActiveTask(
        result.task
      );
    }
  };

  // =====================================================
  // DRAG CANCEL
  // =====================================================

  const handleDragCancel =
    () => {
      setActiveTask(null);
    };

  // =====================================================
  // DRAG END
  // =====================================================

  const handleDragEnd =
    async (
      event: DragEndEvent
    ) => {
      setActiveTask(null);

      const {
        active,
        over,
      } = event;

      if (!over) {
        return;
      }

      const activeId =
        String(active.id);

      const overId =
        String(over.id);

      const sourceResult =
        findTask(activeId);

      if (!sourceResult) {
        return;
      }

      const sourceColumn =
        sourceResult.column;

      // =================================================
      // FIND TARGET COLUMN
      // =================================================

      let targetColumn:
        | Column
        | undefined;

      // Dropped directly on column
      const directColumn =
        findColumn(overId);

      if (directColumn) {
        targetColumn =
          directColumn;
      }

      // Dropped on task
      if (!targetColumn) {
        const overTaskResult =
          findTask(overId);

        if (overTaskResult) {
          targetColumn =
            overTaskResult.column;
        }
      }

      if (!targetColumn) {
        return;
      }

      // =================================================
      // SAME COLUMN
      // =================================================

      if (
        sourceColumn.id ===
        targetColumn.id
      ) {
        const tasks = [
          ...sourceColumn.tasks,
        ];

        const oldIndex =
          tasks.findIndex(
            (task) =>
              task.id ===
              activeId
          );

        if (oldIndex === -1) {
          return;
        }

        // -----------------------------------------------
        // Dropped directly on the column
        // -----------------------------------------------

        let newIndex =
          tasks.length - 1;

        // -----------------------------------------------
        // Dropped on another task
        // -----------------------------------------------

        if (
          overId !==
          activeId
        ) {
          const overIndex =
            tasks.findIndex(
              (task) =>
                task.id ===
                overId
            );

          if (
            overIndex !== -1
          ) {
            newIndex =
              overIndex;
          }
        }

        // -----------------------------------------------
        // No movement
        // -----------------------------------------------

        if (
          oldIndex ===
          newIndex
        ) {
          return;
        }

        // -----------------------------------------------
        // Reorder
        // -----------------------------------------------

        const [
          movedTask,
        ] = tasks.splice(
          oldIndex,
          1
        );

        tasks.splice(
          newIndex,
          0,
          movedTask
        );

        const reorderedTasks =
          tasks.map(
            (
              task,
              index
            ) => ({
              ...task,
              position:
                index,
            })
          );

        const updatedColumns =
          localColumns.map(
            (column) => {
              if (
                column.id !==
                sourceColumn.id
              ) {
                return column;
              }

              return {
                ...column,
                tasks:
                  reorderedTasks,
              };
            }
          );

        // Optimistic UI
        setLocalColumns(
          updatedColumns
        );

        try {
          await moveTask({
            taskId: activeId,

            boardId:
              sourceColumn.boardId,

            data: {
              columnId:
                sourceColumn.id,

              position:
                newIndex,
            },
          }).unwrap();
        } catch (error) {
          console.error(
            "Failed to move task:",
            error
          );

          setLocalColumns(
            columns
          );
        }

        return;
      }

      // =================================================
      // CROSS COLUMN
      // =================================================

      const sourceTasks = [
        ...sourceColumn.tasks,
      ];

      const movedTaskIndex =
        sourceTasks.findIndex(
          (task) =>
            task.id ===
            activeId
        );

      if (
        movedTaskIndex === -1
      ) {
        return;
      }

      const [
        movedTask,
      ] = sourceTasks.splice(
        movedTaskIndex,
        1
      );

      // Remove active task
      // from target if necessary
      const targetTasks = [
        ...targetColumn.tasks,
      ].filter(
        (task) =>
          task.id !== activeId
      );

      // Default = bottom
      let targetIndex =
        targetTasks.length;

      // -----------------------------------------------
      // Dropped on another task
      // -----------------------------------------------

      if (
        overId !==
        activeId
      ) {
        const overTaskIndex =
          targetTasks.findIndex(
            (task) =>
              task.id ===
              overId
          );

        if (
          overTaskIndex !== -1
        ) {
          targetIndex =
            overTaskIndex;
        }
      }

      // -----------------------------------------------
      // Insert task
      // -----------------------------------------------

      targetTasks.splice(
        targetIndex,
        0,
        {
          ...movedTask,
          columnId:
            targetColumn.id,
        }
      );

      // -----------------------------------------------
      // Recalculate positions
      // -----------------------------------------------

      const updatedColumns =
        localColumns.map(
          (column) => {
            // Source column
            if (
              column.id ===
              sourceColumn.id
            ) {
              return {
                ...column,

                tasks:
                  sourceTasks.map(
                    (
                      task,
                      index
                    ) => ({
                      ...task,
                      position:
                        index,
                    })
                  ),
              };
            }

            // Target column
            if (
              column.id ===
              targetColumn!.id
            ) {
              return {
                ...column,

                tasks:
                  targetTasks.map(
                    (
                      task,
                      index
                    ) => ({
                      ...task,
                      position:
                        index,
                    })
                  ),
              };
            }

            return column;
          }
        );

      // Optimistic UI
      setLocalColumns(
        updatedColumns
      );

      try {
        await moveTask({
          taskId: activeId,

          boardId:
            sourceColumn.boardId,

          data: {
            columnId:
              targetColumn.id,

            position:
              targetIndex,
          },
        }).unwrap();
      } catch (error) {
        console.error(
          "Failed to move task:",
          error
        );

        setLocalColumns(
          columns
        );
      }
    };

  return (
    <DndContext
      collisionDetection={
        closestCenter
      }
      onDragStart={
        handleDragStart
      }
      onDragCancel={
        handleDragCancel
      }
      onDragEnd={
        handleDragEnd
      }
    >
      <div className="flex gap-4 overflow-x-auto pb-6">
        {localColumns.map(
          (column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddTask={
                onAddTask
              }
              onEditColumn={
                onEditColumn
              }
              onDeleteColumn={
                onDeleteColumn
              }
              onEditTask={
                onEditTask
              }
              onDeleteTask={
                onDeleteTask
              }
            />
          )
        )}
      </div>

      {/* Drag Preview */}

      <DragOverlay>
        {activeTask ? (
          <div className="w-[300px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
            <p className="font-medium text-slate-900">
              {activeTask.title}
            </p>

            <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {activeTask.priority}
            </span>
          </div>
        ) : null}
      </DragOverlay>

      {/* Saving Indicator */}

      {movingTask && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          Saving...
        </div>
      )}
    </DndContext>
  );
}