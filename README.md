# 🚀 DSA AI Assistant - Chrome Extension

A lightweight, context-aware Chrome Extension that integrates a Gemini-powered AI mentor directly into your DSA problem-solving workflow. Instead of just giving you the code, it acts as a mentor—guiding you through logic, approaches, and edge cases based on the exact problem you are currently viewing.

## ✨ Features
* **Context-Aware:** Automatically parses the DOM to extract the problem title, description, constraints, and test cases to feed to the LLM.
* **SPA Navigation Support:** Uses a debounced `MutationObserver` to seamlessly detect URL and problem changes without requiring page reloads.
* **Persistent Local Memory:** Chat history is saved locally per problem ID via `chrome.storage`. Switching problems switches the chat context automatically.
* **Sleek UI:** Features a floating expandable/collapsible chatbox, typing indicators, and dark-mode styling.
* **Markdown Parsing:** Renders Gemini's code snippets, bullet points, and text styling beautifully using `marked.js`.

## 🛠 Tech Stack
* **Frontend:** Vanilla JavaScript, HTML, CSS
* **APIs:** Chrome Extensions API (`chrome.storage`), Gemini 2.5 Flash API
* **Libraries:** `marked.js` (Markdown parsing)

## 📦 Installation
1. Clone this repository: `git clone https://github.com/yourusername/dsa-assistant-extension.git`
2. Open Google Chrome and navigate to `chrome://extensions/`
3. Turn on **Developer mode** (top right corner).
4. Click **Load unpacked** and select the cloned repository folder.
5. Pin the extension to your toolbar.
6. Create you gemini api key and activate it and use here.

## 🚀 Usage
1. Open a problem on the supported DSA platform.
2. Click the floating **Chat Icon** in the bottom right corner.
3. Paste your [Gemini API Key](https://aistudio.google.com/app/apikey) when prompted (it will be saved locally).
4. Start asking for hints, time complexity analysis, or approach validations!

## 🔐 Privacy
This extension makes API calls directly from your browser to Google's Generative AI API. No data is routed through third-party servers, and your API key is stored securely in your browser's local Chrome storage.
