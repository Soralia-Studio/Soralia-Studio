import { NextRequest, NextResponse } from "next/server";
import { getStageMatches, addMatch } from "@/utils/sheets";

interface StageParams {
  params: {
    stageIndex: string;
  };
}

// GET để lấy tất cả các trận đấu trong một vòng
export async function GET(req: NextRequest, { params }: StageParams) {
  try {
    const stageIndex = parseInt(params.stageIndex);

    if (isNaN(stageIndex) || stageIndex < 0) {
      return NextResponse.json(
        { error: "Invalid stage index" },
        { status: 400 }
      );
    }

    const matches = await getStageMatches(stageIndex);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

// POST để thêm một trận đấu mới vào vòng đấu
export async function POST(req: NextRequest, { params }: StageParams) {
  try {
    const stageIndex = parseInt(params.stageIndex);

    if (isNaN(stageIndex) || stageIndex < 0) {
      return NextResponse.json(
        { error: "Invalid stage index" },
        { status: 400 }
      );
    }

    const matchData = await req.json();
    const requiredFields = ["round", "player1", "player2"];

    for (const field of requiredFields) {
      if (!matchData[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    const newMatch = await addMatch(stageIndex, matchData);
    return NextResponse.json(newMatch);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to add match" }, { status: 500 });
  }
}
