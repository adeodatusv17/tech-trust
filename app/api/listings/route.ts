import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, title, description, category, price, budget, images, contact_name, contact_number } = body;

    const { data, error } = await supabase.from("listings").insert([
      {
        type,
        title,
        description,
        category,
        price,
        budget,
        images,
        contact_name,
        contact_number,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
