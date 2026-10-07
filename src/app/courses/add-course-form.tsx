"use client";

import { useActionState } from "react";
import { createCourse, type CourseFormState } from "@/lib/actions/courses";
import { MAX_COURSE_NAME_LENGTH } from "@/lib/course-rules";

const initialState: CourseFormState = {};

export function AddCourseForm() {
  const [state, formAction, pending] = useActionState(
    createCourse,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <label htmlFor="course-name" className="text-sm font-medium">
        授業を追加
      </label>
      <div className="flex gap-2">
        <input
          id="course-name"
          name="name"
          type="text"
          required
          maxLength={MAX_COURSE_NAME_LENGTH}
          placeholder="例:線形代数"
          defaultValue={state.name}
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "追加中…" : "追加"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
