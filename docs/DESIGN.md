# 設計メモ

要件は [REQUIREMENTS.md](REQUIREMENTS.md) を参照。

## データベース

ユーザー情報は Supabase Auth の `auth.users` が管理する。自分で作る表は以下。

### courses(授業)— フェーズ1

| 列 | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK、既定値 `gen_random_uuid()` | 授業ID |
| user_id | uuid | NOT NULL、`auth.users(id)` を参照(ユーザー削除時は一緒に削除) | 持ち主 |
| name | text | NOT NULL、前後の空白を除いて1〜100文字 | 授業名 |
| created_at | timestamptz | NOT NULL、既定値 `now()` | 作成日時 |
| updated_at | timestamptz | NOT NULL、既定値 `now()` | 更新日時 |

- **一意制約:`(user_id, name)`**
  - 同じユーザーは同じ授業名を2回登録できない
  - `name` だけに一意制約をかけると、別のユーザーが同じ名前の授業を登録できなくなるため、`user_id` との組み合わせにする
- 授業名は保存前に前後の空白を取り除く(「英語」と「英語 」を同じものとして扱うため)

### RLS(行レベルセキュリティ)

`courses` のSELECT / INSERT / UPDATE / DELETEすべてに、次の条件をかける。

```
auth.uid() = user_id
```

アプリのコードにバグがあっても、DBが他人の行を返さない・変更させない。

### tasks(タスク)— フェーズ2の予定

- `course_id` は任意(NULL可)。`courses(id)` を参照し、**授業が削除されたときは `ON DELETE SET NULL`**(タスクは残り、ひもづけだけ外れる)
- 授業を削除するとき、ユーザーに「課題も一緒に削除するか」を確認する
  - 削除する場合:授業と、その授業のタスクをまとめて削除する
  - 削除しない場合:授業だけ削除する(タスクはひもづけが外れて残る)
  - 「授業は消えたがタスクの削除だけ失敗した」という中途半端な状態を防ぐため、まとめて削除する処理は**1つのトランザクション**で行う(DB関数として実装する予定)

## 画面

| URL | 画面 | ログイン |
|---|---|---|
| `/` | ログイン済みなら `/courses`、未ログインなら `/login` に移動 | ― |
| `/signup` | 新規登録 | 不要 |
| `/login` | ログイン | 不要 |
| `/courses` | 授業一覧+追加フォーム+削除ボタン | 必要 |
| `/courses/[id]/edit` | 授業名の編集 | 必要 |

- ヘッダーにログアウトボタンを置く
- 削除時は確認ダイアログを出す(フェーズ2以降は、課題も削除するかを選ぶ)
- 同じ授業名を登録しようとしたら「この授業はすでに登録されています」と表示する
- ログイン済みで `/login`・`/signup` を開いたら `/courses` に移動する
- Supabaseのメール認証(Confirm email)はMVPではオフにする

## 認証・認可の仕組み

三重のチェックで、ログインしていない人や他人がデータに触れないようにする。

1. `src/proxy.ts`:ページを開く前に、未ログインなら `/login` へ移動させる(入口での振り分け)
2. `requireUser()`:ログイン必須のページの先頭で、もう一度確認する
3. RLS:DBが「自分の行」以外を返さない・変更させない

- パスワードは8文字以上(サーバー側でも確認する)。ハッシュ化は Supabase Auth が行う
- ログイン失敗時は「メールアドレスまたはパスワードが違います」とだけ返す(登録済みのメールアドレスかどうかを知られないため)

## ディレクトリ構成

Next.js 16(App Router、`src/` あり)。`★` はこれから作る予定のもの。

```
jugyou.web/
├─ docs/                     要件・設計メモ
├─ public/                   そのまま公開する静的ファイル(画像など)
├─ src/
│  ├─ app/                   画面(フォルダ = URL)
│  │  ├─ layout.tsx          全画面共通の枠(ヘッダー、ログアウトボタン)
│  │  ├─ page.tsx            / (/courses へ移動するだけ)
│  │  ├─ globals.css         全体のCSS(Tailwindの読み込み)
│  │  ├─ login/              /login(page.tsx + login-form.tsx)
│  │  ├─ signup/             /signup(page.tsx + signup-form.tsx)
│  │  └─ courses/
│  │     ├─ page.tsx         /courses(★ 一覧・追加・削除はこれから)
│  │     └─ [id]/edit/page.tsx ★ /courses/[id]/edit
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts        ブラウザ用の Supabase クライアント
│  │  │  ├─ server.ts        サーバー用の Supabase クライアント
│  │  │  └─ proxy.ts         ログイン状態の更新とページの振り分け
│  │  ├─ actions/auth.ts     Server Action(新規登録・ログイン・ログアウト)
│  │  └─ auth.ts             ログイン中のユーザーを取得する(getCurrentUser / requireUser)
│  └─ proxy.ts               ページ表示前に必ず動く入口(旧middleware)
├─ supabase/migrations/      テーブル作成・RLSのSQL
├─ .env.example              環境変数の見本(Gitに入れる)
├─ .env.local                SupabaseのURLやキー(Gitに入れない)
├─ package.json              使うパッケージとコマンド
├─ tsconfig.json             TypeScriptの設定
├─ eslint.config.mjs         ESLintの設定
├─ next.config.ts            Next.jsの設定
├─ postcss.config.mjs        Tailwindを動かすための設定
├─ CLAUDE.md / AGENTS.md     AI向けの説明書
└─ .gitignore                Gitに入れないファイルの一覧
```
