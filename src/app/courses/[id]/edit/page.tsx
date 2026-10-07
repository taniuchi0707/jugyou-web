import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCourse } from "@/lib/courses";
import { EditCourseForm } from "./edit-course-form";

export const metadata: Metadata = {
  title: "授業を編集",
};

export default async function EditCoursePage(
  props: PageProps<"/courses/[id]/edit">,
) {
  await requireUser();
  // URL の [id] の部分を取り出す(例:/courses/abc/edit なら "abc")
  const { id } = await props.params;

  const course = await getCourse(id);
  // 存在しない授業や、他人の授業(RLS で見えない)なら 404 ページを出す
  if (!course) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold">授業を編集</h1>
      <EditCourseForm id={course.id} name={course.name} />
      <Link href="/courses" className="text-sm underline">
        授業一覧に戻る
      </Link>
    </main>
  );
}
