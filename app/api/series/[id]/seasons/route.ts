import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../../_lib/supabase";
import {
  IdParams,
  SeasonListResponse,
} from "../../../../../packages/api/schemas";

/**
 * List seasons for a series
 * @description Fetches all seasons belonging to a series (hierarchical)
 * @pathParams IdParams
 * @response SeasonListResponse
 * @openapi
 */
export async function GET(_request: NextRequest, context: any) {
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const parent = await supabase
    .from("series")
    .select("id")
    .eq("id", idNum)
    .maybeSingle();
  if (parent.error)
    return NextResponse.json({ error: parent.error.message }, { status: 500 });
  if (!parent.data)
    return NextResponse.json({ error: "Series not found" }, { status: 404 });
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("fk_series", idNum)
    .order("id");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
