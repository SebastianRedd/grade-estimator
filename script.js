// --------------------
// HELPER FUNCTIONS
// --------------------
function wordCount(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

function sentenceCount(text) {
  return (text.match(/[.!?]/g) || []).length || 1;
}

function promptRelevance(prompt, assignment) {
  if (!prompt.trim()) return 0;

  const pWords = new Set(prompt.toLowerCase().match(/\b[a-z']+\b/g));
  const aWords = new Set(assignment.toLowerCase().match(/\b[a-z']+\b/g));

  let overlap = 0;
  pWords.forEach(word => {
    if (aWords.has(word)) overlap++;
  });

  return overlap / pWords.size;
}

const transitions = [
  "however", "therefore", "moreover", "in contrast", "for example",
  "because", "consequently", "on the other hand", "furthermore"
];

function transitionCount(text) {
  let count = 0;
  const lower = text.toLowerCase();
  transitions.forEach(t => {
    if (lower.includes(t)) count++;
  });
  return count;
}

// -----------------------------
// GRADE ESTIMATION
// -----------------------------
function estimateGrade(assignment, prompt, gradeLevel) {

  const words = wordCount(assignment);
  const sentences = sentenceCount(assignment);
  const avgSentence = words / sentences;
  const relevance = promptRelevance(prompt, assignment);
  const transitionsUsed = transitionCount(assignment);

  const expectedLengths = {
    "9": 150,
    "10": 200,
    "11": 250,
    "12": 300,
    "college": 350
  };

  let score = 0;

  if (words >= expectedLengths[gradeLevel]) score += 20;
  else score += (words / expectedLengths[gradeLevel]) * 20;

  if (relevance >= 0.25) score += 30;
  else score += relevance * 30;

  if (avgSentence >= 12 && avgSentence <= 28) score += 20;
  else score += 10;

  if (transitionsUsed >= 2) score += 15;
  else score += transitionsUsed * 7;

  if (assignment.includes("because") || assignment.includes("this shows"))
    score += 15;

  let letter = "F";
  if (score >= 90) letter = "A";
  else if (score >= 85) letter = "A-";
  else if (score >= 80) letter = "B+";
  else if (score >= 75) letter = "B";
  else if (score >= 70) letter = "B-";
  else if (score >= 65) letter = "C+";
  else if (score >= 60) letter = "C";
  else if (score >= 55) letter = "C-";
  else if (score >= 50) letter = "D";

  return {
    letter,
    words,
    sentences,
    avgSentence,
    relevance,
    transitionsUsed
  };
}

// -----------------------------
// AI-STYLE FEEDBACK
// -----------------------------
function generateFeedback(features, assignment, prompt) {
  const tips = [];

  // Length feedback
  if (features.words < 180)
    tips.push("Your response is a bit short. Adding more detail or evidence would strengthen it.");

  // Prompt relevance feedback
  if (features.relevance < 0.2)
    tips.push("Your writing does not fully address the prompt. Re-read the question and make sure you respond directly.");

  // Transition feedback
  if (features.transitionsUsed < 2)
    tips.push("Add transition words to improve flow (for example, however, therefore).");

  // Sentence length
  if (features.avgSentence > 28)
    tips.push("Some sentences are too long. Break them up for clarity.");

  // Evidence check
  if (!assignment.toLowerCase().includes("because") &&
      !assignment.toLowerCase().includes("this shows")) {
    tips.push("Try explaining *why* your evidence matters. Use phrases like 'this shows that…'.");
  }

  // Prompt-specific checks
  if (prompt.trim().length > 0 && features.relevance < 0.2)
    tips.push("Re-read each part of the prompt and make sure your writing answers *every* part.");

  // Default
  if (tips.length === 0)
    tips.push("Strong writing overall! You can strengthen your response by adding one more piece of evidence or deeper analysis.");

  return tips;
}

// -----------------------------
// SAMPLE GENERATOR
// -----------------------------
function generateSample(prompt, gradeLevel) {
  if (!prompt.trim())
    return "Please enter a prompt to generate a sample response.";

  const tones = {
    "9": "simple and clear",
    "10": "organized with basic evidence",
    "11": "analytic with explanations",
    "12": "insightful and well-structured",
    "college": "concise, structured, and evidence-based"
  };

  return `
<b>Sample Response (${gradeLevel} level):</b><br><br>
Thesis: This response argues that ${prompt.slice(0, 80)}...<br><br>
Paragraph 1: Introduce your main point and explain how it connects to the prompt.<br><br>
Paragraph 2: Add evidence, explain its importance, and relate it back to the main argument.<br><br>
Conclusion: Summarize the argument and restate the main idea in a deeper way.<br><br>
<i>Writing tone:</i> ${tones[gradeLevel]}.
`;
}

// -----------------------------
// BUTTON LOGIC
// -----------------------------
document.getElementById("estimate-btn").addEventListener("click", () => {
  const gradeLevel = document.getElementById("grade-level").value;
  const prompt = document.getElementById("prompt").value.trim();
  const assignment = document.getElementById("assignment").value.trim();

  if (!assignment) {
    alert("Please paste your assignment.");
    return;
  }

  const results = estimateGrade(assignment, prompt, gradeLevel);

  // Show grade
  document.getElementById("grade-output").innerHTML = `
    Estimated Grade: <b>${results.letter}</b>
  `;

  // Show explanation
  document.getElementById("explanation").innerHTML = `
    <b>Breakdown:</b><br>
    • Words: ${results.words}<br>
    • Sentences: ${results.sentences}<br>
    • Avg sentence length: ${results.avgSentence.toFixed(1)} words<br>
    • Prompt relevance: ${(results.relevance * 100).toFixed(0)}%<br>
    • Transitions used: ${results.transitionsUsed}<br><br>
    <i>Scores are estimated based on rubric-like features.</i>
  `;

  document.getElementById("results").style.display = "block";

  // Feedback
  const feedbackList = document.getElementById("feedback-list");
  feedbackList.innerHTML = "";

  const feedback = generateFeedback(results, assignment, prompt);
  feedback.forEach(tip => {
    const li = document.createElement("li");
    li.textContent = tip;
    feedbackList.appendChild(li);
  });

  document.getElementById("feedback-card").style.display = "block";
});

// SAMPLE RESPONSE
document.getElementById("sample-btn").addEventListener("click", () => {
  const prompt = document.getElementById("prompt").value.trim();
  const gradeLevel = document.getElementById("grade-level").value;

  const text = generateSample(prompt, gradeLevel);

  document.getElementById("sample-text").innerHTML = text;
  document.getElementById("sample-card").style.display = "block";
});