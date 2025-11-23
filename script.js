document.getElementById("estimate-btn").addEventListener("click", () => {
  const assignment = document.getElementById("assignment").value.trim();

  if (!assignment) {
    alert("Please paste your assignment.");
    return;
  }

  // PHASE 1 — placeholder grade
  let fakeGrade = "B+";

  document.getElementById("grade-output").textContent =
    `Estimated Grade: ${fakeGrade}`;

  document.getElementById("explanation").textContent =
    "This is a placeholder. The real AI scoring will be added next.";

  document.getElementById("results").style.display = "block";
});

document.getElementById("sample-btn").addEventListener("click", () => {
  alert("Sample generator coming next!");
});