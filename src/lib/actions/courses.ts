"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isValidCourseId, MAX_COURSE_NAME_LENGTH } from "@/lib/course-rules";
import { createClient } from "@/lib/supabase/server";

export type CourseFormState = {
  error?: string;
  name?: string;
};

// PostgreSQL のエラーコード:一意制約違反(同じ授業名がすでにある)
const UNIQUE_VIOLATION = "23505";

// 入力された授業名を整えてチェックする。問題があればエラーメッセージを返す
function validateName(formData: FormData): { name: string; error?: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { name, error: "授業名を入力してください" };
  if (name.length > MAX_COURSE_NAME_LENGTH) {
    return {
      name,
      error: `授業名は${MAX_COURSE_NAME_LENGTH}文字以内にしてください`,
    };
  }
  return { name };
}

export async function createCourse(
  _prevState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  // Server Action は URL を知っていれば誰でも呼べるので、必ず最初にログインを確認する
  await requireUser();

  const { name, error: validationError } = validateName(formData);
  if (validationError) return { error: validationError, name };

  const supabase = await createClient();
  // user_id は DB の既定値(auth.uid())で、ログイン中のユーザーのIDが入る
  const { error } = await supabase.from("courses").insert({ name });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: "この授業はすでに登録されています", name };
    }
    console.error("createCourse failed:", error);
    return { error: "登録に失敗しました。もう一度お試しください", name };
  }

  revalidatePath("/courses");
  // 成功したら入力欄を空に戻す
  return {};
}

export async function updateCourse(
  id: string,
  _prevState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  await requireUser();

  const { name, error: validationError } = validateName(formData);
  if (validationError) return { error: validationError, name };
  if (!isValidCourseId(id)) return { error: "授業が見つかりません", name };

  const supabase = await createClient();
  // 他人の授業は RLS により更新されない(エラーにはならず 0 件になる)ので、
  // 更新した行を返してもらい、1件も更新されなかったことに気づけるようにする
  const { data, error } = await supabase
    .from("courses")
    .update({ name })
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { error: "この授業はすでに登録されています", name };
    }
    console.error("updateCourse failed:", error);
    return { error: "保存に失敗しました。もう一度お試しください", name };
  }
  if (data.length === 0) {
    return { error: "授業が見つかりません", name };
  }

  revalidatePath("/courses");
  redirect("/courses");
}

export async function deleteCourse(id: string) {
  await requireUser();
  if (!isValidCourseId(id)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) {
    console.error("deleteCourse failed:", error);
    throw new Error("授業の削除に失敗しました");
  }

  revalidatePath("/courses");
}
