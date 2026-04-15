const TOTAL_ROUNDS = 10;

let roundIndex = 0;
let score = 0;
let answered = false;
let rounds = [];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomColor() {
  return `rgb(${randomInt(20, 235)},${randomInt(20, 235)},${randomInt(20, 235)})`;
}

function slightlyDifferent(color) {
  let nums = color.match(/\d+/g).map(Number);
  nums[0] = clamp(nums[0] + randomInt(-10, 10), 0, 255);
  nums[1] = clamp(nums[1] + randomInt(-10, 10), 0, 255);
  nums[2] = clamp(nums[2] + randomInt(-10, 10), 0, 255);
  return `rgb(${nums[0]},${nums[1]},${nums[2]})`;
}

function buildRound(n) {
  let same = [1, 3, 4, 6, 7, 9].includes(n);

  let bgA = randomColor();
  let bgB = randomColor();

  let center = randomColor();

  let centerA = center;
  let centerB = same ? center : slightlyDifferent(center);

  return {
    bgA,
    bgB,
    centerA,
    centerB,
    answer: same ? "same" : "different",
  };
}

function buildGame() {
  rounds = [];
  for (let i = 1; i <= TOTAL_ROUNDS; i++) {
    rounds.push(buildRound(i));
  }
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function renderAnswers() {
  let container = document.getElementById("answerButtons");
  container.innerHTML = "";

  let options = shuffle(["same", "different"]);

  options.forEach((opt) => {
    let btn = document.createElement("button");
    btn.textContent = opt.toUpperCase();
    btn.onclick = () => handleAnswer(opt);
    container.appendChild(btn);
  });
}

function renderRound() {
  let r = rounds[roundIndex];

  document.getElementById("round").textContent = `Round ${roundIndex + 1} / ${TOTAL_ROUNDS}`;
  document.getElementById("score").textContent = `Score: ${score}`;

  document.getElementById("progressBar").style.width =
    (roundIndex / TOTAL_ROUNDS) * 100 + "%";

  let panelA = document.getElementById("panelA");
  let panelB = document.getElementById("panelB");

  panelA.style.background = r.bgA;
  panelB.style.background = r.bgB;

  panelA.innerHTML = "";
  panelB.innerHTML = "";

  let sqA = document.createElement("div");
  sqA.className = "centerSquare";
  sqA.style.background = r.centerA;

  let sqB = document.createElement("div");
  sqB.className = "centerSquare";
  sqB.style.background = r.centerB;

  panelA.appendChild(sqA);
  panelB.appendChild(sqB);

  renderAnswers();
  document.getElementById("nextBtn").disabled = true;
}

function handleAnswer(choice) {
  if (answered) return;

  answered = true;

  let round = rounds[roundIndex];
  let correct = choice === round.answer;

  if (correct) score += 10;

  let buttons = document.querySelectorAll("#answerButtons button");

  buttons.forEach((btn) => {
    if (btn.textContent.toLowerCase() === round.answer) {
      btn.classList.add("correct");
    }

    if (btn.textContent.toLowerCase() === choice && choice !== round.answer) {
      btn.classList.add("wrong");
    }

    btn.disabled = true;
  });

  document.getElementById("feedback").textContent = correct
    ? "Correct Color — Nice Eagle Eye."
    : "Incorrect — So close, but Nope.";

  document.getElementById("nextBtn").disabled = false;

  if (roundIndex === TOTAL_ROUNDS - 1) {
    finishGame();
  }
}

function nextRound() {
  if (!answered) return;

  roundIndex++;
  answered = false;

  document.getElementById("feedback").textContent = "New round.";
  renderRound();
}

function hideFinalScreen() {
  const modal = document.getElementById("finalModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function showFinalScreen() {
  const modal = document.getElementById("finalModal");
  const finalScoreText = document.getElementById("finalScoreText");
  const finalNameText = document.getElementById("finalNameText");
  const finalTimeText = document.getElementById("finalTimeText");
  const finalInstructionsText = document.getElementById("finalInstructionsText");

  // Get student name
  let name = document.getElementById("studentName").value.trim();
  if (name === "") {
    name = "Anonymous";
  }

  // Format timestamp (cleaner format)
  const now = new Date();
  const formattedTime = now.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  // Set content (clean format)
  finalScoreText.textContent = `${score} / 100 (${remark})`;
  finalNameText.textContent = name;
  finalTimeText.textContent = formattedTime;

  finalInstructionsText.textContent =
    "Please capture a full screenshot of this screen (including your name, score, and completion time) and submit it on Canvas.";

  // Show modal
  modal.classList.remove("hidden");
}

function finishGame() {
  if (typeof scormSetScore === "function") {
    scormSetScore(score, 100);
  }

  if (typeof scormSetCompletion === "function") {
    scormSetCompletion("completed");
  }

  if (typeof scormSave === "function") {
    scormSave();
  }

  document.getElementById("feedback").textContent = `Final score ${score}/100`;
  document.getElementById("nextBtn").disabled = true;
  showFinalScreen();
}

function restartGame() {
  hideFinalScreen();

  const nameInput = document.getElementById("studentName");
  if (nameInput) {
    nameInput.value = "";
  }

  buildGame();
  roundIndex = 0;
  score = 0;
  answered = false;

  document.getElementById("feedback").textContent = "New round.";
  renderRound();
}

document.getElementById("nextBtn").onclick = nextRound;
document.getElementById("restartBtn").onclick = restartGame;

const playAgainBtn = document.getElementById("playAgainBtn");
if (playAgainBtn) {
  playAgainBtn.onclick = restartGame;
}

window.onload = () => {
  if (typeof scormInit === "function") {
    scormInit();
  }

  buildGame();
  renderRound();
};
