import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
        <h1 className="text-4xl font-bold text-white">
          Mini Kanban
        </h1>

        <p className="mt-3 text-slate-400">
          Frontend setup is working 🚀
        </p>

      <Link href="/login">
              <button className="cursor-pointer mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700">
                Get Started
              </button>
      </Link>
      </div>
    </main>
  );
}