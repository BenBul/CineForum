import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "../_lib/supabase";
import {
  SeriesListResponse,
  SeriesResponse,
  seriesCreateInput,
} from "../../schemas";

/**
 * List all series
 * @description Fetches all series ordered by id
 * @response SeriesListResponse
 * @openapi
 */
export async function GET(_request: NextRequest) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("series").select("*").order("id");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * Create a new series
 * @description Creates a series with name and optional image_url
 * @body seriesCreateInput
 * @response SeriesResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const { name, image_url } = (await request.json().catch(() => ({}))) as {
    name?: string;
    image_url?: string | null;
  };
  if (!name)
    return NextResponse.json({ error: "name is required" }, { status: 422 });
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
  const { data, error } = await supabase
    .from("series")
    .insert([{ name, image_url: image_url || null }])
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
