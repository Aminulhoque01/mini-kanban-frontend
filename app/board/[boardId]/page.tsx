"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Plus,
  X,
  Users,
  UserPlus,
  Trash2,
  Search,
  Check,
  AlertCircle,
} from "lucide-react";

import { useGetBoardQuery } from "@/redux/features/board/boardApi";

import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/redux/features/task/taskApi";

import {
  useGetColumnsQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
} from "@/redux/features/column/columnApi";

import {
  useGetBoardMembersQuery,
  useAddBoardMemberMutation,
  useRemoveBoardMemberMutation,
  
} from "@/redux/features/board/boardMemberApi";

import {
  useAppDispatch,
  useAppSelector,
} from "@/redux/hooks";

import { setToken } from "@/redux/features/auth/authSlice";

import type { ColumnTask, Column } from "@/types/column";

import KanbanBoard from "@/components/board/KanbanBoard";
import { useGetUsersQuery } from "@/redux/features/auth/authApi";

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const boardId = params.boardId as string;

  // =========================================================
  // AUTH
  // =========================================================

  const token = useAppSelector(
    (state) => state.auth.token
  );

  // =========================================================
  // AUTH HYDRATION
  // =========================================================

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    if (!token) {
      dispatch(setToken(storedToken));
    }
  }, [router, token, dispatch]);

  // =========================================================
  // BOARD
  // =========================================================

  const {
    data: boardData,
    isLoading: boardLoading,
    isError: boardError,
  } = useGetBoardQuery(boardId, {
    skip: !token || !boardId,
  });

  // =========================================================
  // COLUMNS
  // =========================================================

  const {
    data: columnsData,
    isLoading: columnsLoading,
    isError: columnsError,
  } = useGetColumnsQuery(boardId, {
    skip: !token || !boardId,
  });

  // =========================================================
  // BOARD MEMBERS
  // =========================================================

  const {
    data: membersData,
    isLoading: membersLoading,
    isError: membersError,
  } = useGetBoardMembersQuery(boardId, {
    skip: !token || !boardId,
  });

  const [
    addMember,
    {
      isLoading: addingMember,
    },
  ] = useAddBoardMemberMutation();

  const [
    removeMember,
    {
      isLoading: removingMember,
    },
  ] = useRemoveBoardMemberMutation();

  // =========================================================
  // USER SEARCH
  // =========================================================

    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  

  const [memberSearch, setMemberSearch] = useState("");
  const [userPage, setUserPage] = useState(1);

  const {
    data: usersData,
    isLoading: usersLoading,
    isFetching: usersFetching,
    isError: usersError,
  } = useGetUsersQuery(
    {
      page: userPage,
      limit: 10,
      search: memberSearch.trim(),
    },
    {
      skip: !token || !showAddMemberModal,
    }
  );

  // =========================================================
  // TOAST
  // =========================================================

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  // =========================================================
  // MEMBERS STATE
  // =========================================================

  const [
    showMembersModal,
    setShowMembersModal,
  ] = useState(false);



  const [
    removingMemberId,
    setRemovingMemberId,
  ] = useState<string | null>(null);

  // =========================================================
  // COLUMN MUTATIONS
  // =========================================================

  const [
    createColumn,
    {
      isLoading: creatingColumn,
    },
  ] = useCreateColumnMutation();

  const [
    updateColumn,
    {
      isLoading: updatingColumn,
    },
  ] = useUpdateColumnMutation();

  const [
    deleteColumn,
    {
      isLoading: deletingColumn,
    },
  ] = useDeleteColumnMutation();

  // =========================================================
  // COLUMN STATE
  // =========================================================

  const [
    showColumnModal,
    setShowColumnModal,
  ] = useState(false);

  const [
    columnName,
    setColumnName,
  ] = useState("");

  const [
    editingColumnId,
    setEditingColumnId,
  ] = useState<string | null>(null);

  const [
    editingColumnName,
    setEditingColumnName,
  ] = useState("");

  const [
    deletingColumnId,
    setDeletingColumnId,
  ] = useState<string | null>(null);

  // =========================================================
  // TASK CREATE STATE
  // =========================================================

  const [
    showTaskModal,
    setShowTaskModal,
  ] = useState(false);

  const [
    selectedColumnId,
    setSelectedColumnId,
  ] = useState<string | null>(null);

  const [
    taskTitle,
    setTaskTitle,
  ] = useState("");

  const [
    taskDescription,
    setTaskDescription,
  ] = useState("");

  const [
    taskPriority,
    setTaskPriority,
  ] = useState<
    "LOW" | "MEDIUM" | "HIGH"
  >("MEDIUM");

  // =========================================================
  // TASK EDIT STATE
  // =========================================================

  const [
    editingTask,
    setEditingTask,
  ] = useState<ColumnTask | null>(null);

  const [
    editTaskTitle,
    setEditTaskTitle,
  ] = useState("");

  const [
    editTaskDescription,
    setEditTaskDescription,
  ] = useState("");

  const [
    editTaskPriority,
    setEditTaskPriority,
  ] = useState<
    "LOW" | "MEDIUM" | "HIGH"
  >("MEDIUM");

  const [
    editTaskStatus,
    setEditTaskStatus,
  ] = useState<
    "TODO" |
    "IN_PROGRESS" |
    "DONE"
  >("TODO");

  // =========================================================
  // TASK DELETE STATE
  // =========================================================

  const [
    deletingTaskId,
    setDeletingTaskId,
  ] = useState<string | null>(null);

  // =========================================================
  // TASK MUTATIONS
  // =========================================================

  const [
    createTask,
    {
      isLoading: creatingTask,
    },
  ] = useCreateTaskMutation();

  const [
    updateTask,
    {
      isLoading: updatingTask,
    },
  ] = useUpdateTaskMutation();

  const [
    deleteTask,
    {
      isLoading: deletingTask,
    },
  ] = useDeleteTaskMutation();

  // =========================================================
  // DATA
  // =========================================================

  const board = boardData?.data;

  const columns = columnsData?.data ?? [];

  const members = membersData?.data ?? [];
  const users = usersData?.data ?? [];
  const usersPagination = usersData?.pagination;

  const memberUserIds = new Set(
    members.map((member) => member.userId)
  );

  // =========================================================
  // ADD MEMBER
  // =========================================================

  const handleAddMember = async (selectedUserId: string) => {
    if (!selectedUserId) {
      return;
    }

    if (memberUserIds.has(selectedUserId)) {
      setToast({
        type: "error",
        message: "This user is already a member of this board.",
      });
      return;
    }

    try {
      await addMember({
        boardId,
        userId: selectedUserId,
      }).unwrap();

      setToast({
        type: "success",
        message: "Member added successfully.",
      });
    } catch (error: any) {
      console.error("Failed to add member:", error);

      const message =
        error?.data?.message ||
        error?.error ||
        "Failed to add member. Please try again.";

      setToast({
        type: "error",
        message,
      });
    }
  };

  // =========================================================
  // REMOVE MEMBER
  // =========================================================

  const handleRemoveMember = async (
    memberId: string
  ) => {
    try {
      setRemovingMemberId(memberId);

      await removeMember({
        boardId,
        userId: memberId,
      }).unwrap();

      setToast({
        type: "success",
        message: "Member removed successfully.",
      });
    } catch (error: any) {
      console.error("Failed to remove member:", error);

      const message =
        error?.data?.message ||
        error?.error ||
        "Failed to remove member.";

      setToast({
        type: "error",
        message,
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  // =========================================================
  // CREATE COLUMN
  // =========================================================

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

  // =========================================================
  // UPDATE COLUMN
  // =========================================================

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

  // =========================================================
  // DELETE COLUMN
  // =========================================================

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

  // =========================================================
  // OPEN CREATE TASK MODAL
  // =========================================================

  const openCreateTaskModal = (
    columnId: string
  ) => {
    setSelectedColumnId(columnId);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    setShowTaskModal(true);
  };

  // =========================================================
  // CREATE TASK
  // =========================================================

  const handleCreateTask = async () => {
    const title = taskTitle.trim();

    if (!title || !selectedColumnId) {
      return;
    }

    try {
      await createTask({
        boardId,
        columnId: selectedColumnId,
        title,
        description: taskDescription.trim(),
        priority: taskPriority,
      }).unwrap();

      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("MEDIUM");
      setSelectedColumnId(null);
      setShowTaskModal(false);
    } catch (error) {
      console.error(
        "Failed to create task:",
        error
      );
    }
  };

  // =========================================================
  // OPEN EDIT TASK MODAL
  // =========================================================

  const openEditTaskModal = (
    task: ColumnTask
  ) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskDescription(
      task.description ?? ""
    );
    setEditTaskPriority(task.priority);
    setEditTaskStatus(task.status);
  };

  // =========================================================
  // UPDATE TASK
  // =========================================================

  const handleUpdateTask = async () => {
    if (!editingTask) {
      return;
    }

    const title = editTaskTitle.trim();

    if (!title) {
      return;
    }

    try {
      await updateTask({
        taskId: editingTask.id,
        boardId,
        data: {
          title,
          description:
            editTaskDescription.trim(),
          priority: editTaskPriority,
          status: editTaskStatus,
        },
      }).unwrap();

      setEditingTask(null);
      setEditTaskTitle("");
      setEditTaskDescription("");
      setEditTaskPriority("MEDIUM");
      setEditTaskStatus("TODO");
    } catch (error) {
      console.error(
        "Failed to update task:",
        error
      );
    }
  };

  // =========================================================
  // DELETE TASK
  // =========================================================

  const handleDeleteTask = async () => {
    if (!deletingTaskId) {
      return;
    }

    try {
      await deleteTask({
        taskId: deletingTaskId,
        boardId,
      }).unwrap();

      setDeletingTaskId(null);
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error
      );

      alert("Failed to delete task.");
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (
    boardLoading ||
    columnsLoading
  ) {
    return (
      <main className="min-h-screen bg-slate-900 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">

            <div className="h-8 w-48 rounded bg-slate-700" />

            <div className="h-5 w-96 rounded bg-slate-700" />

            <div className="flex gap-5 overflow-hidden">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-96 w-80 shrink-0 rounded-xl bg-slate-800"
                />
              ))}
            </div>

          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (
    boardError ||
    columnsError ||
    !board
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
        <div className="text-center">

          <h1 className="text-xl font-semibold text-white">
            Unable to load board
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            You may not have access to this board.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900"
          >
            Back to Dashboard
          </button>

        </div>
      </main>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");

              router.replace("/login");
            }}
            className="text-sm font-medium text-red-500 transition hover:text-red-400"
          >
            Logout
          </button>

        </div>
      </header>

      {/* =====================================================
          BOARD INFO
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-6 pt-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-white">
              {board.name}
            </h1>

            {board.description && (
              <p className="mt-2 max-w-2xl text-slate-400">
                {board.description}
              </p>
            )}
          </div>

          {/* MEMBERS BUTTON */}

          <button
            type="button"
            onClick={() =>
              setShowMembersModal(true)
            }
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <Users size={18} />

            Members

            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">
              {members.length}
            </span>
          </button>

        </div>

      </section>

      {/* =====================================================
          KANBAN
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-10">

        <div className="flex items-start gap-5">

          <div className="min-w-0 flex-1">

            <KanbanBoard
              columns={columns}

              onAddTask={
                openCreateTaskModal
              }

              onEditColumn={(
                column: Column
              ) => {
                setEditingColumnId(
                  column.id
                );

                setEditingColumnName(
                  column.name
                );
              }}

              onDeleteColumn={(
                columnId: string
              ) => {
                setDeletingColumnId(
                  columnId
                );
              }}

              onEditTask={
                openEditTaskModal
              }

              onDeleteTask={(
                taskId: string
              ) => {
                setDeletingTaskId(
                  taskId
                );
              }}
            />

          </div>

          {/* ADD COLUMN */}

          <button
            type="button"
            onClick={() =>
              setShowColumnModal(true)
            }
            className="flex h-fit w-80 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 p-5 text-sm font-medium text-slate-400 transition hover:border-slate-500 hover:text-white"
          >
            <Plus size={18} />

            Add Column
          </button>

        </div>

      </section>

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast && (
        <div className="fixed right-4 top-4 z-[100] w-full max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-2xl ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            {toast.type === "success" ? (
              <Check
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />
            ) : (
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />
            )}

            <p
              className={`flex-1 text-sm font-medium ${
                toast.type === "success"
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="shrink-0 text-slate-400 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          MEMBERS MODAL
      ===================================================== */}

      {showMembersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowMembersModal(false);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            {/* HEADER */}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Board Members
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage members of this board
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMembersModal(false)}
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* CURRENT MEMBERS */}

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Current Members
                </h3>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {members.length} member
                  {members.length === 1 ? "" : "s"}
                </span>
              </div>

              {membersLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-xl bg-slate-100 p-4"
                    >
                      <div className="h-4 w-40 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-56 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : membersError ? (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  Unable to load board members.
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <Users
                    size={28}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-700">
                    No members yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add a registered user to collaborate on this board.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {members.map((member) => {
                    const memberId = member.userId;
                    const memberName =
                      member.user?.name ?? "Unknown User";
                    const memberEmail =
                      member.user?.email ?? "No email available";

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                            {memberName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {memberName}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {memberEmail}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMember(memberId)
                          }
                          disabled={
                            removingMemberId === memberId
                          }
                          className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={14} />

                          {removingMemberId === memberId
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ADD MEMBER */}

            <button
              type="button"
              onClick={() => {
                setMemberSearch("");
                setUserPage(1);
                setShowAddMemberModal(true);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <UserPlus size={17} />
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          ADD MEMBER MODAL
      ===================================================== */}

      {showAddMemberModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddMemberModal(false);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            {/* HEADER */}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Member
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search registered users and add them to this board.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setMemberSearch("");
                  setUserPage(1);
                }}
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            {/* SEARCH */}

            <div className="relative mt-5">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={memberSearch}
                onChange={(event) => {
                  setMemberSearch(event.target.value);
                  setUserPage(1);
                }}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900"
                autoFocus
              />
            </div>

            {/* USER LIST */}

            <div className="mt-4 min-h-[240px]">
              {usersLoading || usersFetching ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-xl bg-slate-100 p-4"
                    >
                      <div className="h-4 w-44 rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-60 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : usersError ? (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  Unable to load users. Please try again.
                </div>
              ) : users.length === 0 ? (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200">
                  <div className="text-center">
                    <Users
                      size={28}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 text-sm font-medium text-slate-700">
                      No users found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try searching with another name or email.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {users.map((user) => {
                    const alreadyMember = memberUserIds.has(
                      user.id
                    );

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {user.name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {alreadyMember ? (
                          <span className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600">
                            <Check size={14} />
                            Added
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleAddMember(user.id)
                            }
                            disabled={addingMember}
                            className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <UserPlus size={14} />

                            {addingMember
                              ? "Adding..."
                              : "Add"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PAGINATION */}

            {usersPagination &&
              usersPagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={
                      !usersPagination.hasPreviousPage ||
                      usersFetching
                    }
                    onClick={() =>
                      setUserPage((page) => page - 1)
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-xs text-slate-500">
                    Page {usersPagination.page} of{" "}
                    {usersPagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      !usersPagination.hasNextPage ||
                      usersFetching
                    }
                    onClick={() =>
                      setUserPage((page) => page + 1)
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}

            {/* CLOSE */}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setMemberSearch("");
                  setUserPage(1);
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CREATE COLUMN MODAL
      ===================================================== */}

      {showColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold text-slate-900">
                Create Column
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowColumnModal(false);
                  setColumnName("");
                }}
                className="rounded-md p-2 hover:bg-slate-100"
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

                if (e.key === "Escape") {
                  setShowColumnModal(false);
                }
              }}
              placeholder="Column name"
              className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              autoFocus
            />

            <div className="mt-5 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowColumnModal(false);
                  setColumnName("");
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateColumn}
                disabled={
                  creatingColumn ||
                  !columnName.trim()
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingColumn
                  ? "Creating..."
                  : "Create Column"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          RENAME COLUMN MODAL
      ===================================================== */}

      {editingColumnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold text-slate-900">
                Rename Column
              </h2>

              <button
                type="button"
                onClick={() => {
                  setEditingColumnId(null);
                  setEditingColumnName("");
                }}
                className="rounded-md p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

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

                if (e.key === "Escape") {
                  setEditingColumnId(null);
                  setEditingColumnName("");
                }
              }}
              className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              autoFocus
            />

            <div className="mt-5 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setEditingColumnId(null);
                  setEditingColumnName("");
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateColumn}
                disabled={
                  updatingColumn ||
                  !editingColumnName.trim()
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingColumn
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE COLUMN MODAL
      ===================================================== */}

      {deletingColumnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold text-slate-900">
                Delete Column?
              </h2>

              <button
                type="button"
                onClick={() =>
                  setDeletingColumnId(null)
                }
                className="rounded-md p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              This column can only be deleted
              when it has no tasks.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeletingColumnId(null)
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteColumn}
                disabled={deletingColumn}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingColumn
                  ? "Deleting..."
                  : "Delete Column"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          CREATE TASK MODAL
      ===================================================== */}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold text-slate-900">
                Create Task
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedColumnId(null);
                }}
                className="rounded-md p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            <div className="mt-5 space-y-4">

              <input
                value={taskTitle}
                onChange={(e) =>
                  setTaskTitle(e.target.value)
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    taskTitle.trim()
                  ) {
                    handleCreateTask();
                  }
                }}
                placeholder="Task title"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                autoFocus
              />

              <textarea
                value={taskDescription}
                onChange={(e) =>
                  setTaskDescription(
                    e.target.value
                  )
                }
                placeholder="Description (optional)"
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Priority
                </label>

                <select
                  value={taskPriority}
                  onChange={(e) =>
                    setTaskPriority(
                      e.target.value as
                        | "LOW"
                        | "MEDIUM"
                        | "HIGH"
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                >
                  <option value="LOW">
                    Low Priority
                  </option>

                  <option value="MEDIUM">
                    Medium Priority
                  </option>

                  <option value="HIGH">
                    High Priority
                  </option>
                </select>

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedColumnId(null);
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateTask}
                disabled={
                  creatingTask ||
                  !taskTitle.trim()
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingTask
                  ? "Creating..."
                  : "Create Task"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          EDIT TASK MODAL
      ===================================================== */}

      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold text-slate-900">
                Edit Task
              </h2>

              <button
                type="button"
                onClick={() =>
                  setEditingTask(null)
                }
                className="rounded-md p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            <div className="mt-5 space-y-4">

              <input
                value={editTaskTitle}
                onChange={(e) =>
                  setEditTaskTitle(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                placeholder="Task title"
                autoFocus
              />

              <textarea
                value={editTaskDescription}
                onChange={(e) =>
                  setEditTaskDescription(
                    e.target.value
                  )
                }
                placeholder="Description"
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Priority
                </label>

                <select
                  value={editTaskPriority}
                  onChange={(e) =>
                    setEditTaskPriority(
                      e.target.value as
                        | "LOW"
                        | "MEDIUM"
                        | "HIGH"
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                >
                  <option value="LOW">
                    Low Priority
                  </option>

                  <option value="MEDIUM">
                    Medium Priority
                  </option>

                  <option value="HIGH">
                    High Priority
                  </option>
                </select>

              </div>

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={editTaskStatus}
                  onChange={(e) =>
                    setEditTaskStatus(
                      e.target.value as
                        | "TODO"
                        | "IN_PROGRESS"
                        | "DONE"
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                >
                  <option value="TODO">
                    To Do
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="DONE">
                    Done
                  </option>
                </select>

              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setEditingTask(null)
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateTask}
                disabled={
                  updatingTask ||
                  !editTaskTitle.trim()
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingTask
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE TASK MODAL
      ===================================================== */}

      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-semibold text-slate-900">
                Delete Task?
              </h2>

              <button
                type="button"
                onClick={() =>
                  setDeletingTaskId(null)
                }
                className="rounded-md p-2 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Are you sure you want to delete
              this task? This action cannot be
              undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setDeletingTaskId(null)
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={deletingTask}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingTask
                  ? "Deleting..."
                  : "Delete Task"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}