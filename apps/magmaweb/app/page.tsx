"use client";

import { useState } from "react";

const problems = [
  {
    id: 1,
    text: "ベクトルの内積を用いて角度を求めよ。",
  },
  {
    id: 2,
    text: "三角形ABCが二等辺三角形であることを示せ。",
  },
  {
    id: 3,
    text: "x²-5x+6=0 を解け。",
  },
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const problem = problems[index];

  return (
    <main
      style={{
        backgroundColor: "#0e0e0e",
        color: "#f5f5f5",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "24px",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        Magmaweb
      </div>

      {/* Center */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        {/* Left Arrow */}
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          style={arrowStyle}
        >
          ◀
        </button>

        {/* Problem Card */}
        <div
          style={{
            width: "420px",
            backgroundColor: "#1a1a1a",
            borderRadius: "16px",
            padding: "16px",
            margin: "0 24px",
          }}
        >
          {/* Image placeholder */}
          <div
            style={{
              backgroundColor: "#bbb",
              height: "280px",
              borderRadius: "12px",
              marginBottom: "12px",
            }}
          />

          {/* Text */}
          <p style={{ fontSize: "14px", marginBottom: "16px" }}>
            {problem.text}
          </p>

          {/* Submit */}
          <div
            style={{
              borderTop: "1px solid #333",
              paddingTop: "12px",
              color: "#aaa",
              cursor: "pointer",
            }}
          >
            💬 画像を提出する
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() =>
            setIndex((i) => Math.min(i + 1, problems.length - 1))
          }
          disabled={index === problems.length - 1}
          style={arrowStyle}
        >
          ▶
        </button>
      </div>
    </main>
  );
}

const arrowStyle = {
  background: "none",
  border: "none",
  color: "#aaa",
  fontSize: "24px",
  cursor: "pointer",
  padding: "12px",
};
