import { NextResponse } from "next/server";
import { getAllStages, getStageMatches, getMatch } from "@/utils/sheets";

// GET để lấy thông tin tổng quan về giải đấu (tất cả các vòng đấu và số trận)
export async function GET() {
  try {
    // Lấy tất cả các vòng đấu
    const stages = await getAllStages();

    // Tạo một mảng promise để lấy số trận đấu trong mỗi vòng
    const stagesWithMatchCountPromises = stages.map(async (stage) => {
      try {
        const matches = await getStageMatches(stage.index);
        return {
          ...stage,
          matchCount: matches.length,
          latestMatch: matches.length > 0 ? matches[matches.length - 1] : null,
        };
      } catch (error) {
        console.error(
          `Error fetching matches for stage ${stage.index}:`,
          error
        );
        return {
          ...stage,
          matchCount: 0,
          latestMatch: null,
          error: "Failed to fetch matches",
        };
      }
    });

    // Đợi tất cả các promise hoàn thành
    const stagesWithMatchCount = await Promise.all(
      stagesWithMatchCountPromises
    );

    return NextResponse.json({
      stages: stagesWithMatchCount,
      totalStages: stages.length,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournament data" },
      { status: 500 }
    );
  }
}
