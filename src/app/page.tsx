import { redirect } from "next/navigation";

// トップページは授業一覧へ移動するだけ
// ログインしていない場合は、proxy.ts が先に /login へ移動させる
export default function Home() {
  redirect("/courses");
}
