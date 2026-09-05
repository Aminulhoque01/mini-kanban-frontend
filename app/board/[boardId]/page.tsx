"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  useGetBoardQuery,
} from "@/redux/features/board/boardApi";

import {
  useGetColumnsQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
} from "@/redux/features/column/columnApi";

import { useAppSelector } from "@/redux/hooks";

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();

  const boardId = params.boardId as string;

  const token = useAppSelector(
    (state) => state.auth.token
  );

  const [showColumnModal, setShowColumnModal] =
    useState(false);

  const [columnName, setColumnName] = useState("");

  const [editingColumnId, setEditingColumnId] =
    useState<string | null>(null);

  const [editingColumnName, setEditingColumnName] =
    useState("");

  const [deletingColumnId, setDeletingColumnId] =
    useState<string | null>(null);

  const {
    data: boardData,
    isLoading: boardLoading,
    isError: boardError,
  } = useGetBoardQuery(boardId, {
    skip: !token || !boardId,
  });

  const {
    data: columnsData,
    isLoading: columnsLoading,
    isError: columnsError,
  } = useGetColumnsQuery(boardId, {
    skip: !token || !boardId,
  });

  const [createColumn, { isLoading: creatingColumn }] =
    useCreateColumnMutation();

  const [updateColumn, { isLoading: updatingColumn }] =
    useUpdateColumnMutation();

  const [deleteColumn, { isLoading: deletingColumn }] =
    useDeleteColumnMutation();

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token");

    if (!storedToken) {
      router.replace("/login");
    }
  }, [router]);

  const board = boardData?.data;
  const columns = columnsData?.data ?? [];

  const handleCreateColumn = async () => {
    const name = columnName.trim();

    if (!name) {
      return;
    }

    try {
      await createColumn({
        boardId,
        name,
      }).unwrap();

      setColumnName("");
      setShowColumnModal(false);
    } catch (error) {
      console.error(
        "Failed to create column:",
        error
      );
    }
  };

  const handleUpdateColumn = async () => {
    const name = editingColumnName.trim();

    if (!editingColumnId || !name) {
      return;
    }

    try {
      await updateColumn({
        columnId: editingColumnId,
        boardId,
        data: {
          name,
        },
      }).unwrap();

      setEditingColumnId(null);
      setEditingColumnName("");
    } catch (error) {
      console.error(
        "Failed to update column:",
        error
      );
    }
  };

  const handleDeleteColumn = async () => {
    if (!deletingColumnId) {
      return;
    }

    try {
      await deleteColumn({
        columnId: deletingColumnId,
        boardId,
      }).unwrap();

      setDeletingColumnId(null);
    } catch (error) {
      console.error(
        "Failed to delete column:",
        error
      );

      alert(
        "This column cannot be deleted. Make sure it has no tasks."
      );
    }
  };

  if (boardLoading || columnsLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-5 w-96 rounded bg-gray-200" />

            <div className="grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-80 rounded-xl bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (boardError || columnsError || !board) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Unable to load board
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            You may not have access to this board.
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 ">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-white"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.replace("/login");
            }}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Board information */}
      <section className="mx-auto max-w-7xl px-6 pb-6 pt-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {board.name}
        </h1>

        {board.description && (
          <p className="mt-2 max-w-2xl text-gray-500">
            {board.description}
          </p>
        )}
      </section>

      {/* Kanban */}
      <section className="mx-auto max-w-7xl overflow-x-auto px-6 pb-10">
        <div className="flex min-w-max gap-5">
          {columns.map((column) => (
            <div
              key={column.id}
              className="w-80 shrink-0 rounded-xl bg-gray-100 p-4"
            >
              {/* Column header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {column.name}
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {column.tasks.length}{" "}
                    {column.tasks.length === 1
                      ? "task"
                      : "tasks"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingColumnId(
                        column.id
                      );
                      setEditingColumnName(
                        column.name
                      );
                    }}
                    className="rounded-md p-2 text-gray-500 hover:bg-white hover:text-gray-900"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() =>
                      setDeletingColumnId(
                        column.id
                      )
                    }
                    className="rounded-md p-2 text-gray-500 hover:bg-white hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button className="rounded-md p-2 text-gray-500 hover:bg-white">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Tasks placeholder */}
              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border bg-white p-4 shadow-sm"
                  >
                    <p className="font-medium text-gray-900">
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                    )}

                    {task.assignee && (
                      <div className="mt-3 text-xs text-gray-500">
                        Assigned to{" "}
                        {task.assignee.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add task */}
              <button className="mt-4 flex w-full items-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-500 hover:bg-white hover:text-gray-900">
                <Plus size={17} />
                Add Task
              </button>
            </div>
          ))}

          {/* Add Column */}
          <button
            onClick={() =>
              setShowColumnModal(true)
            }
            className="flex h-fit w-80 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white p-5 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-900"
          >
            <Plus size={18} />
            Add Column
          </button>
        </div>
      </section>

      {/* Create Column Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Create Column
              </h2>

              <button
                onClick={() =>
                  setShowColumnModal(false)
                }
                className="rounded-md p-2 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <input
              value={columnName}
              onChange={(e) =>
                setColumnName(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateColumn();
                }
              }}
              placeholder="Column name"
              className="mt-5 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-gray-900"
              autoFocus
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() =>
                  setShowColumnModal(false)
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateColumn}
                disabled={
                  creatingColumn ||
                  !columnName.trim()
                }
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingColumn
                  ? "Creating..."
                  : "Create Column"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Column Modal */}
      {editingColumnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              Rename Column
            </h2>

            <input
              value={editingColumnName}
              onChange={(e) =>
                setEditingColumnName(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdateColumn();
                }
              }}
              className="mt-5 w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-gray-900"
              autoFocus
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingColumnId(null);
                  setEditingColumnName("");
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateColumn}
                disabled={
                  updatingColumn ||
                  !editingColumnName.trim()
                }
                className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {updatingColumn
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Column Modal */}
      {deletingColumnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Column?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              This column can only be deleted when
              it has no tasks.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeletingColumnId(null)
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteColumn}
                disabled={deletingColumn}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {deletingColumn
                  ? "Deleting..."
                  : "Delete Column"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}