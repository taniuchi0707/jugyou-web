"use client";

import { deleteCourse } from "@/lib/actions/courses";

type Props = {
  id: string;
  name: string;
};

export function DeleteCourseButton({ id, name }: Props) {
  // bind で、どの授業を削除するか(id)をあらかじめ渡しておく
  const deleteThisCourse = deleteCourse.bind(null, id);

  return (
    <form
      action={deleteThisCourse}
      onSubmit={(event) => {
        // 「キャンセル」が押されたら送信を止める
        if (!confirm(`「${name}」を削除しますか?`)) event.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 dark:border-red-800"
      >
        削除
      </button>
    </form>
  );
}
