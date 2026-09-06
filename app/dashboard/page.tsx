"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  useAppDispatch,
  useAppSelector,
} from "@/redux/hooks";

import {
  logout,
  setCredentials,
  setToken,
} from "@/redux/features/auth/authSlice";

import {
  useGetMeQuery,
} from "@/redux/features/auth/authApi";

import {
  useGetBoardsQuery,
  useCreateBoardMutation,
  useDeleteBoardMutation,
} from "@/redux/features/board/boardApi";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, token } = useAppSelector(
    (state) => state.auth
  );

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [boardName, setBoardName] = useState("");
  const [boardDescription, setBoardDescription] =
    useState("");

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  // =========================
  // Auth / Me
  // =========================

  const {
    data: meData,
    isError: meError,
  } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    // localStorage → Redux
    dispatch(setToken(storedToken));
  }, [dispatch, router]);

  // =========================
  // Boards
  // =========================

  const {
    data: boardsData,
    isLoading: boardsLoading,
    isError: boardsError,
    refetch: refetchBoards,
  } = useGetBoardsQuery();

  const [
    createBoard,
    {
      isLoading: isCreating,
    },
  ] = useCreateBoardMutation();

  const [
    deleteBoard,
    {
      isLoading: isDeleting,
    },
  ] = useDeleteBoardMutation();

  const boards = boardsData?.data ?? [];

  // =========================
  // Check authentication
  // =========================

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token");

    if (!storedToken) {
      router.replace("/login");
    }
  }, [router]);

  // =========================
  // Restore user
  // =========================

  useEffect(() => {
    if (meData?.data && token) {
      dispatch(
        setCredentials({
          user: meData.data,
          token,
        })
      );
    }
  }, [
    meData,
    token,
    dispatch,
  ]);

  // =========================
  // Invalid token
  // =========================

  useEffect(() => {
    if (meError) {
      localStorage.removeItem("token");
      dispatch(logout());
      router.replace("/login");
    }
  }, [
    meError,
    dispatch,
    router,
  ]);

  // =========================
  // Logout
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");

    dispatch(logout());

    router.replace("/login");
  };

  // =========================
  // Create Board
  // =========================

  const handleCreateBoard = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!boardName.trim()) {
      return;
    }

    try {
      await createBoard({
        name: boardName.trim(),
        description:
          boardDescription.trim() || undefined,
      }).unwrap();

      setBoardName("");
      setBoardDescription("");
      setShowCreateModal(false);
    } catch (error) {
      console.error(
        "Create board failed:",
        error
      );
    }
  };

  // =========================
  // Delete Board
  // =========================

  const handleDeleteBoard = async () => {
    if (!deleteId) {
      return;
    }

    try {
      await deleteBoard(deleteId).unwrap();

      setDeleteId(null);
    } catch (error) {
      console.error(
        "Delete board failed:",
        error
      );
    }
  };

  // =========================
  // Loading
  // =========================

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Checking authentication...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================= Navbar ================= */}

      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              Mini Kanban
            </h1>

            <p className="text-sm text-slate-400">
              Project Management Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user?.name ?? "User"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* ================= Main ================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Welcome */}

        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-blue-400">
            Dashboard
          </p>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back
            {user?.name
              ? `, ${user.name}`
              : ""}{" "}
            👋
          </h2>

          <p className="mt-3 max-w-2xl text-slate-400">
            Manage your boards, organize tasks,
            and keep your projects moving forward.
          </p>
        </div>

        {/* ================= Stats ================= */}

        <div className="grid gap-5 md:grid-cols-3">

          {/* Boards */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Total Boards
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {boards.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                📋
              </div>

            </div>
          </div>

          {/* Active Tasks */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Active Tasks
                </p>

                <p className="mt-3 text-4xl font-bold">
                  0
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-2xl">
                📝
              </div>

            </div>
          </div>

          {/* Completed */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Completed Tasks
                </p>

                <p className="mt-3 text-4xl font-bold">
                  0
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-2xl">
                ✅
              </div>

            </div>
          </div>

        </div>

        {/* ================= Boards ================= */}

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900">

          {/* Header */}

          <div className="flex flex-col gap-4 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-xl font-semibold">
                Your Boards
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Create and manage your Kanban boards.
              </p>
            </div>

            <button
              onClick={() =>
                setShowCreateModal(true)
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-700"
            >
              + Create Board
            </button>

          </div>

          {/* ================= Board Content ================= */}

          <div className="p-6">

            {/* Loading */}

            {boardsLoading && (
              <div className="flex flex-col items-center justify-center py-16">

                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                <p className="mt-4 text-sm text-slate-400">
                  Loading your boards...
                </p>

              </div>
            )}

            {/* Error */}

            {!boardsLoading &&
              boardsError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">

                  <p className="text-red-400">
                    Failed to load boards.
                  </p>

                  <button
                    onClick={() =>
                      refetchBoards()
                    }
                    className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                  >
                    Try Again
                  </button>

                </div>
              )}

            {/* Empty */}

            {!boardsLoading &&
              !boardsError &&
              boards.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-700 px-6 py-16 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-3xl">
                    📋
                  </div>

                  <h4 className="mt-5 text-lg font-semibold">
                    No boards yet
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Create your first Kanban board
                    and start organizing your tasks.
                  </p>

                  <button
                    onClick={() =>
                      setShowCreateModal(true)
                    }
                    className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
                  >
                    Create Your First Board
                  </button>

                </div>
              )}

            {/* Boards */}

            {!boardsLoading &&
              !boardsError &&
              boards.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  {boards.map((board) => (
                    <div
                      key={board.id}
                      className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:-translate-y-1 hover:border-blue-500/50"
                    >

                      {/* Icon */}

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                          📋
                        </div>

                        <button
                          onClick={() =>
                            setDeleteId(
                              board.id
                            )
                          }
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
                          title="Delete board"
                        >
                          🗑️
                        </button>

                      </div>

                      {/* Info */}

                      <h4 className="mt-5 truncate text-lg font-semibold">
                        {board.name}
                      </h4>

                      <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                        {board.description ||
                          "No description provided."}
                      </p>

                      {/* Open */}

                      <button
                        onClick={() =>
                          router.push(
                            `/board/${board.id}`
                          )
                        }
                        className="mt-5 w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        Open Board →
                      </button>

                    </div>
                  ))}

                </div>
              )}

          </div>
        </div>
      </section>

      {/* ================= Create Modal ================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h3 className="text-xl font-semibold">
                  Create New Board
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Start a new project board.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleCreateBoard}
              className="space-y-5"
            >

              {/* Name */}

              <div>
                <label
                  htmlFor="boardName"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Board Name
                </label>

                <input
                  id="boardName"
                  type="text"
                  value={boardName}
                  onChange={(e) =>
                    setBoardName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Website Redesign"
                  autoFocus
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="boardDescription"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Description
                  <span className="ml-1 text-slate-500">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="boardDescription"
                  value={boardDescription}
                  onChange={(e) =>
                    setBoardDescription(
                      e.target.value
                    )
                  }
                  placeholder="What is this board for?"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setBoardName("");
                    setBoardDescription("");
                  }}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isCreating ||
                    !boardName.trim()
                  }
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating
                    ? "Creating..."
                    : "Create Board"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= Delete Modal ================= */}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
              ⚠️
            </div>

            <h3 className="mt-5 text-center text-xl font-semibold">
              Delete Board?
            </h3>

            <p className="mt-2 text-center text-sm leading-6 text-slate-400">
              This action cannot be undone.
              Are you sure you want to delete
              this board?
            </p>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setDeleteId(null)
                }
                className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteBoard}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}