// =========================
// SCROLL REVEAL & NAVBAR
// =========================
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {

  reveals.forEach(section => {
    const windowHeight = window.innerHeight;
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < windowHeight - 100) {
      section.classList.add("active");
    }
  });

  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) navbar.classList.add("scrolled");
  else navbar.classList.remove("scrolled");

});

function scrollToMusic() {
  document.getElementById("music").scrollIntoView({ behavior: "smooth" });
}


// =========================
// CANVAS PARTICLES
// =========================
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// =========================
// HEADER AUDIO
// =========================
const headerAudio = document.getElementById("song");
headerAudio.volume = 0.5;

window.addEventListener("load", async () => {
  try { await headerAudio.play(); }
  catch (err) { console.log("Autoplay bloqueado"); }
});

const playBtn = document.getElementById("playBtn");
if (playBtn) {
  playBtn.addEventListener("click", async () => {
    if (headerAudio.paused) {
      await headerAudio.play();
      playBtn.style.display = "none";
    }
  });
}


// =========================
// DISCOS: PAUSAR HEADER
// =========================
const discographyAudios = document.querySelectorAll("#music audio");

discographyAudios.forEach(audio => {

  audio.addEventListener("play", () => {

    if (!headerAudio.paused) headerAudio.pause();

    discographyAudios.forEach(a => {
      if (a !== audio) a.pause();
    });

  });

  audio.addEventListener("pause", () => {

    const algunoSonando = Array.from(discographyAudios)
      .some(a => !a.paused);

    if (!algunoSonando) {
      headerAudio.play().catch(() => {});
    }

  });

});


// =========================
// AUDIO REACTIVO PRO
// =========================
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const audioSrc = audioCtx.createMediaElementSource(headerAudio);
const analyser = audioCtx.createAnalyser();

audioSrc.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

const logo = document.querySelector(".logo");


// =========================
// NOTAS FLOTANTES
// =========================
const colors = ["#1e90ff", "#ff0000", "#ffeb3b", "#00ffcc"];

class Note {
  constructor() { this.reset(); }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 200;
    this.size = Math.random() * 20 + 10;
    this.speed = Math.random() * 0.6 + 0.4;
    this.char = ["♪", "♩", "♫", "♬"][Math.floor(Math.random() * 4)];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.scale = 1;
  }

  draw() {
    ctx.save();
    ctx.font = this.size + "px Arial";
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.fillText(this.char, 0, 0);
    ctx.restore();

    this.y -= this.speed;
    if (this.y < -50) this.reset();
  }
}

let notes = [];
for (let i = 0; i < 80; i++) notes.push(new Note());


// =========================
// ANIMACIÓN GENERAL
// =========================
function animate() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  analyser.getByteFrequencyData(dataArray);

  // 🔥 SOLO BAJOS (primeros 20)
  let bassSum = 0;
  for (let i = 0; i < 20; i++) {
    bassSum += dataArray[i];
  }

  let bassAverage = bassSum / 20;

  // -----------------
  // 🎤 LOGO PRO
  // -----------------
  let scale = 1 + bassAverage / 300;
  let rotate = bassAverage / 25;
  let glow = bassAverage / 2;
  let hue = bassAverage * 4;

  if (logo) {
    logo.style.transform =
      `scale(${scale}) rotate(${rotate}deg)`;

    logo.style.color =
      `hsl(${hue}, 100%, 60%)`;

    logo.style.filter =
      `drop-shadow(0 0 ${glow}px hsl(${hue}, 100%, 50%))`;
  }

  // -----------------
  // 🌌 FONDO PULSANTE
  // -----------------
  let backgroundIntensity = bassAverage / 5;
  document.body.style.background =
    `radial-gradient(circle at center,
     rgba(${backgroundIntensity},0,40,1) 0%,
     #000 70%)`;

  // -----------------
  // 💡 LUCES ESCENARIO
  // -----------------
  ctx.globalAlpha = 0.08 + bassAverage / 600;
  ctx.fillStyle = `hsl(${hue},100%,50%)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;

  // -----------------
  // 🎵 NOTAS REACTIVAS
  // -----------------
  notes.forEach(n => {
    n.scale = 0.6 + bassAverage / 200;
    n.draw();
  });

  requestAnimationFrame(animate);
}

animate();


// =========================
// RESPONSIVE CANVAS
// =========================
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});