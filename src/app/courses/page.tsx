import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCourses } from "@/lib/courses";
import { AddCourseForm } from "./add-course-form";
import { DeleteCourseButton } from "./delete-course-button";

export const metadata: Metadata = {
  title: "授業一覧",
};

export default async function CoursesPage() {
  await requireUser();
  const courses = await getCourses();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-bold">授業一覧</h1>

      <AddCourseForm />

      {courses.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          まだ授業が登録されていません。上のフォームから追加してください。
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {courses.map((course) => (
            // key:React がリストの各行を見分けるための目印
            <li
              key={course.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="min-w-0 break-words">{course.name}</span>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/courses/${course.id}/edit`}
                  className="rounded-md border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700"
                >
                  編集
                </Link>
                <DeleteCourseButton id={course.id} name={course.name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
