// --------------------
// Helper Functions
// --------------------

// Count words
function wordCount(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Count sentences
function sentenceCount(text) {
  return (text.match(/[.!?]/g) || []).length || 1;
}

// Calculate prompt relevance (basic overlap)
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

// Count transition/logic words
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
// Main Grade Estimator
// -----------------------------
function estimateGrade() {
  const type = document.getElementById("type").value;
  const gradeLevel = document.getElementById("grade-level").value;
  const prompt = document.getElementById("prompt").value.trim();
  const assignment = document.getElementById("assignment").value.trim();

  if (!assignment) {
    alert("Please paste your assignment.");
    return;
  }

  // Extract features
  const words = wordCount(assignment);
  const sentences = sentenceCount(assignment);
  const avgSentence = words / sentences;
  const relevance = promptRelevance(prompt, assignment);
  const transitionsUsed = transitionCount(assignment);

  // -----------------------------
  // Scoring System (MVP)
  // -----------------------------
  let score = 0;

  // Word count expectations by grade level
  const expectedLengths = {
    "9": 150,
    "10": 200,
    "11": 250,
    "12": 300,
    "college": 350
  };

  if (words >= expectedLengths[gradeLevel]) score += 20;
  else score += (words / expectedLengths[gradeLevel]) * 20;

  // Prompt relevance
  if (relevance >= 0.25) score += 30;
  else score += relevance * 30;

  // Sentence structure
  if (avgSentence >= 12 && avgSentence <= 28) score += 20;
  else score += 10;

  // Transition words
  if (transitionsUsed >= 2) score += 15;
  else score += transitionsUsed * 7;

  // Depth/complexity (rough check)
  if (assignment.includes("because") || assignment.includes("this shows"))
    score += 15;

  // -----------------------------
  // Convert Score to Letter Grade
  // -----------------------------
  let letter;

  if (score >= 90) letter = "A";
  else if (score >= 85) letter = "A-";
  else if (score >= 80) letter = "B+";
  else if (score >= 75) letter = "B";
  else if (score >= 70) letter = "B-";
  else if (score >= 65) letter = "C+";
  else if (score >= 60) letter = "C";
  else if (score >= 55) letter = "C-";
  else if (score >= 50) letter = "D";
  else letter = "F";

  // -----------------------------
  // Display Results
  // -----------------------------
  document.getElementById("grade-output").textContent =
    `Estimated Grade: ${letter}`;

  document.getElementById("explanation").innerHTML =
    `
    <b>Breakdown:</b><br>
    • Word count: ${words}<br>
    • Sentences: ${sentences}<br>
    • Prompt relevance: ${(relevance * 100).toFixed(0)}%<br>
    • Transitions used: ${transitionsUsed}<br>
    • Avg sentence length: ${avgSentence.toFixed(1)} words<br><br>
    <i>This is an AI-style estimate based on writing features. Real ML model coming soon.</i>
    `;

  document.getElementById("results").style.display = "block";
}

// -----------------------------
// Button Listeners
// -----------------------------
document.getElementById("estimate-btn").addEventListener("click", estimateGrade);

document.getElementById("sample-btn").addEventListener("click", () => {
  alert("Sample generator coming in Phase 3!");
});