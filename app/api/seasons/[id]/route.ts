import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../_lib/supabase";
import { IdParams, SeasonResponse } from "../../../../packages/api/schemas";

/**
 * Get season by id
 * @description Fetch a single season by id
 * @pathParams IdParams
 * @response SeasonResponse
 * @openapi
 */
export async function GET(_request: NextRequest, context: any) {
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("id", idNum)
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Update season
 * @description Partially update season by id
 * @pathParams IdParams
 * @response SeasonResponse
 * @openapi
 */
export async function PUT(request: NextRequest, context: any) {
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    fk_series?: number;
  };
  const update: Record<string, unknown> = {};
  if (typeof body.name !== "undefined") update.name = body.name;
  if (typeof body.fk_series !== "undefined")
    update.fk_series = Number(body.fk_series);
  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "At least one field to update is required" },
      { status: 422 }
    );
  }
  const { data, error } = await supabase
    .from("seasons")
    .update(update)
    .eq("id", idNum)
    .select("*")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Delete season
 * @description Delete season by id
 * @pathParams IdParams
 * @openapi
 */
export async function DELETE(_request: NextRequest, context: any) {
  const { id } = await context.params;
  const supabase = getSupabase();
  const idNum = Number(id);
  if (!Number.isFinite(idNum))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { data, error } = await supabase
    .from("seasons")
    .delete()
    .eq("id", idNum)
    .select("id")
    .maybeSingle();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data)
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
