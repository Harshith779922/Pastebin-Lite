import { useEffect, useState } from "react";

export default function PasteView({ content }) {
  const [theme, setTheme] = useState("dark");

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const t = theme === "dark" ? dark : light;

  return (
    <div style={{ ...styles.page, background: t.background }}>
      <main style={{ ...styles.card, background: t.card, borderColor: t.border }}>
        <div style={styles.header}>
          <h1 style={{ ...styles.title, color: t.text }}>
            Pastebin Lite
          </h1>

          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            style={{ ...styles.themeBtn, color: t.text, borderColor: t.border }}
          >
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        <pre
          style={{
            ...styles.content,
            background: t.inputBg,
            color: t.text,
            borderColor: t.border,
          }}
        >
          {content}
        </pre>
      </main>
    </div>
  );
}

/* ---------- SERVER SIDE (FIXED FOR VERCEL) ---------- */

export async function getServerSideProps({ req, params }) {
  try {
    const protocol =
      req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;

    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(
      `${baseUrl}/api/pastes/${params.id}`
    );

    if (!res.ok) {
      return { notFound: true };
    }

    const data = await res.json();

    return {
      props: {
        content: data.content,
      },
    };
  } catch (error) {
    console.error("SSR error:", error);
    return { notFound: true };
  }
}

/* ---------- THEMES ---------- */

const dark = {
  background: "radial-gradient(circle at top, #0f172a, #020617)",
  card: "#0f172a",
  inputBg: "#020617",
  text: "#e5e7eb",
  border: "#1e293b",
};

const light = {
  background: "linear-gradient(#f8fafc, #e5e7eb)",
  card: "#ffffff",
  inputBg: "#f1f5f9",
  text: "#020617",
  border: "#cbd5f5",
};

/* ---------- STYLES ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    transition: "background 0.3s ease",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "900px",
    borderRadius: "16px",
    padding: "28px",
    border: "1px solid",
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
    transition: "all 0.3s ease",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  title: {
    fontSize: "22px",
    letterSpacing: "-0.4px",
  },

  themeBtn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "12px",
  },

  content: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid",
    fontFamily: "monospace",
    fontSize: "14px",
    lineHeight: "1.6",
    minHeight: "200px",
  },
};
