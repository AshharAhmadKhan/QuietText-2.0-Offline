import { useState } from "react";
import { callAI, PROMPTS } from "../lib/ai";

export default function AssignmentPanel({ ollamaModel }) {
  const [input,   setInput]   = useState("");
  const [steps,   setSteps]   = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleDecode = async () => {
    const text = input.trim();
    if (text.length === 0) return;
    setLoading(true);
    setError("");
    setSteps([]);
    setChecked({});
    try {
      const result = await callAI({
        ollamaModel,
        system: PROMPTS.assignment,
        prompt: text,
        purpose: 'assignment'
      });
      
      // Extract the YOUR STEPS section
      const stepsMatch = result.match(/YOUR STEPS?:(.*?)(?:TOTAL TIME:|$)/is);
      if (!stepsMatch) {
        throw new Error('Could not find YOUR STEPS section in response');
      }
      
      const stepsText = stepsMatch[1];
      
      // Split by time brackets to find individual steps
      // Pattern: text [about X minutes]
      const stepMatches = stepsText.matchAll(/([^[\]]+)\[about[^\]]+\]/g);
      const stepLines = [];
      let stepNum = 1;
      
      for (const match of stepMatches) {
        const stepText = match[1].trim();
        if (stepText) {
          stepLines.push(`${stepNum}. ${stepText}`);
          stepNum++;
        }
      }
      
      if (stepLines.length === 0) {
        throw new Error('No steps found. Try rephrasing your assignment.');
      }
      setSteps(stepLines);
    } catch (e) {
      setError(e.message || 'Failed to decode assignment');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (i) => setChecked(c => ({ ...c, [i]: true === c[i] ? false : true }));
  const done = Object.values(checked).filter(Boolean).length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
        Assignment Decoder
      </div>
      <p style={{ fontSize: 12, color: "#a88f6b", marginBottom: 14, lineHeight: 1.6 }}>
        Paste your homework or assignment. Get simple steps you can check off one by one.
      </p>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Paste your assignment instructions here..."
        disabled={loading}
        style={{
          width: "100%", minHeight: 110, padding: "10px 12px",
          fontSize: 13, lineHeight: 1.7, fontFamily: "system-ui, sans-serif",
          border: "1px solid #E8E6E1", borderRadius: 8, resize: "vertical",
          outline: "none", color: "#1C1C1E",
          background: loading ? "#F2F0EB" : "#FFFFFF",
          marginBottom: 10,
        }}
      />
      <button
        onClick={handleDecode}
        disabled={loading || input.trim().length === 0}
        style={{
          background: input.trim().length > 0 ? "#3d3428" : "#E8E6E1",
          color: input.trim().length > 0 ? "#F2F0EB" : "#9a9a9f",
          border: "none", borderRadius: 8,
          padding: "10px 22px", fontSize: 13, fontWeight: 600,
          cursor: input.trim().length > 0 ? "pointer" : "not-allowed",
          fontFamily: "system-ui, sans-serif", transition: "all 0.15s",
        }}
      >
        {loading ? "Gemma 4 is decoding..." : "Decode Assignment"}
      </button>
      {error.length > 0 && (
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFF0F0", border: "1px solid #FFCDD2", borderRadius: 8, fontSize: 13, color: "#C62828" }}>
          {error}
        </div>
      )}
      {steps.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Your Steps ({done}/{steps.length} done)
            </span>
            <span style={{ fontSize: 11, color: pct === 100 ? "#10b981" : "#a88f6b", fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: "#E8E6E1", borderRadius: 3, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: pct + "%", background: pct === 100 ? "#10b981" : "#a88f6b", borderRadius: 3, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((step, i) => (
              <div key={i} onClick={() => toggle(i)} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                border: checked[i] ? "1px solid #a5d6a7" : "1px solid #E8E6E1",
                background: checked[i] ? "#f0faf0" : "#FFFFFF",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  border: checked[i] ? "none" : "2px solid #E8E6E1",
                  background: checked[i] ? "#10b981" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {checked[i] && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: 14, lineHeight: 1.6,
                  color: checked[i] ? "#6E6E73" : "#1C1C1E",
                  textDecoration: checked[i] ? "line-through" : "none",
                  fontFamily: "OpenDyslexic, sans-serif",
                  transition: "all 0.15s",
                }}>
                  {step.replace(/^[0-9]+\.\s*/, "")}
                </span>
              </div>
            ))}
          </div>
          {pct === 100 && (
            <div style={{ marginTop: 16, padding: 14, background: "#f0faf0", border: "1px solid #a5d6a7", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🎉</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#2e7d32" }}>All done. Great work.</div>
              <div style={{ fontSize: 12, color: "#6E6E73", marginTop: 4 }}>You completed every step of your assignment.</div>
            </div>
          )}
          <button
            onClick={() => { setSteps([]); setChecked({}); setInput(""); }}
            style={{ marginTop: 14, background: "transparent", border: "1px solid #E8E6E1", borderRadius: 6, padding: "7px 14px", fontSize: 12, color: "#6E6E73", cursor: "pointer", fontFamily: "system-ui, sans-serif" }}
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}