function showTab(tab) {
  document.querySelectorAll(".qt-tab-content").forEach(function(el) { el.classList.add("qt-hidden"); });
  document.querySelectorAll(".qt-tab").forEach(function(el) { el.classList.remove("active"); });
  var panels = { presets:"panelPresets", history:"panelHistory", settings:"panelSettings" };
  var tabs   = { presets:"tabPresets",   history:"tabHistory",   settings:"tabSettings" };
  document.getElementById(panels[tab]).classList.remove("qt-hidden");
  document.getElementById(tabs[tab]).classList.add("active");
  if (tab === "history") loadHistory();
  if (tab === "settings") updateKeyStatus();
}

function sendToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs[0]) return;
    var url = tabs[0].url || "";
    var blocked = ["chrome://","chrome-extension://","about:","edge://"];
    for (var i=0; i<blocked.length; i++) { if (url.indexOf(blocked[i]) === 0) return; }
    chrome.tabs.sendMessage(tabs[0].id, message, function() { void chrome.runtime.lastError; });
  });
}

var activePreset = null;

function selectPreset(preset) {
  if (activePreset === preset) return;
  activePreset = preset;
  document.getElementById("masterToggle").checked = true;
  updatePresetUI(preset);
  sendToActiveTab({ type: "SET_PRESET", preset: preset });
  chrome.storage.local.set({ qt_active_preset: preset });
}

function updatePresetUI(preset) {
  var map = { "qt-mild":"btn-mild", "qt-comfort":"btn-comfort", "qt-focus":"btn-focus" };
  Object.keys(map).forEach(function(key) {
    var el = document.getElementById(map[key]);
    if (el) el.classList.toggle("active", key === preset);
  });
}

function loadHistory() {
  var list = document.getElementById("historyList");
  chrome.storage.local.get(["quiettext_history"], function(data) {
    var history = data.quiettext_history || [];
    if (!history.length) {
      list.innerHTML = "";
      var p = document.createElement("p");
      p.className = "qt-empty";
      p.textContent = "No history yet.";
      list.appendChild(p);
      return;
    }
    list.innerHTML = "";
    history.forEach(function(entry) {
      var item = document.createElement("div");
      item.className = "qt-history-item";
      var prev = document.createElement("div");
      prev.className = "qt-history-preview";
      prev.textContent = entry.preview || "...";
      var time = document.createElement("div");
      time.className = "qt-history-time";
      time.textContent = entry.timestamp ? new Date(entry.timestamp).toLocaleDateString() : "";
      item.appendChild(prev);
      item.appendChild(time);
      item.addEventListener("click", function() {
        sendToActiveTab({ type: "OPEN_PANEL", text: entry.original });
        window.close();
      });
      list.appendChild(item);
    });
  });
}

function updateKeyStatus() {
  chrome.storage.local.get(["groq_api_key"], function(data) {
    var status = document.getElementById("keyStatus");
    if (data.groq_api_key) {
      status.textContent = "Groq key is set.";
      status.style.color = "#2e7d32";
    } else {
      status.textContent = "No key saved yet.";
      status.style.color = "#6E6E73";
    }
  });
}

function saveKey() {
  var key = document.getElementById("apiKeyInput").value.trim();
  var status = document.getElementById("keyStatus");
  if (!key || key.indexOf("gsk_") !== 0 || key.length < 20) {
    status.textContent = "Invalid key. Must start with gsk_";
    status.style.color = "#d32f2f";
    return;
  }
  chrome.storage.local.set({ groq_api_key: key }, function() {
    status.textContent = "Key saved.";
    status.style.color = "#2e7d32";
    document.getElementById("apiKeyInput").value = "";
  });
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("tabPresets").addEventListener("click", function() { showTab("presets"); });
  document.getElementById("tabHistory").addEventListener("click", function() { showTab("history"); });
  document.getElementById("tabSettings").addEventListener("click", function() { showTab("settings"); });

  document.getElementById("btn-mild").addEventListener("click", function() { selectPreset("qt-mild"); });
  document.getElementById("btn-comfort").addEventListener("click", function() { selectPreset("qt-comfort"); });
  document.getElementById("btn-focus").addEventListener("click", function() { selectPreset("qt-focus"); });

  document.getElementById("clearHistoryBtn").addEventListener("click", function() {
    chrome.storage.local.remove(["quiettext_history"], function() { loadHistory(); });
  });

  document.getElementById("saveKeyBtn").addEventListener("click", saveKey);

  document.getElementById("openAppBtn").addEventListener("click", function() {
    chrome.runtime.sendMessage({ type: "OPEN_TAB", url: "https://quiettext.vercel.app/" });
    window.close();
  });

  document.getElementById("masterToggle").addEventListener("change", function(e) {
    if (e.target.checked) {
      var preset = activePreset || "qt-comfort";
      activePreset = preset;
      updatePresetUI(preset);
      sendToActiveTab({ type: "SET_PRESET", preset: preset });
      chrome.storage.local.set({ qt_active_preset: preset });
    } else {
      activePreset = null;
      updatePresetUI(null);
      sendToActiveTab({ type: "SET_PRESET", preset: null });
      chrome.storage.local.set({ qt_active_preset: null });
    }
  });

  chrome.storage.local.get(["qt_active_preset","groq_api_key"], function(data) {
    if (data.qt_active_preset) {
      activePreset = data.qt_active_preset;
      document.getElementById("masterToggle").checked = true;
      updatePresetUI(activePreset);
    }
    if (data.groq_api_key) {
      var s = document.getElementById("keyStatus");
      s.textContent = "Groq key is set.";
      s.style.color = "#2e7d32";
    }
  });
});