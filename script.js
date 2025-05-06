const music = document.getElementById("bg-music");
const toggleBtn = document.getElementById("toggle-music");
const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const cursor = document.querySelector(".cursor");
const neonBox = document.querySelector(".neon-box");
const logo = document.querySelector(".logo");

let audioContext, analyser, source, dataArray;
let lastTrackIndex = -1;

// List of music tracks
const musicTracks = [
    "song1.mp3",
    "song2.mp3",
    "song3.mp3",
    "song4.mp3"
];

// Pick a new track different from the last one
function getRandomTrack() {
    let index;
    do {
        index = Math.floor(Math.random() * musicTracks.length);
    } while (index === lastTrackIndex);
    lastTrackIndex = index;
    return musicTracks[index];
}

// Load and play a new track
function loadAndPlayRandomTrack() {
    const track = getRandomTrack();
    music.src = track;
    music.load();
    music.play().catch(err => console.error("Playback failed:", err));
}

// Audio analyzer for beat-reactive effects
function setupAnalyzer() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(music);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 64;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        animateBeat();
    }
}

// Beat-reactive animation with more extreme movement and scaling
function animateBeat() {
    requestAnimationFrame(animateBeat);
    analyser.getByteFrequencyData(dataArray);

    const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
    const beatStrength = Math.max(0, (avg / 255 - 0.05) * 3); // Increased multiplier for more extreme effect

    // Increase random movement for more aggressive jitter
    const randomMovementX = Math.random() * beatStrength * 40 - 20;  // Bigger random X movement
    const randomMovementY = Math.random() * beatStrength * 40 - 20;  // Bigger random Y movement

    // Amplified bounce effect for more movement
    const bounceX = Math.sin(Date.now() / 50) * beatStrength * 30;  // Increased bounce X-axis
    const bounceY = Math.sin(Date.now() / 50) * beatStrength * 30;  // Increased bounce Y-axis

    // Apply the more extreme jitter and scaling effect to the neon box
    neonBox.style.transform = `translate(${randomMovementX + bounceX}px, ${randomMovementY + bounceY}px) scale(${1 + beatStrength * 0.4})`;  // More scaling for extreme zoom
    neonBox.style.boxShadow = `0 0 ${40 + beatStrength * 60}px #00ff99, inset 0 0 ${20 + beatStrength * 30}px #00ff99`;

    // Apply more extreme jitter and scaling to the logo
    logo.style.transform = `translate(${randomMovementX}px, ${randomMovementY}px) scale(${1 + beatStrength * 0.3})`;  // Slightly bigger scaling for the logo
    logo.style.filter = `drop-shadow(0 0 ${15 + beatStrength * 25}px #00ff99)`;  // Stronger drop shadow for the logo
}

// Play first random track on click to bypass autoplay restriction
window.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", initMusicOnce);
});

function initMusicOnce() {
    loadAndPlayRandomTrack();
    setupAnalyzer();
    toggleBtn.textContent = "Pause Music";
    document.body.removeEventListener("click", initMusicOnce);
}

// Toggle play/pause
toggleBtn.addEventListener("click", () => {
    if (music.paused) {
        music.play();
        toggleBtn.textContent = "Pause Music";
    } else {
        music.pause();
        toggleBtn.textContent = "Play Music";
    }
});

// Progress bar & timer
music.addEventListener("timeupdate", () => {
    if (music.duration) {
        progressBar.value = (music.currentTime / music.duration) * 100;
        currentTimeEl.textContent = formatTime(music.currentTime);
    }
});

music.addEventListener("loadedmetadata", () => {
    totalTimeEl.textContent = formatTime(music.duration);
});

progressBar.addEventListener("input", () => {
    music.currentTime = (progressBar.value / 100) * music.duration;
});

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// 🎵 Auto change to next random song when one ends
music.addEventListener("ended", () => {
    loadAndPlayRandomTrack();
});

// Custom mouse cursor follow
document.addEventListener('mousemove', (e) => {
    const cursorSize = 20;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    cursor.style.left = `${mouseX - cursorSize / 2}px`;
    cursor.style.top = `${mouseY - cursorSize / 2}px`;
});

// Handle cursor animation based on hover
document.querySelectorAll('.neon-box, .logo, .music-btn').forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
    });
    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
    });
});
