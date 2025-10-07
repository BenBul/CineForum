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
