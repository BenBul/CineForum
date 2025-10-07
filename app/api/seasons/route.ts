import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../_lib/supabase";
import {
  SeasonListResponse,
  SeasonResponse,
  seasonCreateInput,
} from "../../../packages/api/schemas";

/**
 * List all seasons
 * @description Fetches all seasons ordered by id
 * @response SeasonListResponse
 * @openapi
 */
export async function GET(_request: NextRequest) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("id");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * Create a new season
 * @description Creates a season with name and fk_series
 * @body seasonCreateInput
 * @response SeasonResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const { name, fk_series } = (await request.json().catch(() => ({}))) as {
    name?: string;
    fk_series?: number;
  };
  if (!name)
    return NextResponse.json({ error: "name is required" }, { status: 422 });
  if (!Number.isFinite(Number(fk_series)))
    return NextResponse.json(
      { error: "fk_series is required" },
      { status: 422 }
    );
  // Ensure referenced series exists; return 404 if not found
  const parent = await supabase
    .from("series")
    .select("id")
    .eq("id", Number(fk_series))
    .maybeSingle();
  if (parent.error)
    return NextResponse.json({ error: parent.error.message }, { status: 500 });
  if (!parent.data)
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  const { data, error } = await supabase
    .from("seasons")
    .insert([{ name, fk_series: Number(fk_series) }])
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
