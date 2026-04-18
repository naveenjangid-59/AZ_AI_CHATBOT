// utils.js

function extractProblem() {
  const root = document.querySelector("#app-layout-scroll");
  if (!root) return null;

  const data = {
    title: null,
    timeLimit: null,
    memoryLimit: null,
    description: null,
    input: null,
    output: null,
    constraints: null,
    sampleInput: null,
    sampleOutput: null,
    note: null,
  };

  // Title
  data.title = root.querySelector("h4")?.innerText.trim();

  // Time & Memory
  const info = root.querySelectorAll(".body-m-open-sans");
  info.forEach((el) => {
    const text = el.innerText;
    if (text.includes("Time Limit")) {
      data.timeLimit = el
        .querySelector("span.font-open-sans")
        ?.innerText.trim();
    }
    if (text.includes("Memory")) {
      data.memoryLimit = el
        .querySelector("span.font-open-sans")
        ?.innerText.trim();
    }
  });

  // ALL SECTIONS
  root.querySelectorAll("section").forEach((section) => {
    const heading = section.querySelector("h5")?.innerText.trim().toLowerCase();
    const content = section
      .querySelector(".markdown-renderer")
      ?.innerText.trim();

    if (!heading || !content) return;

    if (heading.includes("description")) data.description = content;
    else if (heading.includes("input")) data.input = content;
    else if (heading.includes("output")) data.output = content;
    else if (heading.includes("constraint")) data.constraints = content;
    else if (heading.includes("note")) data.note = content;
  });

  // SAMPLE INPUT / OUTPUT
  const sampleBlocks = root.querySelectorAll(".custom-scrollbar");

  if (sampleBlocks.length >= 2) {
    data.sampleInput = sampleBlocks[0].innerText.trim();
    data.sampleOutput = sampleBlocks[1].innerText.trim();
  }

  return data;
}
