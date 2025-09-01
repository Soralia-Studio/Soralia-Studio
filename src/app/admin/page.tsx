"use client";

import { useState } from "react";

export default function AdminPage() {
    const [text, setText] = useState("");
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            setStatus("Please enter text to display");
            return;
        }

        setIsLoading(true);
        setStatus("Submitting...");

        try {
            const response = await fetch("/api/text/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error("Failed to save data");
            }

            const result = await response.json();
            setText("");
            setStatus("Text has been updated successfully!");
        } catch (error) {
            console.error("Error saving data:", error);
            setStatus("Error saving text. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Stream Text Admin</h1>
                    <p className="mt-2 text-gray-600">
                        Update the text displayed on your stream overlay
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                            Display Text
                        </label>
                        <textarea
                            id="text"
                            name="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            placeholder="Enter text to display on your stream"
                            disabled={isLoading}
                        ></textarea>
                    </div>

                    {status && (
                        <div
                            className={`text-sm ${status.includes("Error") ? "text-red-600" : "text-green-600"
                                }`}
                        >
                            {status}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                        >
                            {isLoading ? "Updating..." : "Update Display Text"}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Stream Overlay URL:{" "}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Open Stream Display
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
