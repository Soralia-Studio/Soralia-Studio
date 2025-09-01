import { NextResponse } from "next/server";
import { getAllStages, createStage } from "@/utils/sheets";

// GET để lấy tất cả các vòng đấu
export async function GET() {
  try {
    const stages = await getAllStages();
    return NextResponse.json(stages);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stages" },
      { status: 500 }
    );
  }
}

// POST để tạo một vòng đấu mới
export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Stage title is required" },
        { status: 400 }
      );
    }

    const newStage = await createStage(title);
    return NextResponse.json(newStage);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to create stage" },
      { status: 500 }
    );
  }
}
