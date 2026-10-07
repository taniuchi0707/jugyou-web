import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// サーバー側(Server Component / Server Action)で使う Supabase クライアント
// ログイン状態はクッキーに保存されるので、Next.js のクッキーを読み書きできるようにして渡す
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component からはクッキーを書き込めないため、ここで例外になる。
            // ログイン状態の更新は proxy.ts(認証機能で追加予定)が担当するので無視してよい。
          }
        },
      },
    },
  );
}
