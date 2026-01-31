import { useEffect, useState } from "react";

export default function PasteView({ id }) {
  const [theme, setTheme] = useState("dark");
  const [content, setContent] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Initial fetch (no password)
  useEffect(() => {
    fetchPaste();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPaste(pwd) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/pastes/${id}`, {
        method: pwd ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: pwd ? JSON.stringify({ password: pwd }) : undefined,
      });

      if (res.status === 401) {
        setContent(null);
        setError("Password required");
        return;
      }

      if (!res.ok) {
        setError("Paste not found or expired");
        return;
      }

      const data = await res.json();
      setContent(data.content);
    } catch {
      setError("Failed to load paste");
    } finally {
      setLoading(false);
    }
  }

  function unlockPaste(e) {
    e.preventDefault();
    fetchPaste(password);
  }

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

        {/* PASSWORD REQUIRED */}
        {content === null && error === "Password required" && (
          <form onSubmit={unlockPaste} style={styles.passwordBox}>
            <p style={{ ...styles.passwordText, color: t.subtext }}>
              This paste is password protected
            </p>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                background: t.inputBg,
                color: t.text,
                borderColor: t.border,
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={styles.button}
            >
              {loading ? "Unlocking…" : "Unlock Paste"}
            </button>
            {error && error !== "Password required" && (
              <p style={styles.error}>{error}</p>
            )}
          </form>
        )}

        {/* CONTENT */}
        {content && (
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
        )}

        {/* OTHER ERRORS */}
        {!content && error && error !== "Password required" && (
          <p style={styles.error}>{error}</p>
        )}
      </main>
    </div>
  );
}

/* ---------- SERVER SIDE ---------- */

export async function getServerSideProps({ params }) {
  return {
    props: {
      id: params.id,
    },
  };
}

/* ---------- THEMES ---------- */

const dark = {
  background: "radial-gradient(circle at top, #0f172a, #020617)",
  card: "#0f172a",
  inputBg: "#020617",
  text: "#e5e7eb",
  subtext: "#94a3b8",
  border: "#1e293b",
};

const light = {
  background: "linear-gradient(#f8fafc, #e5e7eb)",
  card: "#ffffff",
  inputBg: "#f1f5f9",
  text: "#020617",
  subtext: "#475569",
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

  passwordBox: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  passwordText: {
    fontSize: "14px",
  },

  input: {
    borderRadius: "10px",
    padding: "10px 12px",
    border: "1px solid",
  },

  button: {
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    border: "none",
    borderRadius: "12px",
    padding: "12px",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
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

  error: {
    marginTop: "12px",
    color: "#ef4444",
    fontSize: "14px",
  },
};
