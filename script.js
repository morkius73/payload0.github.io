const music = document.getElementById("bg-music");
const toggleBtn = document.getElementById("toggle-music");
const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const cursor = document.querySelector(".cursor");
const neonBox = document.querySelector(".neon-box");

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
    music.src = track;  // Set the source to a new track
    music.load();  // Ensure the new track is loaded before playing
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

// Beat-reactive animation
function animateBeat() {
    requestAnimationFrame(animateBeat);
    analyser.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const intensity = Math.min(avg / 150, 1);

    // Box animation
    neonBox.style.transform = `scale(${1 + intensity * 0.15})`;
    neonBox.style.boxShadow = `0 0 ${15 + intensity * 30}px #00ff99, inset 0 0 ${5 + intensity * 10}px #00ff99`;

    // Logo animation
    const logo = document.querySelector(".logo");
    logo.style.transform = `scale(${1 + intensity * 0.2})`;
    logo.style.filter = `drop-shadow(0 0 ${8 + intensity * 20}px #00ff99)`;
}

// Initialize music and start the first track when page is loaded
window.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", initMusicOnce);
});

function initMusicOnce() {
    loadAndPlayRandomTrack();
    setupAnalyzer();
    toggleBtn.textContent = "Pause Music";
    document.body.removeEventListener("click", initMusicOnce);  // Remove event listener after initialization
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
    loadAndPlayRandomTrack(); // This will now correctly load and play a new track
    setupAnalyzer(); // Re-setup audio analyzer for the new track

    // Update total time for the new track
    totalTimeEl.textContent = formatTime(music.duration);
});

// Custom cursor movement
document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Add hover effect to elements
const hoverTargets = document.querySelectorAll('button, .neon-box, a'); // Add more if needed
hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});
