import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../_lib/supabase";
import {
  EpisodeListResponse,
  EpisodeResponse,
  episodeCreateInput,
} from "../../schemas";

/**
 * List all episodes
 * @description Fetches all episodes ordered by id
 * @response EpisodeListResponse
 * @openapi
 */
export async function GET(_request: NextRequest) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .order("id");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * Create a new episode
 * @description Creates an episode with name and fk_season
 * @body episodeCreateInput
 * @response EpisodeResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const { name, fk_season, image_url } = (await request
    .json()
    .catch(() => ({}))) as {
    name?: string;
    image_url?: string;
    fk_season?: number;
  };
  if (!name)
    return NextResponse.json({ error: "name is required" }, { status: 422 });
  if (!Number.isFinite(Number(fk_season)))
    return NextResponse.json(
      { error: "fk_season is required" },
      { status: 422 }
    );
  if (typeof image_url !== "undefined" && image_url !== null) {
    if (typeof image_url !== "string" || image_url.trim() === "") {
      return NextResponse.json(
        { error: "image_url must be a valid http/https URL" },
        { status: 422 }
      );
    }
    try {
      const parsed = new URL(image_url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return NextResponse.json(
          { error: "image_url must be a valid http/https URL" },
          { status: 422 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "image_url must be a valid http/https URL" },
        { status: 422 }
      );
    }
  }
  // Ensure referenced season exists; return 404 if not found
  const parent = await supabase
    .from("seasons")
    .select("id")
    .eq("id", Number(fk_season))
    .maybeSingle();
  if (parent.error)
    return NextResponse.json({ error: parent.error.message }, { status: 500 });
  if (!parent.data)
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  const { data, error } = await supabase
    .from("episodes")
    .insert([
      { name, fk_season: Number(fk_season), image_url: image_url || null },
    ])
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
