import { NextResponse } from "next/server";
import { getAllStages, getStageMatches } from "@/utils/sheets";

// GET để lấy trận đấu hiện tại (trận mới nhất theo timestamp)
export async function GET() {
  try {
    // Lấy tất cả các vòng đấu
    const stages = await getAllStages();

    let latestMatch = null;
    let latestTimestamp = "";
    let stageInfo = null;

    // Tìm trận đấu mới nhất trong tất cả các vòng
    for (const stage of stages) {
      try {
        const matches = await getStageMatches(stage.index);

        if (matches.length > 0) {
          // Sắp xếp các trận đấu theo timestamp giảm dần
          const sortedMatches = [...matches].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          const newestMatch = sortedMatches[0];

          // Kiểm tra xem đây có phải là trận đấu mới nhất không
          if (
            !latestMatch ||
            new Date(newestMatch.timestamp).getTime() >
              new Date(latestTimestamp).getTime()
          ) {
            latestMatch = newestMatch;
            latestTimestamp = newestMatch.timestamp;
            stageInfo = {
              id: stage.id,
              title: stage.title,
              index: stage.index,
            };
          }
        }
      } catch (error) {
        console.error(
          `Error fetching matches for stage ${stage.index}:`,
          error
        );
      }
    }

    if (!latestMatch) {
      return NextResponse.json({ error: "No matches found" }, { status: 404 });
    }

    return NextResponse.json({
      match: latestMatch,
      stage: stageInfo,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch current match" },
      { status: 500 }
    );
  }
}
