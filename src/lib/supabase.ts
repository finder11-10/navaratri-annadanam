const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getSupabaseData(
  table: string,
  query = ""
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}${query}`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Supabase data");
  }

  return response.json();
}
export async function insertSupabaseData(
  table: string,
  data: Record<string, unknown>
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to insert Supabase data");
  }

  return response.json();
}