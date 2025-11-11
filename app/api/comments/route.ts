import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../_lib/supabase";
import {
  CommentListResponse,
  CommentResponse,
  commentCreateInput,
} from "../../../packages/api/schemas";
import { getAuthContext, requirePermission } from "../_lib/auth";

/**
 * List all comments
 * @description Fetches all comments ordered by id, with optional filters
 * @response CommentListResponse
 * @openapi
 */
export async function GET(request: NextRequest) {
  // Anyone can view comments (guests, users, admins)
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
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * Create a new comment
 * @description Creates a comment with optional FK references and required fk_user (requires authentication)
 * @body commentCreateInput
 * @response CommentResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request);

  // Users and admins can create comments
  const permissionError = requirePermission(authContext, "create");
  if (permissionError) return permissionError;

  const supabase = getSupabase();
  const { fk_series, fk_season, fk_episode, text, rating } = (await request
    .json()
    .catch(() => ({}))) as {
    fk_series?: number | null;
    fk_season?: number | null;
    fk_episode?: number | null;
    text?: string;
    rating?: number;
  };

  // Always use the authenticated user's ID for the comment
  const fk_user = authContext.userId;
  if (!fk_series && !fk_season && !fk_episode)
    return NextResponse.json(
      { error: "fk_series, fk_season, or fk_episode is required" },
      { status: 422 }
    );
  if (!rating || rating < 1 || rating > 5)
    return NextResponse.json(
      { error: "rating must be between 1 and 5" },
      { status: 422 }
    );
  // Validate optional foreign keys if provided and ensure referenced rows exist
  if (
    typeof fk_series !== "undefined" &&
    fk_series !== null &&
    !Number.isFinite(Number(fk_series))
  )
    return NextResponse.json(
      { error: "fk_series must be an integer" },
      { status: 422 }
    );
  if (
    typeof fk_season !== "undefined" &&
    fk_season !== null &&
    !Number.isFinite(Number(fk_season))
  )
    return NextResponse.json(
      { error: "fk_season must be an integer" },
      { status: 422 }
    );
  if (
    typeof fk_episode !== "undefined" &&
    fk_episode !== null &&
    !Number.isFinite(Number(fk_episode))
  )
    return NextResponse.json(
      { error: "fk_episode must be an integer" },
      { status: 422 }
    );
  if (typeof fk_series !== "undefined" && fk_series !== null) {
    const parent = await supabase
      .from("series")
      .select("id")
      .eq("id", Number(fk_series))
      .maybeSingle();
    if (parent.error)
      return NextResponse.json(
        { error: parent.error.message },
        { status: 500 }
      );
    if (!parent.data)
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
  }
  if (typeof fk_season !== "undefined" && fk_season !== null) {
    const parent = await supabase
      .from("seasons")
      .select("id")
      .eq("id", Number(fk_season))
      .maybeSingle();
    if (parent.error)
      return NextResponse.json(
        { error: parent.error.message },
        { status: 500 }
      );
    if (!parent.data)
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
  }
  if (typeof fk_episode !== "undefined" && fk_episode !== null) {
    const parent = await supabase
      .from("episodes")
      .select("id")
      .eq("id", Number(fk_episode))
      .maybeSingle();
    if (parent.error)
      return NextResponse.json(
        { error: parent.error.message },
        { status: 500 }
      );
    if (!parent.data)
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }
  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        fk_series: typeof fk_series === "undefined" ? null : fk_series,
        fk_season: typeof fk_season === "undefined" ? null : fk_season,
        fk_episode: typeof fk_episode === "undefined" ? null : fk_episode,
        fk_user,
        text,
        rating,
      },
    ])
    .select("*")
    .single();
  if (error) {
    // Translate FK violations to 404 Not Found
    if ((error as any).code === "23503")
      return NextResponse.json(
        { error: "Referenced resource not found" },
        { status: 404 }
      );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
