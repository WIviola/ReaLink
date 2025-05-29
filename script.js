// === Element-Referenzen aus dem DOM ===
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

let currentStep = 0;
let minuteCounter = 0;
let rtwTimerStarted = false;
// let metronomeInterval; // wird bei deaktiviertem Beep nicht benötigt
// let audioContext = null; // deaktiviert – Web Audio API

const stepTitles = [
  "Druckpunkt finden",
  "Druckposition einnehmen",
  "Kräftig drücken – 6cm tief",
  "Vielen Dank für Ihren Einsatz"
];

// === Schrittwechsel mit Anzeige-Logik ===
function showStep(index) {
  currentStep = index;

  // Sichtbarkeit der Schritte aktualisieren
  steps.forEach((step, i) => step.classList.toggle("active", i === index));
  stepTitle.innerText = stepTitles[index];

  // Fortschrittsbalken: 100 % bei letztem Schritt
  const progress = Math.min((index + 1) / (steps.length - 1), 1);
  pageProgressBar.style.width = (progress * 100) + "%";

  // Navigation anzeigen/verstecken
  prevBtn.style.display = index > 0 && index < 4 ? "block" : "none";
  nextBtn.style.display = index < 2 ? "block" : "none";
  endBtn.classList.toggle("hidden", index !== 2);
  document.getElementById("navigation").style.display = index === 4 ? "none" : "flex";

  if (index === 2 && !rtwTimerStarted) {
    rtwTimerStarted = true;
    moveRTW();
    setInterval(moveRTW, 60000);
    startMetronome(); // startet MP3/Video in Dauerschleife
  }

  if (index === 2) {
    startMetronome();
  }

  const headerRuler = document.getElementById("headerRuler");
  if (headerRuler) {
    headerRuler.style.display = index === 2 ? "block" : "none";
  }

  const drucktiefeRuler = document.getElementById("drucktiefeRuler");
  if (drucktiefeRuler) {
    drucktiefeRuler.style.display = index === 2 ? "block" : "none";
  }
}

// === Navigation: Vor / Weiter / Beenden ===
prevBtn.addEventListener("click", () => {
  if (currentStep > 0) showStep(currentStep - 1);
});

nextBtn.addEventListener("click", () => {
  // initAudioContext(); // deaktiviert
  if (currentStep < steps.length - 1) showStep(currentStep + 1);
});

endBtn.addEventListener("click", () => {
  stopMetronome(); // Audio/Videoton stoppen
  showStep(3);
});

// === Fortschritt der "RTW"-Anfahrt simulieren ===
function moveRTW() {
  minuteCounter++;
  const percentage = (minuteCounter / 10) * 100;
  const remaining = Math.max(0, 10 - minuteCounter);

  timelineProgress.style.width = `${percentage}%`;
  rtw.style.left = `calc(${percentage}% - 20px)`;

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

  timelineText.textContent = texts[Math.min(minuteCounter - 1, texts.length - 1)];
  timeRemaining.textContent = `Noch ca. ${remaining} Minute${remaining === 1 ? "" : "n"}`;
}

// === Startet Metronomton über MP3-Datei ===
function startMetronomAudio() {
  audioElement.loop = true;
  audioElement.currentTime = 0;

  const playPromise = audioElement.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // Nach 2 Sekunden prüfen, ob wirklich abgespielt wird
        setTimeout(() => {
          if (audioElement.paused || audioElement.currentTime === 0) {
            document.getElementById("audioWarning").style.display = "block";
          }
        }, 2000);
      })
      .catch(() => {
        document.getElementById("audioWarning").style.display = "block";
      });
  }
}

// === Beobachtet DOM auf Aktivierung von Schritt 3 ===
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.classList.contains("active") && mutation.target.id === "step3") {
      startMetronomAudio();
      speakInstruction("Drücken Sie im Takt des Tons. Entlasten. Drücken. Entlasten.");
    }
  });
});
document.querySelectorAll(".step").forEach(el => {
  observer.observe(el, { attributes: true, attributeFilter: ["class"] });
});

// === Sprachansage im Browser (Text-to-Speech) ===
function speakInstruction(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    speechSynthesis.speak(utterance);
  }
}

// === Startet das MP3-Metronom ===
function startMetronome() {
  stopMetronome();      // vorherige Instanz beenden
  startMetronomAudio(); // MP3 neu starten
}

// === Stoppt das MP3-Metronom ===
function stopMetronome() {
  audioElement.pause();
  audioElement.currentTime = 0;
}

/* === OPTIONAL: Web Audio API Ton (Beep), aktuell deaktiviert === */
/*
function initAudioContext() {
  if (!audioContext || audioContext.state === "suspended") {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
  }
}

function playBeep() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  setTimeout(() => oscillator.stop(), 100);
}
*/

// === Umrechnung für Lineal-Anzeige (cm in Pixel) ===
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
  if (ruler) {
    ruler.style.width = `${pixelsPer6CM}px`;
  }
}

// === Initialisierung beim Laden der Seite ===
window.addEventListener("load", () => {
  setRulerLength();
  showStep(0);
});

window.addEventListener("resize", setRulerLength);

window.addEventListener("DOMContentLoaded", () => {
  const cmInPixels = getPixelsPerCM() * 6;
  const ruler = document.querySelector('.ruler');
  if (ruler) {
    ruler.style.width = `${cmInPixels}px`;
  }
});
