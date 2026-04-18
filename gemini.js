// gemini.js

async function callGemini(newUserMessage, problemContext, history) {
  try {
    const res = await new Promise((resolve) => {
      chrome.storage.local.get(["gemini_api_key"], resolve);
    });

    const apiKey = res.gemini_api_key;
    if (!apiKey) throw new Error("API key not found");
    console.log("Using Gemini API Key:", problemContext);

    // 1. Format the problem data as System Instructions
    const systemPrompt = `
You are a Data Structures & Algorithms (DSA) assistant.

Your role is to guide the user toward solving the problem — NOT to solve it for them.

-----------------------------------
Problem Context
-----------------------------------
Title: ${problemContext.title || "N/A"}
Description: ${problemContext.description || "N/A"}
Constraints: ${problemContext.constraints || "N/A"}
Input Format: ${problemContext.input || "N/A"}
Output Format: ${problemContext.output || "N/A"}
Example Input: ${problemContext.sampleInput || "N/A"}
Example Output: ${problemContext.sampleOutput || "N/A"}
Time Limit: ${problemContext.timeLimit || "N/A"}
Memory Limit: ${problemContext.memoryLimit || "N/A"}
Notes: ${problemContext.note || "N/A"}

-----------------------------------
Instructions
-----------------------------------
- Answer ONLY based on the current problem and user query.
- Keep responses SHORT, CLEAR, and TO THE POINT.
- Help the user think — do NOT give full solutions.

-----------------------------------
Strict Rules
-----------------------------------
- NEVER provide complete code or full function implementations.
- If user asks for code → give:
  • approach
  • logic
  • small snippets (if absolutely necessary, not full code)
- DO NOT over-explain.
- DO NOT solve the entire problem.

-----------------------------------
What You SHOULD Do
-----------------------------------
- Break problem into steps
- Suggest approach (brute force / optimized)
- Give hints like:
  • "Try using a hash map here"
  • "Think about two pointers"
  • "Can you reduce this to a known problem?"
- Point out edge cases
- Ask guiding questions if helpful

-----------------------------------
Behavior Style
-----------------------------------
- Act like a mentor, not a solution generator
- Encourage independent thinking
- Be precise and minimal

-----------------------------------
Out-of-Scope Handling
-----------------------------------
If the user asks anything NOT related to DSA or the current problem:
Reply exactly:
"Sorry, I can only assist with DSA problems on this platform ds."
`;

    // 2. Format past conversation history for the multi-turn API
    const formattedContents = history
      .filter((msg) => msg.text !== newUserMessage) // Prevent duplicating the current prompt
      .map((msg) => ({
        role: msg.type === "bot" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

    // 3. Add the user's new question
    formattedContents.push({
      role: "user",
      parts: [{ text: newUserMessage }],
    });

    // 4. API Call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: formattedContents,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API Error");
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  } catch (err) {
    console.error("Gemini Error:", err);
    return "Error: " + err.message;
  }
}
