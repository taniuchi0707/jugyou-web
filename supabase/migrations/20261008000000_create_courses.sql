-- 授業(courses)テーブルを作成する
-- 設計: docs/DESIGN.md の「courses(授業)」

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  -- 省略したときはログイン中のユーザーのIDが入る
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 1〜100文字、前後に空白がないこと(空白はアプリ側で取り除いてから保存する)
  name text not null check (char_length(name) between 1 and 100 and name = btrim(name)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 同じユーザーは同じ授業名を2回登録できない
  unique (user_id, name)
);

-- 更新したときに updated_at を自動で現在時刻にする
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger courses_set_updated_at
  before update on public.courses
  for each row
  execute function public.set_updated_at();

-- RLS(行レベルセキュリティ)を有効にする
-- 有効にしただけの状態では、誰も1行も読み書きできない。下のポリシーで許可したものだけが通る
alter table public.courses enable row level security;

-- ログイン中のユーザーにだけ、テーブルの操作を許可する(ログインしていない人には許可しない)
grant select, insert, update, delete on public.courses to authenticated;

create policy "自分の授業だけ見られる"
  on public.courses for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "自分の授業だけ追加できる"
  on public.courses for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "自分の授業だけ編集できる"
  on public.courses for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "自分の授業だけ削除できる"
  on public.courses for delete
  to authenticated
  using ((select auth.uid()) = user_id);
