// 授業に関するルール。ブラウザ側(フォーム)とサーバー側の両方から使う
// サーバー専用の処理(Supabase への問い合わせなど)はここに書かないこと

// 授業名の最大文字数(DBの check 制約と合わせる)
export const MAX_COURSE_NAME_LENGTH = 100;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// 授業のIDとして正しい形式(UUID)かどうか
export function isValidCourseId(id: string) {
  return UUID_PATTERN.test(id);
}
