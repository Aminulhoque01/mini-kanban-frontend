"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout, setCredentials } from "@/redux/features/auth/authSlice";
import { useGetMeQuery } from "@/redux/features/auth/authApi";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user, token } = useAppSelector((state) => state.auth);

  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token,
  });

  // Check token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      router.replace("/login");
    }
  }, [router]);

  // Set user after /me request
  useEffect(() => {
    if (data?.data && token) {
      dispatch(
        setCredentials({
          user: data.data,
          token,
        })
      );
    }
  }, [data, token, dispatch]);

  // Invalid token
  useEffect(() => {
    if (isError) {
      localStorage.removeItem("token");
      dispatch(logout());
      router.replace("/login");
    }
  }, [isError, dispatch, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Mini Kanban
            </h1>

            <p className="text-sm text-slate-400">
              Project Management Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your boards, tasks and projects from here.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total Boards
            </p>

            <p className="mt-3 text-4xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Active Tasks
            </p>

            <p className="mt-3 text-4xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Completed Tasks
            </p>

            <p className="mt-3 text-4xl font-bold">
              0
            </p>
          </div>
        </div>

        {/* Boards */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Your Boards
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Create and manage your Kanban boards.
              </p>
            </div>

            <button
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold hover:bg-blue-700"
            >
              + Create Board
            </button>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-slate-700 p-12 text-center">
            <div className="text-5xl">
              📋
            </div>

            <h4 className="mt-4 text-lg font-semibold">
              No boards yet
            </h4>

            <p className="mt-2 text-sm text-slate-400">
              Create your first board to start managing tasks.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}