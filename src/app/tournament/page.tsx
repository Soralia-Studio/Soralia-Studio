"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stage {
    id: string;
    title: string;
    index: number;
    matchCount?: number;
}

export default function TournamentAdminPage() {
    const [stages, setStages] = useState<Stage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newStageTitle, setNewStageTitle] = useState("");

    // Lấy danh sách vòng đấu
    const fetchStages = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/tournament/stages");

            if (!response.ok) {
                throw new Error("Failed to fetch stages");
            }

            const data = await response.json();
            setStages(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching stages:", err);
            setError("Failed to load tournament stages");
        } finally {
            setLoading(false);
        }
    };

    // Tạo vòng đấu mới
    const createStage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newStageTitle.trim()) {
            setError("Stage title is required");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/tournament/stages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: newStageTitle }),
            });

            if (!response.ok) {
                throw new Error("Failed to create stage");
            }

            // Làm mới danh sách
            await fetchStages();
            setNewStageTitle("");
            setError(null);
        } catch (err) {
            console.error("Error creating stage:", err);
            setError("Failed to create new stage");
        } finally {
            setLoading(false);
        }
    };

    // Lấy dữ liệu khi trang load
    useEffect(() => {
        fetchStages();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý Giải Đấu</h1>
                    <div className="flex gap-4">
                        <Link
                            href="/admin"
                            className="text-blue-600 hover:underline"
                        >
                            Quay lại Trang Admin
                        </Link>
                        <Link
                            href="/tournament/matches"
                            className="text-blue-600 hover:underline"
                        >
                            Quản lý Trận đấu
                        </Link>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Danh sách vòng đấu */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Các Vòng Đấu</h2>

                            {loading ? (
                                <p>Đang tải...</p>
                            ) : stages.length === 0 ? (
                                <p className="text-gray-500">Chưa có vòng đấu nào. Vui lòng tạo vòng đấu.</p>
                            ) : (
                                <div className="space-y-4">
                                    {stages.map((stage) => (
                                        <div
                                            key={stage.id}
                                            className="p-4 border border-gray-200 rounded flex justify-between items-center"
                                        >
                                            <div>
                                                <h3 className="font-medium">{stage.title}</h3>
                                                <p className="text-sm text-gray-500">Sheet ID: {stage.id}</p>
                                                {stage.matchCount !== undefined && (
                                                    <p className="text-sm text-gray-500">
                                                        {stage.matchCount} trận đấu
                                                    </p>
                                                )}
                                            </div>
                                            <Link
                                                href={`/tournament/stages/${stage.index}`}
                                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                Quản lý
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form tạo vòng đấu mới */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Tạo Vòng Đấu Mới</h2>
                            <form onSubmit={createStage}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="stageTitle"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Tên Vòng Đấu
                                    </label>
                                    <input
                                        type="text"
                                        id="stageTitle"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Top 16, Tứ kết, Chung kết..."
                                        value={newStageTitle}
                                        onChange={(e) => setNewStageTitle(e.target.value)}
                                        disabled={loading}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Mỗi vòng đấu sẽ tạo một sheet mới trong Google Sheets
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {loading ? "Đang tạo..." : "Tạo Vòng Đấu"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
