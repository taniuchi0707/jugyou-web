import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
};

// ログイン中のユーザーを返す。ログインしていなければ null
// cache で包むと、1回の表示の中で何度呼んでも Supabase への問い合わせは1回で済む
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: claims.email ?? "" };
});

// ログイン必須のページで使う。ログインしていなければ /login へ移動させる
// proxy.ts でも振り分けているが、念のためページ側でも必ず確認する(二重のチェック)
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
