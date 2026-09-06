
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

import { useGetMeQuery } from "@/redux/features/auth/authApi";

import {
  useGetBoardsQuery,
  useCreateBoardMutation,
  useDeleteBoardMutation,
} from "@/redux/features/board/boardApi";

import { useGetTasksQuery } from "@/redux/features/task/taskApi";

import type { Task } from "@/types/task";

/* =========================================================
   TYPES
========================================================= */

type TaskWithBoard = Task & {
  boardName: string;
};

interface BoardTaskLoaderProps {
  boardId: string;
  boardName: string;
  userId: string;
  onTasksLoaded: (
    boardId: string,
    boardName: string,
    tasks: Task[]
  ) => void;
}

/* =========================================================
   BOARD TASK LOADER
   ---------------------------------------------------------
   Loads tasks assigned to the current user for one board.
========================================================= */

function BoardTaskLoader({
  boardId,
  boardName,
  userId,
  onTasksLoaded,
}: BoardTaskLoaderProps) {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetTasksQuery(
    {
      boardId,
      page: 1,
      limit: 100,
      assigneeId: userId,
    },
    {
      skip: !boardId || !userId,
      pollingInterval: 15000,
      refetchOnFocus: true,
    }
  );

  /* =======================================================
     DEBUG / RECEIVE TASKS
  ======================================================= */

  useEffect(() => {
    

    if (data?.data) {
      onTasksLoaded(
        boardId,
        boardName,
        data.data
      );
    }
  }, [
    boardId,
    boardName,
    userId,
    data,
    isLoading,
    isFetching,
    isError,
    error,
    onTasksLoaded,
  ]);

  /*
   * This component only performs the API request.
   * It doesn't render anything visible.
   */
  return null;
}

/* =========================================================
   DASHBOARD PAGE
========================================================= */

