import { query } from "../client";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  locale: string;
  timezone: string;
  created_at: Date;
}

export async function getUserById(
  userId: string
): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    `
    SELECT
      id,
      name,
      email,
      phone,
      locale,
      timezone,
      created_at
    FROM users
    WHERE id = $1
    `,
    [userId]
  );
  return rows[0] ?? null;
}