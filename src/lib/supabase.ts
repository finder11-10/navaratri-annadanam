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