export default function DashboardPage() {
  const router = useRouter();

  const dispatch = useAppDispatch();

  /* =======================================================
     AUTH STATE
  ======================================================= */

  const {
    user,
    token,
  } = useAppSelector(
    (state) => state.auth
  );

  /* =======================================================
     DEBUG CURRENT USER
  ======================================================= */

  useEffect(() => {
    console.log("CURRENT USER:", user);
    console.log(
      "CURRENT USER ID:",
      user?.id
    );
  }, [user]);

  /* =======================================================
     AUTH CHECK
  ======================================================= */

  const [authChecked, setAuthChecked] =
    useState(false);

  /* =======================================================
     CREATE BOARD MODAL
  ======================================================= */

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [boardName, setBoardName] =
    useState("");

  const [boardDescription, setBoardDescription] =
    useState("");

  /* =======================================================
     DELETE BOARD MODAL
  ======================================================= */

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  /* =======================================================
     RESTORE TOKEN FROM LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    const storedToken =
      localStorage.getItem("token");

    if (!storedToken) {
      dispatch(logout());

      router.replace("/login");

      return;
    }

    if (storedToken !== token) {
      dispatch(
        setToken(storedToken)
      );
    }

    setAuthChecked(true);
  }, [
    dispatch,
    router,
    token,
  ]);

  /* =======================================================
     GET CURRENT USER
  ======================================================= */

  const {
    data: meData,
    isError: meError,
    isLoading: meLoading,
  } = useGetMeQuery(undefined, {
    skip: !token,
  });

  /* =======================================================
     SAVE CURRENT USER TO REDUX
  ======================================================= */

  useEffect(() => {
    if (
      meData?.data &&
      token
    ) {
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

  /* =======================================================
     INVALID TOKEN
  ======================================================= */

  useEffect(() => {
    if (!meError) {
      return;
    }

    localStorage.removeItem("token");

    dispatch(logout());

    router.replace("/login");
  }, [
    meError,
    dispatch,
    router,
  ]);

  /* =======================================================
     GET BOARDS
  ======================================================= */

  const {
    data: boardsData,
    isLoading: boardsLoading,
    isError: boardsError,
    error: boardsApiError,
    refetch: refetchBoards,
  } = useGetBoardsQuery(undefined, {
    skip: !token,
  });

  const boards =
    boardsData?.data ?? [];

  /* =======================================================
     DEBUG BOARDS
  ======================================================= */

  useEffect(() => {
    console.log(
      "CURRENT USER ID:",
      user?.id
    );

    console.log(
      "BOARDS API DATA:",
      boardsData
    );

    console.log(
      "BOARDS:",
      boards
    );

    console.log(
      "BOARDS API ERROR:",
      boardsApiError
    );
  }, [
    user?.id,
    boardsData,
    boards,
    boardsApiError,
  ]);

  /* =======================================================
     CREATE BOARD
  ======================================================= */

  const [
    createBoard,
    {
      isLoading: isCreating,
    },
  ] = useCreateBoardMutation();

  /* =======================================================
     DELETE BOARD
  ======================================================= */

  const [
    deleteBoard,
    {
      isLoading: isDeleting,
    },
  ] = useDeleteBoardMutation();

  /* =======================================================
     TASK STATE
  ======================================================= */

  const [
    tasksByBoard,
    setTasksByBoard,
  ] = useState<
    Record<
      string,
      TaskWithBoard[]
    >
  >({});

  /* =======================================================
     LOADED BOARD IDS
  ======================================================= */

  const [
    loadedBoardIds,
    setLoadedBoardIds,
  ] = useState<Set<string>>(
    new Set()
  );

  /* =======================================================
     RECEIVE TASKS
  ======================================================= */

  const handleTasksLoaded =
    useCallback(
      (
        boardId: string,
        boardName: string,
        tasks: Task[]
      ) => {
        console.log(
          "TASKS LOADED:",
          {
            boardId,
            boardName,
            tasks,
          }
        );

        const tasksWithBoard =
          tasks.map(
            (task) => ({
              ...task,
              boardName,
            })
          );

        setTasksByBoard(
          (previous) => ({
            ...previous,
            [boardId]:
              tasksWithBoard,
          })
        );

        setLoadedBoardIds(
          (previous) => {
            const next =
              new Set(
                previous
              );

            next.add(
              boardId
            );

            return next;
          }
        );
      },
      []
    );

  /* =======================================================
     REMOVE OLD BOARD TASK STATE
  ======================================================= */

  useEffect(() => {
    const currentBoardIds =
      new Set(
        boards.map(
          (board) =>
            board.id
        )
      );

    setTasksByBoard(
      (previous) => {
        const next: Record<
          string,
          TaskWithBoard[]
        > = {};

        Object.entries(
          previous
        ).forEach(
          ([
            boardId,
            tasks,
          ]) => {
            if (
              currentBoardIds.has(
                boardId
              )
            ) {
              next[boardId] =
                tasks;
            }
          }
        );

        return next;
      }
    );

    setLoadedBoardIds(
      (previous) => {
        const next =
          new Set<string>();

        previous.forEach(
          (boardId) => {
            if (
              currentBoardIds.has(
                boardId
              )
            ) {
              next.add(
                boardId
              );
            }
          }
        );

        return next;
      }
    );
  }, [boards]);

  /* =======================================================
     ALL ASSIGNED TASKS
  ======================================================= */

  const assignedTasks =
    useMemo(() => {
      return boards.flatMap(
        (board) =>
          tasksByBoard[
            board.id
          ] ?? []
      );
    }, [
      boards,
      tasksByBoard,
    ]);

  /* =======================================================
     ACTIVE TASKS
  ======================================================= */

  const activeTasks =
    useMemo(() => {
      return assignedTasks.filter(
        (task) =>
          task.status ===
            "TODO" ||
          task.status ===
            "IN_PROGRESS"
      );
    }, [
      assignedTasks,
    ]);

  /* =======================================================
     COMPLETED TASKS
  ======================================================= */

  const completedTasks =
    useMemo(() => {
      return assignedTasks.filter(
        (task) =>
          task.status ===
          "DONE"
      );
    }, [
      assignedTasks,
    ]);

  /* =======================================================
     TASK LOADING
  ======================================================= */

  const tasksLoading =
    boards.length > 0 &&
    boards.some(
      (board) =>
        !loadedBoardIds.has(
          board.id
        )
    );

  /* =======================================================
     SORT ASSIGNED TASKS
  ======================================================= */

  const sortedAssignedTasks =
    useMemo(() => {
      return [
        ...assignedTasks,
      ].sort(
        (a, b) =>
          new Date(
            b.updatedAt
          ).getTime() -
          new Date(
            a.updatedAt
          ).getTime()
      );
    }, [
      assignedTasks,
    ]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    () => {
      localStorage.removeItem(
        "token"
      );

      dispatch(
        logout()
      );

      router.replace(
        "/login"
      );
    };

  /* =======================================================
     CREATE BOARD
  ======================================================= */

  const handleCreateBoard =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      const name =
        boardName.trim();

      const description =
        boardDescription.trim();

      if (!name) {
        return;
      }

      try {
        await createBoard({
          name,
          description:
            description ||
            undefined,
        }).unwrap();

        setBoardName("");

        setBoardDescription("");

        setShowCreateModal(
          false
        );
      } catch (error) {
        console.error(
          "Create board failed:",
          error
        );
      }
    };

  /* =======================================================
     DELETE BOARD
  ======================================================= */

  const handleDeleteBoard =
    async () => {
      if (!deleteId) {
        return;
      }

      try {
        await deleteBoard(
          deleteId
        ).unwrap();

        setTasksByBoard(
          (previous) => {
            const next = {
              ...previous,
            };

            delete next[
              deleteId
            ];

            return next;
          }
        );

        setLoadedBoardIds(
          (previous) => {
            const next =
              new Set(
                previous
              );

            next.delete(
              deleteId
            );

            return next;
          }
        );

        setDeleteId(null);
      } catch (error) {
        console.error(
          "Delete board failed:",
          error
        );
      }
    };

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (
    !authChecked ||
    !token ||
    meLoading
  ) {
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

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =================================================
          INVISIBLE TASK LOADERS
      ================================================= */}

      {user?.id &&
        boards.map(
          (board) => (
            <BoardTaskLoader
              key={
                board.id
              }
              boardId={
                board.id
              }
              boardName={
                board.name
              }
              userId={
                user.id
              }
              onTasksLoaded={
                handleTasksLoaded
              }
            />
          )
        )}

      {/* =================================================
          NAVBAR
      ================================================= */}

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
                {user?.name ??
                  "User"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email ??
                  ""}
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleLogout
              }
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-red-500 cursor-pointer hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* =================================================
            WELCOME
        ================================================= */}

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
            Manage your boards,
            organize tasks,
            and keep your
            projects moving
            forward.
          </p>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid gap-5 md:grid-cols-3">

          {/* TOTAL BOARDS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Total Boards
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {
                    boards.length
                  }
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                📋
              </div>

            </div>
          </div>

          {/* ACTIVE TASKS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Active Tasks
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {tasksLoading &&
                  assignedTasks.length ===
                    0
                    ? "..."
                    : activeTasks.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10 text-2xl">
                📝
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              TODO + In Progress
            </p>
          </div>

          {/* COMPLETED TASKS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Completed Tasks
                </p>

                <p className="mt-3 text-4xl font-bold">
                  {tasksLoading &&
                  assignedTasks.length ===
                    0
                    ? "..."
                    : completedTasks.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-2xl">
                ✅
              </div>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              Completed assigned
              tasks
            </p>
          </div>

        </div>

        {/* =================================================
            MY ASSIGNED TASKS
        ================================================= */}

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900">

          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-xl font-semibold">
                My Assigned Tasks
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Tasks assigned to
                you across all
                boards.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <span className="rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
                Active{" "}
                {
                  activeTasks.length
                }
              </span>

              <span className="rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
                Completed{" "}
                {
                  completedTasks.length
                }
              </span>

            </div>
          </div>

          {/* TASK CONTENT */}

          <div className="p-6">

            {/* LOADING */}

            {tasksLoading &&
            assignedTasks.length ===
              0 ? (
              <div className="flex flex-col items-center justify-center py-14">

                <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                <p className="mt-4 text-sm text-slate-400">
                  Loading your
                  assigned
                  tasks...
                </p>

              </div>

            ) : assignedTasks.length ===
              0 ? (

              /* EMPTY */

              <div className="rounded-xl border border-dashed border-slate-700 px-6 py-14 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-3xl">
                  📝
                </div>

                <h4 className="mt-5 text-lg font-semibold">
                  No tasks assigned
                  to you
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  When another board
                  member assigns a
                  task to you, it
                  will appear here.
                </p>

              </div>

            ) : (

              /* TASK LIST */

              <div className="space-y-3">

                {sortedAssignedTasks.map(
                  (task) => (
                    <div
                      key={
                        task.id
                      }
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700"
                    >

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* TASK INFO */}

                        <div className="min-w-0">

                          <h4 className="truncate font-semibold text-slate-200">
                            {
                              task.title
                            }
                          </h4>

                          {task.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                              {
                                task.description
                              }
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">

                            {/* BOARD */}

                            <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                              📋{" "}
                              {
                                task.boardName
                              }
                            </span>

                            {/* PRIORITY */}

                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                task.priority ===
                                "HIGH"
                                  ? "bg-red-500/10 text-red-400"
                                  : task.priority ===
                                    "MEDIUM"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-green-500/10 text-green-400"
                              }`}
                            >
                              {
                                task.priority
                              }
                            </span>

                          </div>

                        </div>

                        {/* RIGHT SIDE */}

                        <div className="flex shrink-0 items-center gap-3">

                          {/* STATUS */}

                          {task.status ===
                          "DONE" ? (

                            <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
                              ✓
                              Completed
                            </span>

                          ) : task.status ===
                            "IN_PROGRESS" ? (

                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
                              In
                              Progress
                            </span>

                          ) : (

                            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
                              To Do
                            </span>

                          )}

                          {/* OPEN BOARD */}

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/board/${task.boardId}`
                              )
                            }
                            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500 cursor-pointer hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            Open
                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        </div>

        {/* =================================================
            YOUR BOARDS
        ================================================= */}

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900">

          {/* HEADER */}

          <div className="flex flex-col gap-4 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-xl font-semibold">
                Your Boards
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Create and manage
                your Kanban boards.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateModal(
                  true
                )
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-700 cursor-pointer"
            >
              + Create Board
            </button>

          </div>

          {/* BOARD CONTENT */}

          <div className="p-6">

            {/* LOADING */}

            {boardsLoading && (
              <div className="flex flex-col items-center justify-center py-16">

                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                <p className="mt-4 text-sm text-slate-400">
                  Loading your
                  boards...
                </p>

              </div>
            )}

            {/* ERROR */}

            {!boardsLoading &&
              boardsError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">

                  <p className="text-red-400">
                    Failed to load
                    boards.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      refetchBoards()
                    }
                    className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 cursor-pointer"
                  >
                    Try Again
                  </button>

                </div>
              )}

            {/* EMPTY */}

            {!boardsLoading &&
              !boardsError &&
              boards.length ===
                0 && (
                <div className="rounded-xl border border-dashed border-slate-700 px-6 py-16 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-3xl">
                    📋
                  </div>

                  <h4 className="mt-5 text-lg font-semibold">
                    No boards yet
                  </h4>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Create your first
                    Kanban board and
                    start organizing
                    your tasks.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowCreateModal(
                        true
                      )
                    }
                    className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Create Your
                    First Board
                  </button>

                </div>
              )}

            {/* BOARDS */}

            {!boardsLoading &&
              !boardsError &&
              boards.length >
                0 && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  {boards.map(
                    (board) => (
                      <div
                        key={
                          board.id
                        }
                        className="group rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:-translate-y-1 hover:border-blue-500/50"
                      >

                        {/* TOP */}

                        <div className="flex items-start justify-between">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                            📋
                          </div>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteId(
                                board.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-600 transition hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                            title="Delete board"
                          >
                            🗑️
                          </button>

                        </div>

                        {/* BOARD NAME */}

                        <h4 className="mt-5 truncate text-lg font-semibold">
                          {
                            board.name
                          }
                        </h4>

                        {/* DESCRIPTION */}

                        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                          {
                            board.description ||
                            "No description provided."
                          }
                        </p>

                        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                              Board Owner
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-200">
                              {board.owner?.name ?? "Unknown"}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {board.owner?.email ?? "No email"}
                            </p>
                          </div>

                        {/* OPEN */}

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/board/${board.id}`
                            )
                          }
                          className="mt-5 w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-blue-500 cursor-pointer hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          Open Board →
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

          </div>
        </div>

      </section>

      {/* =================================================
          CREATE BOARD MODAL
      ================================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            {/* HEADER */}

            <div className="mb-6 flex items-start justify-between">

              <div>
                <h3 className="text-xl font-semibold">
                  Create New Board
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Start a new
                  project board.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(
                    false
                  );

                  setBoardName("");

                  setBoardDescription(
                    ""
                  );
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 cursor-pointer hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleCreateBoard
              }
              className="space-y-5"
            >

              {/* NAME */}

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
                  value={
                    boardName
                  }
                  onChange={(e) =>
                    setBoardName(
                      e.target
                        .value
                    )
                  }
                  placeholder="e.g. Website Redesign"
                  autoFocus
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* DESCRIPTION */}

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
                  value={
                    boardDescription
                  }
                  onChange={(e) =>
                    setBoardDescription(
                      e.target
                        .value
                    )
                  }
                  placeholder="What is this board for?"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(
                      false
                    );

                    setBoardName("");

                    setBoardDescription(
                      ""
                    );
                  }}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isCreating ||
                    !boardName.trim()
                  }
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* =================================================
          DELETE BOARD MODAL
      ================================================= */}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

            {/* ICON */}

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
              ⚠️
            </div>

            {/* TEXT */}

            <h3 className="mt-5 text-center text-xl font-semibold">
              Delete Board?
            </h3>

            <p className="mt-2 text-center text-sm leading-6 text-slate-400">
              This action
              cannot be
              undone. Are you
              sure you want to
              delete this
              board?
            </p>

            {/* BUTTONS */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeleteId(
                    null
                  )
                }
                className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteBoard
                }
                disabled={
                  isDeleting
                }
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-700 cursor-pointer disabled:opacity-50"
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
 