import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "授業一覧",
};

export default async function CoursesPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">授業一覧</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        {user.email} でログイン中です。授業の登録機能は次に作ります。
      </p>
    </main>
  );
}
