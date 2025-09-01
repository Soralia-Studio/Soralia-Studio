import { NextRequest, NextResponse } from "next/server";
import { addText } from "@/utils/sheets";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Valid text is required" },
        { status: 400 }
      );
    }

    await addText(text);

    return NextResponse.json({
      success: true,
      message: "Text has been updated",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to update text" },
      { status: 500 }
    );
  }
}
