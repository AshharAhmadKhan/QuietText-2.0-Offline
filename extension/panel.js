const iframe = document.getElementById("qt-iframe");
let pendingText = "";

document.getElementById("qt-close").addEventListener("click", () => {
  window.parent.postMessage({ type: "CLOSE_PANEL" }, "*");
});

document.getElementById("qt-open-tab").addEventListener("click", () => {
  const url = pendingText
    ? "https://quiet-text-2-0-offline.vercel.app/?text=" + encodeURIComponent(pendingText)
    : "https://quiet-text-2-0-offline.vercel.app/";
  window.parent.postMessage({ type: "OPEN_TAB", url }, "*");
});

document.getElementById("qt-toolbar").addEventListener("pointerdown", (e) => {
  if (e.target.closest(".qt-tb-btn")) return;
  window.parent.postMessage({ type: "START_DRAG", mouseX: e.clientX, mouseY: e.clientY }, "*");
  e.preventDefault();
});

window.addEventListener("message", (event) => {
  const msg = event.data;
  if (msg == null) return;
  if (typeof msg !== "object") return;
  if (msg.type === "INIT_PANEL" && msg.text && msg.text.trim()) {
    pendingText = msg.text.trim();
    iframe.src = "https://quiet-text-2-0-offline.vercel.app/?text=" + encodeURIComponent(pendingText);
  }
});