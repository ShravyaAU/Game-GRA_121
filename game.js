const supabaseUrl = "https://siicswvrpnpiyojgsphr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaWNzd3ZycG5waXlvZ2pzcGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzk4MjIsImV4cCI6MjA5MTg1NTgyMn0.foFX6CCVpaVWoX0Qbiiz3t5zoDAJ_aIxK-G-35DU-E8";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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
  return `rgb(${randomInt(20, 235)}, ${randomInt(20, 235)}, ${randomInt(20, 235)})`;
}

function slightlyDifferent(color) {
  const nums = color.match(/\d+/g).map(Number);
  nums[0] = clamp(nums[0] + randomInt(-10, 10), 0, 255);
  nums[1] = clamp(nums[1] + randomInt(-10, 10), 0, 255);
  nums[2] = clamp(nums[2] + randomInt(-10, 10), 0, 255);
  return `rgb(${nums[0]}, ${nums[1]}, ${nums[2]})`;
}

function buildRound(n) {
  const same = [1, 3, 4, 6, 7, 9].includes(n);

  const bgA = randomColor();
  const bgB = randomColor();
  const center = randomColor();

  return {
    bgA,
    bgB,
    centerA: center,
    centerB: same ? center : slightlyDifferent(center),
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
  const container = document.getElementById("answerButtons");
  container.innerHTML = "";

  const options = shuffle(["same", "different"]);

  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.textContent = opt.toUpperCase();
    btn.onclick = () => handleAnswer(opt);
    container.appendChild(btn);
  });
}

function renderRound() {
  const r = rounds[roundIndex];

  document.getElementById("round").textContent = `Round ${roundIndex + 1} / ${TOTAL_ROUNDS}`;
  document.getElementById("score").textContent = `Score: ${score}`;

  document.getElementById("progressBar").style.width =
    (roundIndex / TOTAL_ROUNDS) * 100 + "%";

  const panelA = document.getElementById("panelA");
  const panelB = document.getElementById("panelB");

  panelA.style.background = r.bgA;
  panelB.style.background = r.bgB;

  panelA.innerHTML = "";
  panelB.innerHTML = "";

  const sqA = document.createElement("div");
  sqA.className = "centerSquare";
  sqA.style.background = r.centerA;

  const sqB = document.createElement("div");
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

  const round = rounds[roundIndex];
  const correct = choice === round.answer;

  if (correct) score += 10;

  const buttons = document.querySelectorAll("#answerButtons button");
  buttons.forEach((btn) => {
    const text = btn.textContent.toLowerCase();

    if (text === round.answer) {
      btn.classList.add("correct");
    }

    if (text === choice && choice !== round.answer) {
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
    modal.style.display = "none";
  }
}

function showFinalScreen() {
  const modal = document.getElementById("finalModal");
  const finalScoreText = document.getElementById("finalScoreText");
  const finalNameText = document.getElementById("finalNameText");
  const finalTimeText = document.getElementById("finalTimeText");
  const finalInstructionsText = document.getElementById("finalInstructionsText");

  if (!modal || !finalScoreText || !finalNameText || !finalTimeText || !finalInstructionsText) {
    console.error("Final screen element missing");
    return;
  }

  let name = document.getElementById("studentName").value.trim();
  if (name === "") {
    name = "Anonymous";
  }

  const now = new Date();
  const formattedTime =
    now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) +
    " • " +
    now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  let remark = "";
  if (score >= 80) remark = "Excellent performance!";
  else if (score >= 50) remark = "Good job!";
  else remark = "Keep practicing!";

  finalScoreText.textContent = `${score} / 100 (${remark})`;
  finalNameText.textContent = name;
  finalTimeText.textContent = formattedTime;
  finalInstructionsText.textContent =
    "Please capture a full screenshot of this screen, including your name, score, and completion time, and submit it on Canvas.";

  modal.classList.remove("hidden");
  modal.style.display = "flex";
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

  buildGame();
  roundIndex = 0;
  score = 0;
  answered = false;

  document.getElementById("feedback").textContent = "Look closely. Your eyes may be deceiving you.";
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
