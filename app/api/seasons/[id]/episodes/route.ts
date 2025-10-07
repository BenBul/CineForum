import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../../_lib/supabase";
import {
  IdParams,
  EpisodeListResponse,
} from "../../../../../packages/api/schemas";

/**
 * List episodes for a season
 * @description Fetches all episodes belonging to a season (hierarchical)
 * @pathParams IdParams
 * @response EpisodeListResponse
 * @openapi
 */
export async function GET(_request: NextRequest, context: any) {
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const parent = await supabase
    .from("seasons")
    .select("id")
    .eq("id", idNum)
    .maybeSingle();
  if (parent.error)
    return NextResponse.json({ error: parent.error.message }, { status: 500 });
  if (!parent.data)
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("fk_season", idNum)
    .order("id");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
