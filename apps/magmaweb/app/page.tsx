export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        color: "#f5f5f5",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
          magmaweb
        </h1>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#e8e1d5",
          }}
        />
      </header>

      {/* Problem Grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#e8e1d5",
              color: "#1a1a1a",
              borderRadius: "12px",
              padding: "12px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                backgroundColor: "#ccc",
                height: "120px",
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            />
            <div style={{ fontWeight: "bold" }}>
              問題 {i + 1}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#b23a48",
                marginTop: "4px",
              }}
            >
              未提出
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

