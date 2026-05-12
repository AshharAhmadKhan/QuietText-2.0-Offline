import { useState } from "react";
import { callAI, PROMPTS } from "../lib/ai";

function stripMd(t) {
  return t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").trim();
}

function parseFeedback(text) {
  const result = {};
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  lines.forEach(line => {
    const match = line.match(/^Q([1-5])\s*[:.]\s*(.+)/i);
    if (match) result[parseInt(match[1]) - 1] = match[2].trim();
  });
  return result;
}

export default function ExamPanel({ document: docText, ollamaModel, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [feedback,  setFeedback]  = useState({});
  const [loading,   setLoading]   = useState(false);
  const [checking,  setChecking]  = useState(false);
  const [error,     setError]     = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setFeedback({});
    try {
      const result = await callAI({
        ollamaModel,
        system: PROMPTS.examQuestions,
        purpose: "examQuestions",
        prompt: docText.slice(0, 60000),
      });
      const lines = result.split("\n").map(l => l.trim()).filter(l => /^[0-9]+[.):]/.test(l));
      setQuestions(lines);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswers = async () => {
    setChecking(true);
    setFeedback({});
    setError("");
    try {
      const qas = questions.map((q, i) => ({
        q: q.replace(/^[0-9]+[.):]\s*/, ""),
        a: answers[i] || ""
      }));
      const prompt = qas.map((qa, i) => {
        const ans = qa.a && qa.a.trim().length >= 3 ? qa.a : '(no answer given)';
        return `Q${i + 1}: ${qa.q}\nStudent answer: ${ans}`;
      }).join("\n\n");

      const result = await callAI({
        ollamaModel,
        system: PROMPTS.checkAnswers(docText, qas),
        purpose: "checkAnswers",
        prompt,
      });
      setFeedback(parseFeedback(result));
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  };

  const done      = Object.keys(answers).filter(k => answers[k]?.trim()).length;
  const pct       = questions.length ? Math.round((done / questions.length) * 100) : 0;
  const allDone   = questions.length > 0 && done === questions.length;
  const hasChecked = Object.keys(feedback).length > 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Test Yourself</div>
          <div style={{ fontSize: 12, color: "#a88f6b" }}>5 questions from your document</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "1px solid #E8E6E1", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#6E6E73", cursor: "pointer" }}>Close</button>
      </div>

      {questions.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "32px 20px", background: "#f5f3ef", borderRadius: 12, border: "1px solid #E8E6E1" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1C1C1E", marginBottom: 6 }}>Ready to test your understanding</div>
          <div style={{ fontSize: 13, color: "#6E6E73", marginBottom: 20, lineHeight: 1.6 }}>Gemma 4 will write 5 questions based on your document. Answer them in your own words. Then check how you did.</div>
          <button onClick={generate} style={{ background: "#3d3428", color: "#F2F0EB", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Generate Questions
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 13, color: "#6E6E73", marginBottom: 16 }}>Gemma 4 is writing your questions...</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[100, 85, 92, 78, 88].map((w, i) => (
              <div key={i} className="skeleton" style={{ width: w + "%", height: 14, borderRadius: 6 }} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 14px", background: "#FFF0F0", border: "1px solid #FFCDD2", borderRadius: 8, fontSize: 13, color: "#C62828", marginBottom: 12 }}>{error}</div>
      )}

      {questions.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {done}/{questions.length} answered
            </span>
            <span style={{ fontSize: 11, color: pct === 100 ? "#10b981" : "#a88f6b", fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: "#E8E6E1", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "#10b981" : "#a88f6b", borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {questions.map((q, i) => {
              const fb = feedback[i];
              const isPositive = fb && (fb.toLowerCase().includes("exactly right") || fb.toLowerCase().includes("well done") || fb.toLowerCase().includes("correct") || fb.toLowerCase().includes("yes,") || fb.toLowerCase().includes("great"));
              return (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: 10,
                  border: fb ? (isPositive ? "1px solid #a5d6a7" : "1px solid #ffe082") : "1px solid #E8E6E1",
                  background: fb ? (isPositive ? "#f0faf0" : "#fffde7") : "#FAFAF8",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{ fontSize: 14, fontFamily: "OpenDyslexic, sans-serif", color: "#1C1C1E", lineHeight: 1.7, marginBottom: 10 }}>
                    {stripMd(q.replace(/^[0-9]+[.):]\s*/, ""))}
                  </div>
                  <textarea
                    value={answers[i] || ""}
                    onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                    placeholder="Write your answer here..."
                    disabled={hasChecked}
                    style={{
                      width: "100%", minHeight: 70, padding: "8px 10px",
                      fontSize: 13, lineHeight: 1.6,
                      fontFamily: "OpenDyslexic, sans-serif",
                      border: "1px solid #E8E6E1", borderRadius: 6,
                      resize: "vertical", outline: "none",
                      background: hasChecked ? "#f5f5f5" : "#FFFFFF",
                      color: "#1C1C1E",
                    }}
                  />
                  {fb && (
                    <div style={{
                      marginTop: 10, padding: "10px 12px", borderRadius: 8,
                      background: isPositive ? "#e8f5e9" : "#fff8e1",
                      border: isPositive ? "1px solid #c8e6c9" : "1px solid #ffecb3",
                      fontSize: 13, lineHeight: 1.6,
                      fontFamily: "OpenDyslexic, sans-serif",
                      color: "#1C1C1E"
                    }}>
                      {fb}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {!hasChecked && allDone && (
              <button
                onClick={checkAnswers}
                disabled={checking}
                style={{
                  background: checking ? "#9a9a9f" : "#3d3428",
                  color: "#F2F0EB", border: "none", borderRadius: 8,
                  padding: "11px 24px", fontSize: 14, fontWeight: 600,
                  cursor: checking ? "not-allowed" : "pointer",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {checking ? "Gemma 4 is checking..." : "Check My Answers"}
              </button>
            )}
            {hasChecked && (
              <button
                onClick={generate}
                style={{ background: "#3d3428", color: "#F2F0EB", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
              >
                Try New Questions
              </button>
            )}
            <button
              onClick={() => { setQuestions([]); setAnswers({}); setFeedback({}); }}
              style={{ background: "transparent", border: "1px solid #E8E6E1", borderRadius: 8, padding: "11px 20px", fontSize: 13, color: "#6E6E73", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
