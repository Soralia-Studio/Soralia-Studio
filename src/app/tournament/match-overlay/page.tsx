"use client";

import { useEffect, useState } from "react";

interface MatchData {
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

interface StageInfo {
    id: string;
    title: string;
    index: number;
}

interface CurrentMatchData {
    match: MatchData;
    stage: StageInfo;
}

export default function MatchOverlay() {
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [stageInfo, setStageInfo] = useState<StageInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Các tùy chọn hiển thị
    const [fontSize, setFontSize] = useState(32);
    const [playerFontSize, setPlayerFontSize] = useState(40);
    const [scoreFontSize, setScoreFontSize] = useState(48);
    const [roundFontSize, setRoundFontSize] = useState(28);
    const [songFontSize, setSongFontSize] = useState(24);
    const [textColor, setTextColor] = useState("#ffffff");
    const [playerColor, setPlayerColor] = useState("#ffcc00");
    const [scoreColor, setScoreColor] = useState("#ff3333");
    const [roundColor, setRoundColor] = useState("#33ccff");
    const [textShadow, setTextShadow] = useState("2px 2px 4px rgba(0, 0, 0, 0.8)");
    const [refreshInterval, setRefreshInterval] = useState(5); // seconds
    const [showSongs, setShowSongs] = useState(true);
    const [showRound, setShowRound] = useState(true);

    // Hàm lấy dữ liệu
    const fetchData = async () => {
        try {
            const response = await fetch("/api/tournament/current-match");

            if (!response.ok) {
                if (response.status === 404) {
                    setMatchData(null);
                    setStageInfo(null);
                    setError("Không tìm thấy trận đấu nào");
                    return;
                }
                throw new Error("Failed to fetch match data");
            }

            const data: CurrentMatchData = await response.json();
            setMatchData(data.match);
            setStageInfo(data.stage);
            setError(null);
        } catch (err) {
            console.error("Error fetching match data:", err);
            setError("Lỗi khi tải dữ liệu trận đấu");
        }
    };

    // Thiết lập polling
    useEffect(() => {
        // Fetch initial data
        fetchData();

        // Set up polling interval
        const intervalId = setInterval(() => {
            fetchData();
        }, refreshInterval * 1000);

        // Clean up on unmount
        return () => clearInterval(intervalId);
    }, [refreshInterval]);

    // Xử lý URL parameters
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);

            // Thiết lập từ URL parameters nếu có
            if (params.has("fontSize")) setFontSize(Number(params.get("fontSize")));
            if (params.has("playerFontSize")) setPlayerFontSize(Number(params.get("playerFontSize")));
            if (params.has("scoreFontSize")) setScoreFontSize(Number(params.get("scoreFontSize")));
            if (params.has("roundFontSize")) setRoundFontSize(Number(params.get("roundFontSize")));
            if (params.has("songFontSize")) setSongFontSize(Number(params.get("songFontSize")));
            if (params.has("textColor")) setTextColor(params.get("textColor") as string);
            if (params.has("playerColor")) setPlayerColor(params.get("playerColor") as string);
            if (params.has("scoreColor")) setScoreColor(params.get("scoreColor") as string);
            if (params.has("roundColor")) setRoundColor(params.get("roundColor") as string);
            if (params.has("textShadow")) setTextShadow(params.get("textShadow") as string);
            if (params.has("refreshInterval")) setRefreshInterval(Number(params.get("refreshInterval")));
            if (params.has("showSongs")) setShowSongs(params.get("showSongs") === "true");
            if (params.has("showRound")) setShowRound(params.get("showRound") === "true");
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent"
            style={{ backgroundColor: "transparent", overflow: "hidden" }}>

            {error ? (
                <div style={{
                    fontSize: `${fontSize}px`,
                    color: textColor,
                    textShadow: textShadow,
                    textAlign: "center",
                    width: "100%",
                    padding: "20px"
                }}>
                    {error}
                </div>
            ) : matchData ? (
                <div className="flex flex-col items-center w-full" style={{ backgroundColor: "transparent" }}>
                    {/* Round information */}
                    {showRound && stageInfo && (
                        <div style={{
                            fontSize: `${roundFontSize}px`,
                            color: roundColor,
                            textShadow: textShadow,
                            marginBottom: "10px",
                            textAlign: "center"
                        }}>
                            {stageInfo.title} - {matchData.round}
                        </div>
                    )}

                    {/* Players and scores */}
                    <div className="flex justify-center items-center w-full" style={{ backgroundColor: "transparent" }}>
                        {/* Player 1 */}
                        <div style={{
                            fontSize: `${playerFontSize}px`,
                            color: playerColor,
                            textShadow: textShadow,
                            fontWeight: "bold",
                            textAlign: "right",
                            flex: 1
                        }}>
                            {matchData.player1}
                        </div>

                        {/* Score */}
                        <div style={{
                            fontSize: `${scoreFontSize}px`,
                            color: scoreColor,
                            textShadow: textShadow,
                            fontWeight: "bold",
                            margin: "0 20px",
                            minWidth: `${scoreFontSize * 3}px`,
                            textAlign: "center"
                        }}>
                            {matchData.score1} - {matchData.score2}
                        </div>

                        {/* Player 2 */}
                        <div style={{
                            fontSize: `${playerFontSize}px`,
                            color: playerColor,
                            textShadow: textShadow,
                            fontWeight: "bold",
                            textAlign: "left",
                            flex: 1
                        }}>
                            {matchData.player2}
                        </div>
                    </div>

                    {/* Songs */}
                    {showSongs && (
                        <div className="flex flex-col mt-4" style={{ backgroundColor: "transparent" }}>
                            {matchData.song1 && (
                                <div style={{
                                    fontSize: `${songFontSize}px`,
                                    color: textColor,
                                    textShadow: textShadow,
                                    marginBottom: "5px",
                                    textAlign: "center"
                                }}>
                                    Song 1: {matchData.song1}
                                </div>
                            )}
                            {matchData.song2 && (
                                <div style={{
                                    fontSize: `${songFontSize}px`,
                                    color: textColor,
                                    textShadow: textShadow,
                                    marginBottom: "5px",
                                    textAlign: "center"
                                }}>
                                    Song 2: {matchData.song2}
                                </div>
                            )}
                            {matchData.song3 && (
                                <div style={{
                                    fontSize: `${songFontSize}px`,
                                    color: textColor,
                                    textShadow: textShadow,
                                    marginBottom: "5px",
                                    textAlign: "center"
                                }}>
                                    Song 3: {matchData.song3}
                                </div>
                            )}
                            {matchData.song4 && (
                                <div style={{
                                    fontSize: `${songFontSize}px`,
                                    color: textColor,
                                    textShadow: textShadow,
                                    textAlign: "center"
                                }}>
                                    Song 4: {matchData.song4}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{
                    fontSize: `${fontSize}px`,
                    color: textColor,
                    textShadow: textShadow,
                    textAlign: "center",
                    width: "100%",
                    padding: "20px"
                }}>
                    Đang tải dữ liệu trận đấu...
                </div>
            )}
        </div>
    );
}
