"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useGetUsersQuery } from "@/redux/features/auth/authApi";

import {
  ArrowLeft,
  Plus,
  X,
  Users,
  UserPlus,
  Trash2,
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
  useReorderColumnMutation,
} from "@/redux/features/column/columnApi";

import {
  useGetBoardMembersQuery,
  useAddBoardMemberMutation,
  useRemoveBoardMemberMutation,
} from "@/redux/features/board/boardMemberApi";

import { useAppSelector } from "@/redux/hooks";

import type { ColumnTask, Column } from "@/types/column";

import KanbanBoard from "@/components/board/KanbanBoard";
import { setToken } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";


// =========================================================
// TYPES
// =========================================================

type Priority = "LOW" | "MEDIUM" | "HIGH";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";

type TaskWithAssignee = ColumnTask & {
  assignee?: {
    id: string;
    name: string;
    email?: string;
  } | null;
};


// =========================================================
// PAGE
// =========================================================

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();

  const boardId = params.boardId as string;

    const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
  } = useGetUsersQuery(
    {
      page: 1,
      limit: 100,
    },
    
  );

  const allUsers = usersData?.data ?? [];



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
    const storedToken =
      localStorage.getItem("token");

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
  // MEMBER STATE
  // =========================================================

  const [
    showMembersModal,
    setShowMembersModal,
  ] = useState(false);

  const [
    showAddMemberModal,
    setShowAddMemberModal,
  ] = useState(false);

  const [
    userId,
    setUserId,
  ] = useState("");

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


  const [
    reorderColumn,
    {
      isLoading: reorderingColumn,
    },
  ] = useReorderColumnMutation();


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
  // CREATE TASK STATE
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
  ] = useState<Priority>("MEDIUM");

  const [
    taskAssigneeId,
    setTaskAssigneeId,
  ] = useState("");


  // =========================================================
  // EDIT TASK STATE
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
  ] = useState<Priority>("MEDIUM");

  const [
    editTaskStatus,
    setEditTaskStatus,
  ] = useState<TaskStatus>("TODO");

  const [
    editTaskAssigneeId,
    setEditTaskAssigneeId,
  ] = useState("");


  // =========================================================
  // DELETE TASK STATE
  // =========================================================

  const [
    deletingTaskId,
    setDeletingTaskId,
  ] = useState<string | null>(null);


  // =========================================================
  // DATA
  // =========================================================

  const board = boardData?.data;

  const columns = columnsData?.data ?? [];

  const members = membersData?.data ?? [];


  // =========================================================
  // ADD MEMBER
  // =========================================================

  const handleAddMember = async (selectedUserId: string) => {
    if (!selectedUserId) return;

    try {
      await addMember({
        boardId,
        userId: selectedUserId,
      }).unwrap();

      toast.success("Member added successfully");
    } catch (error) {
      console.error("Failed to add member:", error);
      toast.error("Failed to add member");
    }
  };


  // =========================================================
  // REMOVE MEMBER
  // =========================================================

  const handleRemoveMember = async (
    memberUserId: string
  ) => {
    try {
      setRemovingMemberId(
        memberUserId
      );

      await removeMember({
        boardId,
        userId: memberUserId,
      }).unwrap();
     
      toast.success("Member remove successfully")


    } catch (error) {
      console.error(
        "Failed to remove member:",
        error
      );

      toast.error(
        "Failed to remove member."
      );

    } finally {
      setRemovingMemberId(null);
    }
  };


  // =========================================================
  // CREATE COLUMN
  // =========================================================

  const handleCreateColumn = async () => {
    const name =
      columnName.trim();

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

      toast.success("column create successfully")

    } catch (error) {
      console.error(
        "Failed to create column:",
        error
      );

      alert(
        "Failed to create column."
      );
    }
  };


  // =========================================================
  // UPDATE COLUMN
  // =========================================================

  const handleUpdateColumn = async () => {
    const name =
      editingColumnName.trim();

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
      toast.success("column rename successfully")

    } catch (error) {
      console.error(
        "Failed to update column:",
        error
      );

      alert(
        "Failed to rename column."
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
  // REORDER COLUMN
  // =========================================================

  const handleReorderColumn = async (
    columnId: string,
    position: number
  ): Promise<void> => {
    try {
      await reorderColumn({
        columnId,
        position,
        boardId,
      }).unwrap();

    } catch (error) {
      console.error(
        "Failed to reorder column:",
        error
      );

      throw error;
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

    setTaskAssigneeId("");

    setShowTaskModal(true);
  };


  // =========================================================
  // CLOSE CREATE TASK MODAL
  // =========================================================

  const closeCreateTaskModal = () => {
    setShowTaskModal(false);

    setSelectedColumnId(null);

    setTaskTitle("");

    setTaskDescription("");

    setTaskPriority("MEDIUM");

    setTaskAssigneeId("");
  };


  // =========================================================
  // CREATE TASK
  // =========================================================

  const handleCreateTask = async () => {
    const title =
      taskTitle.trim();

    if (!title || !selectedColumnId) {
      return;
    }

    try {
      await createTask({
        boardId,
        columnId: selectedColumnId,
        title,
        description:
          taskDescription.trim(),
        priority: taskPriority,
        assigneeId: taskAssigneeId || undefined,
      }).unwrap();
      toast.success("task create successfully")
      closeCreateTaskModal();

    } catch (error) {
      console.error(
        "Failed to create task:",
        error
      );

      alert(
        "Failed to create task."
      );
    }
  };


  // =========================================================
  // OPEN EDIT TASK MODAL
  // =========================================================

  const openEditTaskModal = (
    task: ColumnTask
  ) => {
    const taskWithAssignee =
      task as TaskWithAssignee;

    setEditingTask(task);

    setEditTaskTitle(
      task.title
    );

    setEditTaskDescription(
      task.description ?? ""
    );

    setEditTaskPriority(
      task.priority
    );

    setEditTaskStatus(
      task.status
    );

    setEditTaskAssigneeId(
      taskWithAssignee.assignee?.id ??
        ""
    );
  };


  // =========================================================
  // CLOSE EDIT TASK MODAL
  // =========================================================

  const closeEditTaskModal = () => {
    setEditingTask(null);

    setEditTaskTitle("");

    setEditTaskDescription("");

    setEditTaskPriority("MEDIUM");

    setEditTaskStatus("TODO");

    setEditTaskAssigneeId("");
  };


  // =========================================================
  // UPDATE TASK
  // =========================================================

  const handleUpdateTask = async () => {
    if (!editingTask) {
      return;
    }

    const title =
      editTaskTitle.trim();

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

          priority:
            editTaskPriority,

          status:
            editTaskStatus,

          assigneeId:
            editTaskAssigneeId || null,
        },
      }).unwrap();
      toast.success("Task completed  successfully")

      closeEditTaskModal();

    } catch (error) {
      console.error(
        "Failed to update task:",
        error
      );

      toast.error(
        "Failed to update task."
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

      toast.success("task delete successfully")

    } catch (error) {
      console.error(
        "Failed to delete task:",
        error
      );

      alert(
        "Failed to delete task."
      );
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

              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="h-96 w-80 shrink-0 rounded-xl bg-slate-800"
                  />
                )
              )}

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
            className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:cursor-pointer"
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
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white cursor-pointer"
          >
            <ArrowLeft size={18} />

            Dashboard
          </button>


          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                "token"
              );

              router.replace(
                "/login"
              );
            }}
            className="cursor-pointer text-sm font-medium text-red-500 transition hover:text-red-400 "
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


          <button
            type="button"
            onClick={() =>
              setShowMembersModal(true)
            }
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 cursor-pointer"
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

      <section className="mx-auto max-w-7xl px-6 pb-12">

        <div className="flex items-start gap-8 overflow-x-auto pb-4">

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

              onReorderColumn={
                handleReorderColumn
              }
            />

          </div>


          {/* ADD COLUMN */}

          <button
            type="button"
            onClick={() =>
              setShowColumnModal(true)
            }
            disabled={reorderingColumn}
            className="flex h-fit w-80 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800 p-6 text-sm font-medium text-slate-400 transition hover:border-slate-500 cursor-pointer hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={18} />

            Add Column
          </button>

        </div>

      </section>


      {/* =====================================================
          MEMBERS MODAL
      ===================================================== */}

      {showMembersModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowMembersModal(
                false
              );
            }
          }}
        >

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

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
                onClick={() =>
                  setShowMembersModal(
                    false
                  )
                }
                className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <X size={18} />
              </button>

            </div>


            {/* MEMBER LIST */}

            <div className="mt-6">

              {membersLoading ? (
                <div className="space-y-3">

                  {[1, 2].map(
                    (item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-xl bg-slate-100 p-4"
                      >
                        <div className="h-4 w-40 rounded bg-slate-200" />

                        <div className="mt-2 h-3 w-56 rounded bg-slate-200" />
                      </div>
                    )
                  )}

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
                    Add a member to collaborate on this board.
                  </p>

                </div>

              ) : (

                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">

                  {members.map(
                    (member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <Users size={18} />
                          </div>


                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-900">
                              {member.user.name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {member.user.email}
                            </p>

                          </div>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveMember(
                              member.userId
                            )
                          }
                          disabled={
                            removingMemberId ===
                            member.userId
                          }
                          className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600  transition hover:bg-red-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <Trash2 size={14} />

                          {removingMemberId ===
                          member.userId
                            ? "Removing..."
                            : "Remove"}

                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>


            {/* ADD MEMBER */}

            <button
              type="button"
              onClick={() =>
                setShowAddMemberModal(
                  true
                )
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Member
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select a registered user to add to this board.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-4">
              {usersLoading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Loading registered users...
                </div>
              ) : usersError ? (
                <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
                  Failed to load registered users.
                </div>
              ) : allUsers.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No registered users found.
                </div>
              ) : (
                <div className="space-y-2">
                 {allUsers.map((user) => {
                    const isBoardOwner = board?.ownerId === user.id;

                    const alreadyMember = members.some(
                      (member) => member.userId === user.id
                    );

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          isBoardOwner
                            ? "border-blue-200 bg-blue-50/50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold ${
                              isBoardOwner
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium text-slate-900">
                                {user.name}
                              </p>

                              {isBoardOwner && (
                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                  Admin
                                </span>
                              )}
                            </div>

                            <p className="truncate text-sm text-slate-500">
                              {user.email}
                            </p>
 
                          </div>
                        </div>

                        {isBoardOwner ? (
                          <span className="ml-3 shrink-0 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700">
                            Admin
                          </span>
                        ) : alreadyMember ? (
                          <span className="ml-3 shrink-0 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700">
                            Added
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={addingMember}
                            onClick={() => handleAddMember(user.id)}
                            className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <UserPlus size={15} />
                            {addingMember ? "Adding..." : "Add"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
                  setShowColumnModal(
                    false
                  );

                  setColumnName("");
                }}
                className="rounded-md p-2 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>

            </div>


            <input
              value={columnName}
              onChange={(e) =>
                setColumnName(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter"
                ) {
                  handleCreateColumn();
                }

                if (
                  e.key === "Escape"
                ) {
                  setShowColumnModal(
                    false
                  );
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
                  setShowColumnModal(
                    false
                  );

                  setColumnName("");
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleCreateColumn
                }
                disabled={
                  creatingColumn ||
                  !columnName.trim()
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
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
                  setEditingColumnId(
                    null
                  );

                  setEditingColumnName(
                    ""
                  );
                }}
                className="rounded-md p-2 hover:bg-slate-100 cursor-pointer"
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

                if (
                  e.key === "Enter"
                ) {
                  handleUpdateColumn();
                }

                if (
                  e.key === "Escape"
                ) {
                  setEditingColumnId(
                    null
                  );

                  setEditingColumnName(
                    ""
                  );
                }

              }}
              className="mt-5 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              autoFocus
            />


            <div className="mt-5 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setEditingColumnId(
                    null
                  );

                  setEditingColumnName(
                    ""
                  );
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleUpdateColumn
                }
                disabled={
                  updatingColumn ||
                  !editingColumnName.trim()
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
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
                  setDeletingColumnId(
                    null
                  )
                }
                className="rounded-md p-2 hover:bg-slate-100 cursor-pointer"
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
                  setDeletingColumnId(
                    null
                  )
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleDeleteColumn
                }
                disabled={
                  deletingColumn
                }
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
                onClick={
                  closeCreateTaskModal
                }
                className="rounded-md p-2 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>

            </div>


            <div className="mt-5 space-y-4">

              {/* TITLE */}

              <input
                value={taskTitle}
                onChange={(e) =>
                  setTaskTitle(
                    e.target.value
                  )
                }
                placeholder="Task title"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                autoFocus
              />


              {/* DESCRIPTION */}

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


              {/* PRIORITY */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Priority
                </label>


                <select
                  value={taskPriority}
                  onChange={(e) =>
                    setTaskPriority(
                      e.target.value as Priority
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


              {/* ASSIGNEE */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Assign To
                </label>


                <select
                  value={taskAssigneeId}
                  onChange={(e) =>
                    setTaskAssigneeId(
                      e.target.value
                    )
                  }
                  disabled={
                    membersLoading
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 disabled:bg-slate-100"
                >

                  <option value="">
                    Unassigned
                  </option>


                  {members.map(
                    (member) => (
                      <option
                        key={
                          member.userId
                        }
                        value={
                          member.userId
                        }
                      >
                        {member.user.name}
                        {" — "}
                        {member.user.email}
                      </option>
                    )
                  )}

                </select>


                <p className="mt-1.5 text-xs text-slate-400">
                  Select a board member to assign this task.
                </p>

              </div>

            </div>


            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={
                  closeCreateTaskModal
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleCreateTask
                }
                disabled={
                  creatingTask ||
                  !taskTitle.trim()
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
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
                onClick={
                  closeEditTaskModal
                }
                className="rounded-md p-2 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>

            </div>


            <div className="mt-5 space-y-4">

              {/* TITLE */}

              <input
                value={editTaskTitle}
                onChange={(e) =>
                  setEditTaskTitle(
                    e.target.value
                  )
                }
                placeholder="Task title"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                autoFocus
              />


              {/* DESCRIPTION */}

              <textarea
                value={
                  editTaskDescription
                }
                onChange={(e) =>
                  setEditTaskDescription(
                    e.target.value
                  )
                }
                placeholder="Description"
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />


              {/* PRIORITY */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Priority
                </label>


                <select
                  value={
                    editTaskPriority
                  }
                  onChange={(e) =>
                    setEditTaskPriority(
                      e.target.value as Priority
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


              {/* STATUS */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>


                <select
                  value={
                    editTaskStatus
                  }
                  onChange={(e) =>
                    setEditTaskStatus(
                      e.target.value as TaskStatus
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


              {/* ASSIGNEE */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Assign To
                </label>


                <select
                  value={
                    editTaskAssigneeId
                  }
                  onChange={(e) =>
                    setEditTaskAssigneeId(
                      e.target.value
                    )
                  }
                  disabled={
                    membersLoading
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900 disabled:bg-slate-100"
                >

                  <option value="">
                    Unassigned
                  </option>


                  {members.map(
                    (member) => (
                      <option
                        key={
                          member.userId
                        }
                        value={
                          member.userId
                        }
                      >
                        {member.user.name}
                        {" — "}
                        {member.user.email}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>


            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={
                  closeEditTaskModal
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleUpdateTask
                }
                disabled={
                  updatingTask ||
                  !editTaskTitle.trim()
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
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
                  setDeletingTaskId(
                    null
                  )
                }
                className="rounded-md p-2 hover:bg-slate-100 cursor-pointer"
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
                  setDeletingTaskId(
                    null
                  )
                }
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={
                  handleDeleteTask
                }
                disabled={
                  deletingTask
                }
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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