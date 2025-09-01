import { NextRequest, NextResponse } from "next/server";
import { getMatch, updateMatch } from "@/utils/sheets";

interface MatchParams {
  params: {
    stageIndex: string;
    matchId: string;
  };
}

// GET để lấy thông tin một trận đấu cụ thể
export async function GET(req: NextRequest, { params }: MatchParams) {
  try {
    const stageIndex = parseInt(params.stageIndex);
    const { matchId } = params;

    if (isNaN(stageIndex) || stageIndex < 0) {
      return NextResponse.json(
        { error: "Invalid stage index" },
        { status: 400 }
      );
    }

    const match = await getMatch(stageIndex, matchId);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch match" },
      { status: 500 }
    );
  }
}

// PUT để cập nhật thông tin của một trận đấu
export async function PUT(req: NextRequest, { params }: MatchParams) {
  try {
    const stageIndex = parseInt(params.stageIndex);
    const { matchId } = params;

    if (isNaN(stageIndex) || stageIndex < 0) {
      return NextResponse.json(
        { error: "Invalid stage index" },
        { status: 400 }
      );
    }

    const updateData = await req.json();
    const updatedMatch = await updateMatch(stageIndex, matchId, updateData);

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
