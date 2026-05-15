// content.js

const QT_PRESETS  = ['qt-mild', 'qt-comfort', 'qt-focus'];
let currentPreset = null;
let panelInjected = false;
function applyPreset(preset) {
  if (!document.body) return;
  if (window.location.hostname === "quiet-text-2-0-offline.vercel.app") return;
  document.body.setAttribute('data-qt-active', 'true');
  
  QT_PRESETS.forEach(p => document.body.classList.remove(p));
  if (preset && QT_PRESETS.includes(preset)) {
    document.body.classList.add(preset);
    currentPreset = preset;
    showToast(getPresetName(preset) + ' mode applied');
  } else {
    currentPreset = null;
    showToast('Reading mode disabled');
  }
}
function showToast(message) {
  const existing = document.querySelector('.qt-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'qt-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('qt-toast-out');
    setTimeout(() => toast.remove(), 250);
  }, 2000);
}
function getPresetName(preset) {
  const names = {
    'qt-mild': 'Mild',
    'qt-comfort': 'Comfort',
    'qt-focus': 'Focus'
  };
  return names[preset] || preset;
}
function throttle(fn, ms) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}

// Panel injection
function injectPanel(selectedText, restored) {
  // Guard: check DOM existence, not just flag
  const existingIframe = document.getElementById('qt-panel-iframe');
  if (panelInjected && existingIframe?.contentWindow) {
    // Panel exists, just re-init
    existingIframe.contentWindow.postMessage({
      type: 'INIT_PANEL',
      text: selectedText,
      restored: restored || null
    }, '*');
    return;
  }

  // Reset flag if DOM doesn't match
  if (panelInjected && !existingIframe) {
    panelInjected = false;
  }

  const existing = document.getElementById('qt-panel-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'qt-panel-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 360px;
    height: 100vh;
    z-index: 2147483647;
    border: none;
    box-shadow: -4px 0 32px rgba(0,0,0,0.18);
    transform: translate(0, 0);
    will-change: transform;
  `;

  const iframe = document.createElement('iframe');
  iframe.id  = 'qt-panel-iframe';
  iframe.src = chrome.runtime.getURL('panel.html');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  `;

  container.appendChild(iframe);
  document.body.appendChild(container);
  panelInjected = true;

  // Track iframe readiness
  let iframeReady = false;

  iframe.addEventListener('load', () => {
    iframeReady = true;
    // Send INIT with text ONLY after load
    iframe.contentWindow.postMessage({
      type: 'INIT_PANEL',
      text: selectedText,
      restored: restored || null
    }, '*');
    // Send initial dimensions so body is in pixel mode from the start
    iframe.contentWindow.postMessage({
      type: 'PANEL_RESIZED',
      width:  container.offsetWidth,
      height: container.offsetHeight
    }, '*');
  });

  iframe.addEventListener('error', () => {
    console.error('QuietText: Panel iframe failed to load');
    removePanel();
  });

  // AbortController to clean up all listeners on panel close
  const ac = new AbortController();
  const sig = ac.signal;

  // Drag-to-move: overlay approach for smooth dragging
  let dragOverlay = null;
  let dragStartX = 0, dragStartY = 0;
  let currentTranslateX = 0, currentTranslateY = 0;

  // Listen for START_DRAG message from iframe
  window.addEventListener('message', (event) => {
    if (event.source !== iframe.contentWindow) return;
    
    const msg = event.data;
    if (!msg || typeof msg !== 'object') return;
    
    if (msg.type === 'START_DRAG') {
      // Get current position from transform
      const transform = container.style.transform;
      const match = transform.match(/translate\((.+?)px,\s*(.+?)px\)/);
      if (match) {
        currentTranslateX = parseFloat(match[1]);
        currentTranslateY = parseFloat(match[2]);
      } else {
        currentTranslateX = 0;
        currentTranslateY = 0;
      }
      
      // Get iframe's position on page to convert coordinates
      const iframeRect = iframe.getBoundingClientRect();
      
      // Convert iframe coordinates to page coordinates
      const pageMouseX = msg.mouseX + iframeRect.left;
      const pageMouseY = msg.mouseY + iframeRect.top;
      
      // Create transparent overlay to capture all mouse events
      dragOverlay = document.createElement('div');
      dragOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483648;
        cursor: grabbing;
        background: transparent;
      `;
      
      // Store initial mouse position (now in page coordinates)
      dragStartX = pageMouseX;
      dragStartY = pageMouseY;
      
      // Handle mousemove on overlay - direct, no postMessage
      dragOverlay.addEventListener('mousemove', (e) => {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        const newTranslateX = currentTranslateX + deltaX;
        const newTranslateY = currentTranslateY + deltaY;
        
        // Constrain to viewport
        const minX = -(container.offsetWidth - 100);
        const minY = -100;
        const maxY = window.innerHeight - 100;
        
        const constrainedX = Math.max(minX, Math.min(0, newTranslateX));
        const constrainedY = Math.max(minY, Math.min(maxY, newTranslateY));
        
        // GPU-accelerated transform
        container.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
      });
      
      // Handle mouseup on overlay
      dragOverlay.addEventListener('mouseup', () => {
        // Save final position
        const transform = container.style.transform;
        const match = transform.match(/translate\((.+?)px,\s*(.+?)px\)/);
        if (match) {
          currentTranslateX = parseFloat(match[1]);
          currentTranslateY = parseFloat(match[2]);
        }
        
        // Remove overlay
        if (dragOverlay && dragOverlay.parentNode) {
          dragOverlay.remove();
        }
        dragOverlay = null;
        
        // Notify iframe that drag ended
        iframe.contentWindow.postMessage({ type: 'DRAG_ENDED' }, '*');
      });
      
      // Add overlay to DOM
      document.body.appendChild(dragOverlay);
    }
  }, { signal: sig });

  // Resize: bottom-LEFT corner with pulsing glow
  const resizeHandle = document.createElement('div');
  resizeHandle.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 40px;
    cursor: nesw-resize;
    z-index: 11;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(28, 28, 30, 0.15), rgba(110, 110, 115, 0.08));
    border-radius: 0 20px 0 0;
    transition: all 0.3s ease;
    border-right: 1px solid rgba(110, 110, 115, 0.25);
    border-top: 1px solid rgba(110, 110, 115, 0.25);
    box-shadow: 0 0 0 0 rgba(28, 28, 30, 0.4);
    animation: qt-resize-pulse 2s ease-in-out infinite;
  `;
  resizeHandle.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="12" r="2" fill="rgba(110,110,115,0.7)"/>
      <circle cx="9" cy="12" r="2" fill="rgba(110,110,115,0.8)"/>
      <circle cx="4" cy="7" r="2" fill="rgba(110,110,115,0.8)"/>
      <circle cx="9" cy="7" r="2" fill="rgba(28,28,30,0.5)"/>
    </svg>
  `;
  
  resizeHandle.addEventListener('mouseenter', () => {
    resizeHandle.style.background = 'linear-gradient(135deg, rgba(28, 28, 30, 0.3), rgba(110, 110, 115, 0.15))';
    resizeHandle.style.boxShadow = '0 0 16px 6px rgba(28, 28, 30, 0.3)';
    resizeHandle.style.animation = 'none';
  });
  resizeHandle.addEventListener('mouseleave', () => {
    resizeHandle.style.background = 'linear-gradient(135deg, rgba(28, 28, 30, 0.15), rgba(110, 110, 115, 0.08))';
    resizeHandle.style.boxShadow = '0 0 0 0 rgba(28, 28, 30, 0.4)';
    resizeHandle.style.animation = 'qt-resize-pulse 2s ease-in-out infinite';
  });

  let resizing = false;
  let resizeStartX = 0, resizeStartY = 0, origW = 0, origH = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    resizing     = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    origW        = container.offsetWidth;
    origH        = container.offsetHeight;
    e.stopPropagation();
    e.preventDefault();
  }, { signal: sig });

  // Throttled resize message — max 20 times/sec
  const sendResize = throttle((newW, newH) => {
    if (!iframeReady) return;
    iframe.contentWindow.postMessage({ type: 'PANEL_RESIZED', width: newW, height: newH }, '*');
  }, 50);

  document.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    
    // Calculate deltas
    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;
    
    // Bottom-LEFT handle: dragging LEFT (negative deltaX) = increase width
    // Height: dragging DOWN (positive deltaY) = increase height
    const newW = Math.max(320, Math.min(800, origW - deltaX));
    const newH = Math.max(300, Math.min(window.innerHeight, origH + deltaY));
    
    // Panel is positioned from right edge, so no position adjustment needed
    // Just change width and height
    container.style.width  = newW + 'px';
    container.style.height = newH + 'px';
    
    sendResize(newW, newH);
  }, { signal: sig });

  document.addEventListener('mouseup', () => { 
    if (!resizing) return;
    resizing = false;
    resizeHandle.style.background = 'linear-gradient(135deg, rgba(28, 28, 30, 0.15), rgba(110, 110, 115, 0.08))';
    resizeHandle.style.boxShadow = '0 0 0 0 rgba(28, 28, 30, 0.4)';
    resizeHandle.style.animation = 'qt-resize-pulse 2s ease-in-out infinite';
  }, { signal: sig });

  container.appendChild(resizeHandle);
  container._ac = ac;
}

// Remove the panel
function removePanel() {
  const container = document.getElementById('qt-panel-container');
  if (container) {
    if (container._ac) container._ac.abort();
    container.remove();
  }
  panelInjected = false;
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validate message structure
  if (!message || typeof message !== 'object' || !message.type) {
    console.warn('QuietText: Invalid message received:', message);
    return;
  }

  if (message.type === 'OPEN_PANEL') {
    injectPanel(message.text, message.restored || null);
    sendResponse({ success: true });
    return true;
  }
  if (message.type === 'SET_PRESET') {
    applyPreset(message.preset);
    sendResponse({ success: true });
    return true;
  }
  if (message.type === 'GET_STATE') {
    sendResponse({ preset: currentPreset });
    return true;
  }

  // Unknown message type
  console.warn('QuietText: Unknown message type:', message.type);
});

// Panel iframe message listener
window.addEventListener('message', (event) => {
  // Validate message structure
  if (!event.data || typeof event.data !== 'object') return;
  const iframe = document.getElementById('qt-panel-iframe');
  if (!iframe || event.source !== iframe.contentWindow) return;
  if (event.data.type === 'CLOSE_PANEL') removePanel();
  if (event.data.type === 'OPEN_TAB') chrome.runtime.sendMessage({ type: 'OPEN_TAB', url: event.data.url });
});

// Inject OpenDyslexic font at runtime
function injectFonts() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFonts);
    return;
  }

  try {
    const regularUrl = chrome.runtime.getURL('fonts/OpenDyslexic-Regular.otf');
    const boldUrl = chrome.runtime.getURL('fonts/OpenDyslexic-Bold.otf');
    
    if (!regularUrl || !boldUrl) {
      console.error('QuietText: Font URLs invalid');
      return;
    }

    const qtFontStyle = document.createElement('style');
    qtFontStyle.id = 'qt-font-styles';
    qtFontStyle.textContent = `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${regularUrl}') format('opentype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${boldUrl}') format('opentype');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(qtFontStyle);
    document.body.setAttribute('data-qt-fonts-ready', 'true');
  } catch (err) {
    console.error('QuietText: Font injection failed:', err);
  }
}

// Restore preset on page load
function restorePreset() {
  if (!document.body) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', restorePreset);
    }
    return;
  }

  document.body.setAttribute('data-qt-active', 'true');

  chrome.storage.local.get(['qt_active_preset'], (data) => {
    if (data.qt_active_preset) {
      document.body.classList.add('qt-loading');
      setTimeout(() => {
        applyPreset(data.qt_active_preset);
        document.body.classList.remove('qt-loading');
      }, 50);
    }
  });
}

// Initialize
injectFonts();
restorePreset();

// Add resize animation style once
if (!document.getElementById('qt-resize-animation')) {
  const style = document.createElement('style');
  style.id = 'qt-resize-animation';
  style.textContent = `
    @keyframes qt-resize-pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(28, 28, 30, 0.4);
      }
      50% {
        box-shadow: 0 0 12px 4px rgba(28, 28, 30, 0.2);
      }
    }
  `;
  document.head.appendChild(style);
}

// Highlight tooltip
(function initHighlightTooltip() {
  let debounceTimer = null;
  let tooltip = null;

  function removeTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }

  function createTooltip(x, y) {
    removeTooltip();
    tooltip = document.createElement('div');
    tooltip.className = 'qt-highlight-tooltip';
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
    tooltip.innerHTML  = `
      <div class="qt-highlight-tooltip-text">
        <div class="qt-tooltip-loading">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="qt-highlight-tooltip-footer">💡 Use QuietText panel for detailed analysis</div>
    `;
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function positionTooltip(rect) {
    const x = Math.min(
      rect.left + window.scrollX,
      window.innerWidth + window.scrollX - 380
    );
    const y = rect.bottom + window.scrollY + 10;
    return { x: Math.max(8, x), y };
  }

  document.addEventListener('mouseup', () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection && selection.toString().trim();

      // Ignore if too short, inside our panel, or extension not alive
      if (!text || text.length < 5) { removeTooltip(); return; }
      if (!chrome.runtime?.id)       { removeTooltip(); return; }

      const range = selection.getRangeAt(0);
      const rect  = range.getBoundingClientRect();

      // Don't trigger inside the QuietText panel itself
      const panelContainer = document.getElementById('qt-panel-container');
      if (panelContainer && panelContainer.contains(range.commonAncestorContainer)) {
        return;
      }

      const { x, y } = positionTooltip(rect);
      createTooltip(x, y);

      chrome.runtime.sendMessage({ type: 'EXPLAIN_HIGHLIGHT', text }, (response) => {
        if (!tooltip) return; // tooltip was dismissed already
        if (chrome.runtime.lastError || !response) {
          removeTooltip();
          return;
        }
        if (response.error) {
          removeTooltip();
          return;
        }
        const textDiv = tooltip.querySelector('.qt-highlight-tooltip-text');
        if (textDiv) textDiv.textContent = response.result;
      });
    }, 2000);
  });

  // Dismiss on click anywhere or selection cleared
  document.addEventListener('mousedown', (e) => {
    clearTimeout(debounceTimer);
    if (tooltip && !tooltip.contains(e.target)) removeTooltip();
  });

  document.addEventListener('selectionchange', () => {
    const text = window.getSelection().toString().trim();
    if (!text) {
      clearTimeout(debounceTimer);
      removeTooltip();
    }
  });
})();
