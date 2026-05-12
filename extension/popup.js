function showTab(tab) {
  document.querySelectorAll(".qt-tab-content").forEach(function(el) { el.classList.add("qt-hidden"); });
  document.querySelectorAll(".qt-tab").forEach(function(el) { el.classList.remove("active"); });
  var panels = { presets:"panelPresets", settings:"panelSettings" };
  var tabs   = { presets:"tabPresets",   settings:"tabSettings" };
  document.getElementById(panels[tab]).classList.remove("qt-hidden");
  document.getElementById(tabs[tab]).classList.add("active");
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

function updateKeyStatus() {
  chrome.storage.local.get(["gemini_api_key"], function(data) {
    var status = document.getElementById("keyStatus");
    if (data.gemini_api_key) {
      status.textContent = "Gemini key is set.";
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
  if (!key || key.indexOf("AIza") !== 0 || key.length < 30) {
    status.textContent = "Invalid key. Must start with AIza";
    status.style.color = "#d32f2f";
    return;
  }
  chrome.storage.local.set({ gemini_api_key: key }, function() {
    status.textContent = "Key saved.";
    status.style.color = "#2e7d32";
    document.getElementById("apiKeyInput").value = "";
  });
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("tabPresets").addEventListener("click", function() { showTab("presets"); });
  document.getElementById("tabSettings").addEventListener("click", function() { showTab("settings"); });

  document.getElementById("btn-mild").addEventListener("click", function() { selectPreset("qt-mild"); });
  document.getElementById("btn-comfort").addEventListener("click", function() { selectPreset("qt-comfort"); });
  document.getElementById("btn-focus").addEventListener("click", function() { selectPreset("qt-focus"); });

  document.getElementById("saveKeyBtn").addEventListener("click", saveKey);

  document.getElementById("openAppBtn").addEventListener("click", function() {
    chrome.runtime.sendMessage({ type: "OPEN_TAB", url: "https://quiet-text-2-0-offline.vercel.app/" });
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

  chrome.storage.local.get(["qt_active_preset","gemini_api_key"], function(data) {
    if (data.qt_active_preset) {
      activePreset = data.qt_active_preset;
      document.getElementById("masterToggle").checked = true;
      updatePresetUI(activePreset);
    }
    if (data.gemini_api_key) {
      var s = document.getElementById("keyStatus");
      s.textContent = "Gemini key is set.";
      s.style.color = "#2e7d32";
    }
  });
});