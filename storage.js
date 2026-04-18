// storage.js

function saveChat(problemId, messages) {
  if (!problemId) return;
  chrome.storage.local.set({
    ["chat_" + problemId]: messages,
  });
}

function loadChat(problemId) {
  if (!problemId) return;
  chrome.storage.local.get(["chat_" + problemId], (res) => {
    const msgs = res["chat_" + problemId] || [];

    const msgBox = document.getElementById("messages");
    if (!msgBox) return;

    msgBox.innerHTML = ""; // Clear current UI

    msgs.forEach((m) => {
      const div = document.createElement("div");
      div.className = `message ${m.type}`;
      div.innerText = m.text;
      msgBox.appendChild(div);
    });

    // Auto-scroll to bottom
    msgBox.scrollTop = msgBox.scrollHeight;

    // Update the global state array
    window.chatMessages = msgs;
  });
}

function clearChat(problemId) {
  if (!problemId) return;
  chrome.storage.local.remove("chat_" + problemId, () => {
    console.log(`Chat history deleted from storage for problem ${problemId}`);
  });
}
