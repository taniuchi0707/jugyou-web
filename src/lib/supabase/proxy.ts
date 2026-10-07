import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ログインしていなくても開けるページ
const PUBLIC_PATHS = ["/login", "/signup"];

// ページを開くたびに呼ばれ、ログイン状態の更新と、ページの振り分けを行う
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // ログイン状態(トークン)が更新されたら、新しいクッキーをレスポンスに載せてブラウザに返す
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // ログイン情報入りのレスポンスが、他人向けにキャッシュされないようにするヘッダー
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // トークンを検証してログイン中のユーザー情報を取り出す(期限切れが近ければ更新もされる)
  // 注意:createServerClient とこの行の間に、ほかの処理を入れないこと
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (!isLoggedIn && !isPublicPath) {
    return redirectTo(request, "/login", response);
  }
  if (isLoggedIn && isPublicPath) {
    return redirectTo(request, "/courses", response);
  }

  return response;
}

// 別のページへ移動させる。更新されたクッキーは移動先にも引き継ぐ
function redirectTo(request: NextRequest, path: string, from: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  from.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") redirect.headers.set(key, value);
  });
  return redirect;
}
