"use client";

import { useActionState } from "react";
import { updateCourse, type CourseFormState } from "@/lib/actions/courses";
import { MAX_COURSE_NAME_LENGTH } from "@/lib/course-rules";

type Props = {
  id: string;
  name: string;
};

export function EditCourseForm({ id, name }: Props) {
  // bind で、どの授業を更新するか(id)をあらかじめ渡しておく
  const updateThisCourse = updateCourse.bind(null, id);
  const [state, formAction, pending] = useActionState(updateThisCourse, {
    name,
  } satisfies CourseFormState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="course-name" className="text-sm font-medium">
          授業名
        </label>
        <input
          id="course-name"
          name="name"
          type="text"
          required
          maxLength={MAX_COURSE_NAME_LENGTH}
          defaultValue={state.name}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "保存中…" : "保存"}
      </button>
    </form>
  );
}
