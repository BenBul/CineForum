import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../../_lib/supabase";
import { IdParams, SeriesResponse } from "../../../../packages/api/schemas";

/**
 * Get series by id
 * @description Fetch a single series by id
 * @pathParams IdParams
 * @response SeriesResponse
 * @openapi
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const id = Number(params.id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Series not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Update series
 * @description Partially update series by id
 * @pathParams IdParams
 * @response SeriesResponse
 * @openapi
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const id = Number(params.id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    image_url?: string | null;
  };
  if (!body || (typeof body.name === "undefined" && typeof body.image_url === "undefined")) {
    return NextResponse.json(
      { error: "At least one field to update is required" },
      { status: 422 }
    );
  }
  const update: Record<string, unknown> = {};
  if (typeof body.name !== "undefined") update.name = body.name;
  if (typeof body.image_url !== "undefined") update.image_url = body.image_url;
  const { data, error } = await supabase
    .from("series")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Series not found" }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Delete series
 * @description Delete series by id
 * @pathParams IdParams
 * @openapi
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const id = Number(params.id);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const { data, error } = await supabase
    .from("series")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Series not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}


