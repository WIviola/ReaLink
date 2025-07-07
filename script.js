// === DOM-Elemente ===
const steps = document.querySelectorAll(".step");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const endBtn = document.getElementById("endBtn");
const stepTitle = document.getElementById("step-title");
const pageProgressBar = document.querySelector(".page-progress");
const timelineProgress = document.getElementById("timelineProgress");
const timelineText = document.getElementById("timelineText");
const timeRemaining = document.getElementById("timeRemaining");
const rtw = document.getElementById("rtw");
const audioElement = document.getElementById("metronomAudio");
const stepAudio = new Audio();

let currentStep = 0;
let minuteCounter = 0;
let rtwTimerStarted = false;
let rtwIntervalId = null;

const stepTitles = [
  "Druckpunkt finden",
  "Druckposition einnehmen",
  "Kräftig drücken – 6cm tief",
  "Vielen Dank für Ihren Einsatz"
];

// === Schritt anzeigen ===
function showStep(index) {
  currentStep = index;

  steps.forEach((step, i) => step.classList.toggle("active", i === index));
  stepTitle.innerText = stepTitles[index];
  playStepAudio(index);

  const progress = Math.min((index + 1) / (steps.length - 1), 1);
  pageProgressBar.style.width = (progress * 100) + "%";

  prevBtn.style.display = index > 0 ? "block" : "none";
  nextBtn.style.display = index < 2 ? "block" : "none";
  endBtn.classList.toggle("hidden", index !== 2);
  document.getElementById("navigation").style.display = index === 4 ? "none" : "flex";

  if (index === 2) {
    startMetronome();
    if (!rtwTimerStarted) {
      rtwTimerStarted = true;
      moveRTW();
      rtwIntervalId = setInterval(moveRTW, 60000);
    }
  }

  const headerRuler = document.getElementById("headerRuler");
  if (headerRuler) headerRuler.style.display = index === 2 ? "block" : "none";

  const drucktiefeRuler = document.getElementById("drucktiefeRuler");
  if (drucktiefeRuler) drucktiefeRuler.style.display = index === 2 ? "block" : "none";
}

// === Audio für Schritt abspielen ===
function playStepAudio(index) {
  stepAudio.pause();
  stepAudio.currentTime = 0;
  stepAudio.src = `assets/step${index}.mp3`;
  stepAudio.play().catch((error) => {
    console.warn("Audio konnte nicht automatisch abgespielt werden:", error);
  });
}

// === Navigation ===
prevBtn.addEventListener("click", () => {
  if (currentStep > 0) showStep(currentStep - 1);
});

nextBtn.addEventListener("click", () => {
  if (currentStep < steps.length - 1) showStep(currentStep + 1);
});

endBtn.addEventListener("click", () => {
  stopMetronome();
  showStep(3);
});

// === Metronomsteuerung ===
function startMetronome() {
  stopMetronome();
  startMetronomAudio();
}

function stopMetronome() {
  audioElement.pause();
  audioElement.currentTime = 0;
}

function startMetronomAudio() {
  audioElement.loop = true;
  audioElement.currentTime = 0;
  audioElement.play().catch(() => {});
}

// === RTW-Simulation ===
function moveRTW() {
  if (minuteCounter >= 10) {
    clearInterval(rtwIntervalId);
    return;
  }

  minuteCounter++;
  const percentage = (minuteCounter / 10) * 100;
  const remaining = Math.max(0, 10 - minuteCounter);

  if (timelineProgress) timelineProgress.style.width = `${percentage}%`;
  if (rtw && rtw.offsetWidth > 0 && rtw.parentElement?.offsetWidth > 0) {
    const maxLeft = rtw.parentElement.offsetWidth - rtw.offsetWidth;
    const newLeft = Math.min((percentage / 100) * rtw.parentElement.offsetWidth, maxLeft);
    rtw.style.left = `${newLeft}px`;
  }

  if (timelineText) timelineText.textContent = getTimelineText(minuteCounter);
  if (timeRemaining) timeRemaining.textContent = `Noch ca. ${remaining} Minute${remaining === 1 ? "" : "n"}`;

  const timelineProgressVertical = document.getElementById("timelineProgressVertical");
  const rtwVertical = document.getElementById("rtwVertical");
  const bar = document.querySelector(".timeline-vertical-bar");
  const timeRemainingVertical = document.getElementById("timeRemainingVertical");

  if (bar && rtwVertical && timelineProgressVertical) {
    const barHeight = bar.offsetHeight;
    const maxTop = barHeight - rtwVertical.offsetHeight;
    const newTop = Math.min((percentage / 100) * barHeight, maxTop);

    timelineProgressVertical.style.height = `${percentage}%`;
    rtwVertical.style.top = `${newTop}px`;
    if (timeRemainingVertical) timeRemainingVertical.textContent = `ca. ${remaining} Min`;
  }
}

function getTimelineText(minute) {
  const texts = [
    "Drücken Sie im Takt des Tons!",
    "Jeder Druck bringt Blut zum Gehirn.",
    "Sehr gut - das rettet Leben",
    "Weiterdrücken - bis Sie abgelöst werden",
    "Jeder Druck bringt Blut zum Gehirn.",
    "Kräftig weiterdrücken, auch wenn es knackt!",
    "Sehr gut - das rettet Leben",
    "Jeder Druck bringt Blut zum Gehirn.",
    "Kräftig weiterdrücken, auch wenn es knackt!",
    "Drücken Sie weiter bis Sie vom Rettungsdienst abgelöst werden!"
  ];
  return texts[Math.min(minute - 1, texts.length - 1)];
}

// === Lineal für Drucktiefe ===
function getPixelsPerCM() {
  const div = document.createElement("div");
  div.style.width = "1cm";
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  document.body.appendChild(div);
  const pixelsPerCM = div.offsetWidth;
  document.body.removeChild(div);
  return pixelsPerCM;
}

function setRulerLength() {
  const pixelsPer6CM = getPixelsPerCM() * 6;
  const ruler = document.querySelector(".ruler");
  if (ruler) ruler.style.width = `${pixelsPer6CM}px`;
}

// === Initialisierung ===
window.addEventListener("load", () => {
  setRulerLength();

  // Nur initial Step anzeigen, wenn CPR-Bereich sichtbar ist (z. B. nach direktem Link)
  const cprVisible = document.getElementById("cpr").style.display !== "none";
  if (cprVisible) {
    showStep(0);
  }
});


window.addEventListener("resize", setRulerLength);

let initialStepShown = false;

window.addEventListener("load", () => {
  setRulerLength();

  const cprVisible = document.getElementById("cpr").style.display !== "none";
  if (cprVisible && !initialStepShown) {
    showStep(0);
    initialStepShown = true;
  }
});


