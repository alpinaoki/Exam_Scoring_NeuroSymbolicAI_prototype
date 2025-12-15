export default function Home() {
  return (
    <main
      style={{
        backgroundColor: "#0e0e0e",
        color: "#f5f5f5",
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        {/* Header */}
        <h1 style={{ textAlign: "center", marginBottom: "24px" }}>
          magmaweb
        </h1>

        {/* Story-like problem */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "24px",
          }}
        >
          {/* Problem Image */}
          <div
            style={{
              backgroundColor: "#ccc",
              height: "300px",
              borderRadius: "12px",
              marginBottom: "12px",
            }}
          />

          {/* Caption */}
          <p style={{ marginBottom: "16px", fontSize: "14px" }}>
            ベクトルの内積を用いて角度を求めよ。
          </p>

          {/* Comment-like submit */}
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
      </div>
    </main>
  );
}
