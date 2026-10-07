import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 各ページの title が「授業一覧 | 授業管理」のようになる
  title: {
    default: "授業管理",
    template: "%s | 授業管理",
  },
  description: "大学の授業・課題を管理するアプリ",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-bold">
              授業管理
            </Link>
            {user && (
              <div className="flex min-w-0 items-center gap-3 text-sm">
                {/* スマホでは幅が足りないので、メールアドレスを隠す */}
                <span className="hidden truncate text-zinc-600 sm:inline dark:text-zinc-400">
                  {user.email}
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-300 px-3 py-1 dark:border-zinc-700"
                  >
                    ログアウト
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
