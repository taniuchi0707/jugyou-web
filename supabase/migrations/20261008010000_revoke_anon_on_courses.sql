-- ログインしていない人(anon)から、courses テーブルへの権限をすべて取り上げる
-- RLS ですでにブロックされているが、そもそも権限を与えないことで守りを一段増やす(多層防御)
revoke all on public.courses from anon;
