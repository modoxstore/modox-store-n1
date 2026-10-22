
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("ozon_cities")
    .select("city_id,name,delivered_price")
    .order("name", { ascending: true })
    .limit(1000);

  if (error) {
    console.error("Ozon cities error:", error.message);
    return NextResponse.json(
      { error: "Unable to load cities" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { cities: data ?? [] },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
