import { isValidCourseId } from "@/lib/course-rules";
import { createClient } from "@/lib/supabase/server";

export type Course = {
  id: string;
  name: string;
};

// ログイン中のユーザーの授業を、登録した順に返す
// 「自分の授業だけ」に絞り込むのは RLS の役目なので、ここでは user_id で絞り込まない
export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .order("created_at", { ascending: true });

  if (error) throw new Error(`授業の取得に失敗しました: ${error.message}`);
  return data;
}

// 授業を1件返す。存在しない、または他人の授業なら null
export async function getCourse(id: string): Promise<Course | null> {
  if (!isValidCourseId(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`授業の取得に失敗しました: ${error.message}`);
  return data;
}
