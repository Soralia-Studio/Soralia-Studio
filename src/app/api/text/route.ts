import { getSheetData } from "@/utils/sheets";
import { NextResponse } from "next/server";

// GET route to fetch the latest text from Google Sheets
export async function GET() {
  try {
    const data = await getSheetData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
