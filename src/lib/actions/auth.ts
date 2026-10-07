"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// フォームに返す結果。エラーメッセージと、入力し直さなくて済むようにメールアドレスを返す
export type AuthFormState = {
  error?: string;
  email?: string;
};

const MIN_PASSWORD_LENGTH = 8;

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // ブラウザ側の入力チェックは簡単にすり抜けられるので、サーバーでも必ず確認する
  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください", email };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上にしてください`,
      email,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    switch (error.code) {
      case "user_already_exists":
      case "email_exists":
        return { error: "このメールアドレスはすでに登録されています", email };
      case "email_address_invalid":
        return { error: "メールアドレスの形式が正しくありません", email };
      case "weak_password":
        return { error: "パスワードが弱すぎます。別のパスワードにしてください", email };
      default:
        console.error("signup failed:", error);
        return { error: "登録に失敗しました。時間をおいてもう一度お試しください", email };
    }
  }

  // ヘッダーなど、ログイン状態で表示が変わる部分を作り直す
  revalidatePath("/", "layout");
  redirect("/courses");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください", email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "invalid_credentials") {
      // どちらが違うかは教えない(メールアドレスが登録済みかどうかを、他人に知られないようにするため)
      return { error: "メールアドレスまたはパスワードが違います", email };
    }
    console.error("login failed:", error);
    return { error: "ログインに失敗しました。時間をおいてもう一度お試しください", email };
  }

  revalidatePath("/", "layout");
  redirect("/courses");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
