import { useEffect, useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Persist theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLink("");
    setLoading(true);

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? Number(ttl) : undefined,
          max_views: maxViews ? Number(maxViews) : undefined,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setLink(`${window.location.origin}/p/${data.id}`);
      setContent("");
      setTtl("");
      setMaxViews("");
    } catch {
      setError("Failed to create paste. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
  if (!link) return;

  // Modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(link)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => fallbackCopy(link));
  } else {
    // Fallback
    fallbackCopy(link);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed"; // avoid scrolling
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    alert("Link copied to clipboard!");
  } catch {
    alert("Copy failed. Please copy manually.");
  }

  document.body.removeChild(textarea);
}


  const t = theme === "dark" ? dark : light;

  return (
    <div style={{ ...styles.page, background: t.background }}>
      <main style={{ ...styles.card, background: t.card, borderColor: t.border }}>
        <div style={styles.header}>
          <div>
            <h1 style={{ ...styles.title, color: t.text }}>
              Pastebin Lite
            </h1>
            <p style={{ ...styles.subtitle, color: t.subtext }}>
              Create secure, disposable text pastes
            </p>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{ ...styles.themeBtn, color: t.text, borderColor: t.border }}
          >
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            required
            placeholder="Paste your text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ ...styles.textarea, background: t.inputBg, color: t.text, borderColor: t.border }}
          />

          <div style={styles.row}>
            <input
              type="number"
              placeholder="TTL (seconds)"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              style={{ ...styles.input, background: t.inputBg, color: t.text, borderColor: t.border }}
            />
            <input
              type="number"
              placeholder="Max views"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              style={{ ...styles.input, background: t.inputBg, color: t.text, borderColor: t.border }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating…" : "Create Paste"}
          </button>
        </form>

        {link && (
          <div style={{ ...styles.result, background: t.inputBg, borderColor: t.border }}>
            <span style={{ ...styles.resultLabel, color: t.subtext }}>
              Shareable link
            </span>
            <div style={styles.linkRow}>
              <a href={link} style={{ ...styles.link, color: t.accent }}>
                {link}
              </a>
              <button onClick={copyLink} style={{ ...styles.copyBtn, color: t.text }}>
                Copy
              </button>
            </div>
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}
      </main>
    </div>
  );
}

/* ---------- THEMES ---------- */

const dark = {
  background: "radial-gradient(circle at top, #0f172a, #020617)",
  card: "#0f172a",
  inputBg: "#020617",
  text: "#e5e7eb",
  subtext: "#94a3b8",
  border: "#1e293b",
  accent: "#6366f1",
};

const light = {
  background: "linear-gradient(#f8fafc, #e5e7eb)",
  card: "#ffffff",
  inputBg: "#f1f5f9",
  text: "#020617",
  subtext: "#475569",
  border: "#cbd5f5",
  accent: "#4f46e5",
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
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "720px",
    borderRadius: "16px",
    padding: "32px",
    border: "1px solid",
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
    transition: "all 0.3s ease",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
  },

  title: { fontSize: "28px", marginBottom: "6px" },
  subtitle: { fontSize: "14px" },

  themeBtn: {
    background: "transparent",
    border: "1px solid",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "12px",
  },

  form: { display: "flex", flexDirection: "column", gap: "16px" },

  textarea: {
    minHeight: "220px",
    borderRadius: "12px",
    padding: "14px",
    border: "1px solid",
    fontFamily: "monospace",
    resize: "vertical",
  },

  row: { display: "flex", gap: "12px" },

  input: {
    flex: 1,
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

  result: {
    marginTop: "24px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid",
  },

  resultLabel: { fontSize: "12px", marginBottom: "6px", display: "block" },
  linkRow: { display: "flex", gap: "8px", alignItems: "center" },
  link: { textDecoration: "none", flex: 1 },
  copyBtn: { padding: "6px 10px", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" },

  error: { marginTop: "16px", color: "#ef4444" },
};
