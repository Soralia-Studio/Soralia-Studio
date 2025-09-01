"use client";

import { useEffect, useState } from "react";

interface TextData {
  text: string;
  timestamp: string;
}

export default function Home() {
  const [textData, setTextData] = useState<TextData>({ text: "Loading...", timestamp: "" });
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontStyle, setFontStyle] = useState("normal");
  const [fontWeight, setFontWeight] = useState("bold");
  const [textShadow, setTextShadow] = useState("2px 2px 4px rgba(0, 0, 0, 0.5)");
  const [refreshInterval, setRefreshInterval] = useState(5); // seconds

  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      const response = await fetch("/api/text");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setTextData(data);
      setError(null);
    } catch (err) {
      setError("Error fetching text data");
      console.error("Error fetching data:", err);
    }
  };

  // Initialize and set up interval for data refresh
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up interval for refreshing data
    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Parse URL parameters if any are provided
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      // Update settings from URL parameters if provided
      if (params.has("fontSize")) setFontSize(Number(params.get("fontSize")));
      if (params.has("textColor")) setTextColor(params.get("textColor") as string);
      if (params.has("fontStyle")) setFontStyle(params.get("fontStyle") as string);
      if (params.has("fontWeight")) setFontWeight(params.get("fontWeight") as string);
      if (params.has("textShadow")) setTextShadow(params.get("textShadow") as string);
      if (params.has("refreshInterval")) setRefreshInterval(Number(params.get("refreshInterval")));
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent"
      style={{ backgroundColor: "transparent", overflow: "hidden" }}>
      <div
        style={{
          fontSize: `${fontSize}px`,
          color: textColor,
          fontStyle: fontStyle,
          fontWeight: fontWeight,
          textShadow: textShadow,
          textAlign: "center",
          width: "100%",
          padding: "20px",
          backgroundColor: "transparent"
        }}
      >
        {error ? error : textData.text}
      </div>
    </div>
  );
}
