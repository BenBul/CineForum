import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../_lib/supabase";
import {
  CommentListResponse,
  CommentResponse,
  commentCreateInput,
} from "../../../packages/api/schemas";

/**
 * List all comments
 * @description Fetches all comments ordered by id, with optional filters
 * @response CommentListResponse
 * @openapi
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  let query = supabase.from("comments").select("*");
  const fk_series = searchParams.get("fk_series");
  const fk_season = searchParams.get("fk_season");
  const fk_episode = searchParams.get("fk_episode");
  const fk_user = searchParams.get("fk_user");
  if (fk_series) query = query.eq("fk_series", Number(fk_series));
  if (fk_season) query = query.eq("fk_season", Number(fk_season));
  if (fk_episode) query = query.eq("fk_episode", Number(fk_episode));
  if (fk_user) query = query.eq("fk_user", String(fk_user));
  const { data, error } = await query.order("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * Create a new comment
 * @description Creates a comment with optional FK references and required fk_user
 * @body commentCreateInput
 * @response CommentResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const { fk_series, fk_season, fk_episode, fk_user, text } = (await request
    .json()
    .catch(() => ({}))) as {
    fk_series?: number | null;
    fk_season?: number | null;
    fk_episode?: number | null;
    fk_user?: string;
    text?: string;
  };
  if (!fk_user)
    return NextResponse.json({ error: "fk_user is required" }, { status: 422 });
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        fk_series: fk_series ?? null,
        fk_season: fk_season ?? null,
        fk_episode: fk_episode ?? null,
        fk_user,
        text,
      },
    ])
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}


