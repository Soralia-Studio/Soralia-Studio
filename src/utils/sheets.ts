import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Định nghĩa các kiểu dữ liệu
export interface TextData {
  text: string;
  timestamp: string;
}

export interface MatchData {
  round: string;
  player1: string;
  player2: string;
  score1: string | number;
  score2: string | number;
  song1?: string;
  song2?: string;
  song3?: string;
  song4?: string;
  timestamp: string;
  matchId?: string;
}

// Khởi tạo service account và doc (để tái sử dụng)
async function getSpreadsheetDoc() {
  try {
    // Initialize Auth with JWT
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEET_ID as string,
      serviceAccountAuth
    );

    // Load document properties and sheets
    await doc.loadInfo();

    return doc;
  } catch (error) {
    console.error("Error initializing spreadsheet:", error);
    throw error;
  }
}

// Hàm cũ - lấy text từ sheet đầu tiên (legacy)
export async function getSheetData(): Promise<TextData> {
  try {
    const doc = await getSpreadsheetDoc();

    // Get the first sheet
    const sheet = doc.sheetsByIndex[0];

    // Get all rows
    const rows = await sheet.getRows();

    // Return the latest row (assuming the newest data is at the bottom)
    if (rows.length > 0) {
      const latestRow = rows[rows.length - 1];
      return {
        text: latestRow.get("text") || "No text available",
        timestamp: latestRow.get("timestamp") || new Date().toISOString(),
      };
    }

    return { text: "No data available", timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    return { text: "Error loading data", timestamp: new Date().toISOString() };
  }
}

// Lấy danh sách tất cả các sheets (vòng đấu)
export async function getAllStages() {
  try {
    const doc = await getSpreadsheetDoc();

    // Trả về mảng các vòng đấu (sheets)
    return doc.sheetsByIndex.map((sheet) => ({
      id: sheet.sheetId,
      title: sheet.title,
      index: sheet.index,
    }));
  } catch (error) {
    console.error("Error fetching stages:", error);
    throw error;
  }
}

// Lấy dữ liệu của một vòng đấu cụ thể (theo sheet index)
export async function getStageMatches(
  stageIndex: number
): Promise<MatchData[]> {
  try {
    const doc = await getSpreadsheetDoc();

    if (stageIndex < 0 || stageIndex >= doc.sheetsByIndex.length) {
      throw new Error(`Stage index ${stageIndex} out of bounds`);
    }

    const sheet = doc.sheetsByIndex[stageIndex];
    const rows = await sheet.getRows();

    return rows.map((row, index) => ({
      round: row.get("round") || "",
      player1: row.get("player1") || "",
      player2: row.get("player2") || "",
      score1: row.get("score1") || "0",
      score2: row.get("score2") || "0",
      song1: row.get("song1") || "",
      song2: row.get("song2") || "",
      song3: row.get("song3") || "",
      song4: row.get("song4") || "",
      timestamp: row.get("timestamp") || new Date().toISOString(),
      matchId: row.get("matchId") || `${stageIndex}-${index}`,
    }));
  } catch (error) {
    console.error(
      `Error fetching matches for stage index ${stageIndex}:`,
      error
    );
    throw error;
  }
}

// Lấy thông tin một trận đấu cụ thể
export async function getMatch(
  stageIndex: number,
  matchId: string
): Promise<MatchData | null> {
  try {
    const matches = await getStageMatches(stageIndex);
    const match = matches.find((m) => m.matchId === matchId);

    return match || null;
  } catch (error) {
    console.error(
      `Error fetching match ${matchId} from stage ${stageIndex}:`,
      error
    );
    throw error;
  }
}

// Thêm trận đấu mới vào một vòng đấu
export async function addMatch(
  stageIndex: number,
  matchData: Omit<MatchData, "timestamp" | "matchId">
) {
  try {
    const doc = await getSpreadsheetDoc();

    if (stageIndex < 0 || stageIndex >= doc.sheetsByIndex.length) {
      throw new Error(`Stage index ${stageIndex} out of bounds`);
    }

    const sheet = doc.sheetsByIndex[stageIndex];

    // Thêm timestamp và matchId
    const timestamp = new Date().toISOString();
    const matchId = `${stageIndex}-${Date.now()}`;

    // Thêm hàng mới
    await sheet.addRow({
      ...matchData,
      timestamp,
      matchId,
    });

    return { ...matchData, timestamp, matchId };
  } catch (error) {
    console.error(`Error adding match to stage ${stageIndex}:`, error);
    throw error;
  }
}

// Cập nhật một trận đấu
export async function updateMatch(
  stageIndex: number,
  matchId: string,
  matchData: Partial<MatchData>
) {
  try {
    const doc = await getSpreadsheetDoc();

    if (stageIndex < 0 || stageIndex >= doc.sheetsByIndex.length) {
      throw new Error(`Stage index ${stageIndex} out of bounds`);
    }

    const sheet = doc.sheetsByIndex[stageIndex];
    const rows = await sheet.getRows();

    // Tìm hàng cần cập nhật
    const rowToUpdate = rows.find((row) => row.get("matchId") === matchId);

    if (!rowToUpdate) {
      throw new Error(
        `Match with id ${matchId} not found in stage ${stageIndex}`
      );
    }

    // Cập nhật các trường
    for (const [key, value] of Object.entries(matchData)) {
      if (value !== undefined) {
        rowToUpdate.set(key, value);
      }
    }

    // Cập nhật timestamp
    rowToUpdate.set("timestamp", new Date().toISOString());

    // Lưu thay đổi
    await rowToUpdate.save();

    return {
      ...Object.fromEntries(
        Object.keys(matchData).map((key) => [key, rowToUpdate.get(key)])
      ),
      matchId,
      timestamp: rowToUpdate.get("timestamp"),
    };
  } catch (error) {
    console.error(
      `Error updating match ${matchId} in stage ${stageIndex}:`,
      error
    );
    throw error;
  }
}

// Tạo một sheet mới (vòng đấu mới)
export async function createStage(title: string) {
  try {
    const doc = await getSpreadsheetDoc();

    // Tạo sheet mới
    const newSheet = await doc.addSheet({
      title,
      headerValues: [
        "round",
        "player1",
        "player2",
        "score1",
        "score2",
        "song1",
        "song2",
        "song3",
        "song4",
        "timestamp",
        "matchId",
      ],
    });

    return {
      id: newSheet.sheetId,
      title: newSheet.title,
      index: newSheet.index,
    };
  } catch (error) {
    console.error(`Error creating new stage ${title}:`, error);
    throw error;
  }
}

// Thêm text vào sheet đầu tiên (cũ - legacy)
export async function addText(text: string) {
  try {
    const doc = await getSpreadsheetDoc();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      text,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding text:", error);
    throw error;
  }
}
