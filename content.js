// content.js

// Global State
window.problemId = null;
window.chatMessages = [];
window.problemData = null;
let extractionTimer = null; // Used for Debouncing DOM loads

function isProblemPage() {
  return location.pathname.startsWith("/problems/");
}

function getProblemId() {
  const match = location.pathname.match(/-(\d+)$/);
  return match ? match[1] : null;
}

// ---------- INIT ----------
function init() {
  if (!isProblemPage()) return;
  window.problemId = getProblemId();
  observeChanges();
  injectButton();
}

init();

// ---------- OBSERVER ----------
function observeChanges() {
  let lastUrl = location.href;

  const observer = new MutationObserver(() => {
    const currentUrl = location.href;

    // Detect SPA URL Change
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (isProblemPage()) {
        handleProblemChange();
      }
    }

    // Debounced Problem Extraction
    if (!window.problemData && isProblemPage()) {
      clearTimeout(extractionTimer);

      // Wait 1 second after DOM mutations stop to extract data
      extractionTimer = setTimeout(() => {
        const data = extractProblem();
        if (data && data.title) {
          window.problemData = data;
          console.log(
            "Problem loaded and extracted:",
            window.problemData.title,
          );
        }
      }, 1000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function handleProblemChange() {
  const newProblemId = getProblemId();

  if (newProblemId !== window.problemId) {
    // Save previous chat state
    if (window.problemId && window.chatMessages.length > 0) {
      saveChat(window.problemId, window.chatMessages);
    }

    // Reset State
    window.problemId = newProblemId;
    window.chatMessages = [];
    window.problemData = null;

    removeChatUI();
  }
}

// ---------- BUTTON & API KEY FLOW ----------
function injectButton() {
  if (document.getElementById("chat-btn")) return;

  const btn = document.createElement("div");
  btn.id = "chat-btn";
  btn.innerHTML = `<div class="chat-icon"></div>`;
  btn.onclick = checkApiKeyAndInit;

  document.body.appendChild(btn);
}

function checkApiKeyAndInit() {
  chrome.storage.local.get(["gemini_api_key"], (res) => {
    if (!res.gemini_api_key) {
      showApiKeyUI();
    } else {
      openChat();
    }
  });
}

function showApiKeyUI() {
  const div = document.createElement("div");
  div.id = "api-modal";
  div.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <span>Enter Gemini API Key</span>
        <span id="closeApi" style="cursor:pointer;">✖</span>
      </div>
      <input id="apiInput" type="password" placeholder="Paste API Key..." />
      <button id="saveKey">Save</button>
    </div>
  `;
  document.body.appendChild(div);

  document.getElementById("closeApi").onclick = () => div.remove();
  document.getElementById("saveKey").onclick = () => {
    const key = document.getElementById("apiInput").value;
    chrome.storage.local.set({ gemini_api_key: key }, () => {
      div.remove();
      openChat();
    });
  };
}

// ---------- CHAT UI ----------
function openChat() {
  if (document.getElementById("chatbox")) return;

  const div = document.createElement("div");
  div.id = "chatbox";
  div.innerHTML = `
    <div class="chat-header">
      <div class="header-title">
        <div class="status-dot"></div>
        <span>DSA Assistant</span>
      </div>
      <div class="chat-actions">
        <button id="expandChat" title="Expand/Collapse">⛶</button>
        <button id="clearChat" title="Clear Chat">🗑</button>
        <button id="closeChat" title="Close">✖</button>
      </div>
    </div>
    <div id="messages"></div>
    <div class="chat-input-area">
      <input id="input" placeholder="Ask about the problem..." autocomplete="off" />
      <button id="send">➤</button>
    </div>
  `;
  document.body.appendChild(div);

  loadChat(window.problemId);

  // Setup Event Listeners
  document.getElementById("send").onclick = sendMessage;
  document.getElementById("input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  // --- NEW: Expand/Minimize Logic ---
  let isExpanded = false;
  document.getElementById("expandChat").onclick = () => {
    isExpanded = !isExpanded;
    if (isExpanded) {
      div.classList.add("expanded");
    } else {
      div.classList.remove("expanded");
    }
  };

  document.getElementById("clearChat").onclick = clearCurrentChat;
  document.getElementById("closeChat").onclick = () => div.remove();
}

// ---------- CHAT LOGIC ----------
async function sendMessage() {
  const inputEl = document.getElementById("input");
  const text = inputEl.value.trim();
  if (!text) return;

  addMessage(text, "user");
  inputEl.value = "";

  if (!window.problemData) {
    addMessage(
      "Problem data is still loading. Please try again in a few seconds...",
      "bot",
      true,
    );
    return;
  }

  showTypingIndicator();

  const response = await callGemini(
    text,
    window.problemData,
    window.chatMessages,
  );

  hideTypingIndicator();
  addMessage(response, "bot");

  saveChat(window.problemId, window.chatMessages);
}

function addMessage(text, type, bypassStorage = false) {
  const msgBox = document.getElementById("messages");

  const div = document.createElement("div");
  div.className = `message ${type}`;

  // NEW: Parse Markdown if it's the bot, otherwise use plain text
  if (type === "bot") {
    // If marked.js loaded successfully, parse it. Otherwise, fallback to text.
    if (typeof marked !== "undefined") {
      // Remove the "```cpp" or "```python" labels if marked doesn't handle them automatically
      div.innerHTML = marked.parse(text);
    } else {
      console.warn("marked.js is not loaded. Falling back to plain text.");
      div.innerText = text;
    }
  } else {
    div.innerText = text; // Keep user text raw to prevent XSS
  }

  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;

  if (!bypassStorage) {
    window.chatMessages.push({ text, type });
  }
}

// ---------- TYPING INDICATOR ----------
function showTypingIndicator() {
  const msgBox = document.getElementById("messages");
  const div = document.createElement("div");
  div.id = "typing-indicator";
  div.className = "message bot";
  div.innerText = "Typing...";
  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();
}

// ---------- CHAT CONTROL ----------
function clearCurrentChat() {
  window.chatMessages = [];
  document.getElementById("messages").innerHTML = "";
  clearChat(window.problemId);
}

function removeChatUI() {
  document.getElementById("chatbox")?.remove();
}
