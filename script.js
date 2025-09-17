// Personalization
const celebrantName = "Prima";
const targetDate = new Date("2025-09-18T00:00:00"); // local midnight

// Animated starfield
(() => {
	const canvas = document.getElementById("bg-stars");
	const ctx = canvas.getContext("2d");
	let w, h, stars;

	function resize() {
		w = canvas.width = window.innerWidth;
		h = canvas.height = window.innerHeight;
		stars = Array.from({ length: Math.ceil((w * h) / 9000) }, () => ({
			x: Math.random() * w,
			y: Math.random() * h,
			r: Math.random() * 1.6 + 0.4,
			a: Math.random() * Math.PI * 2,
			s: Math.random() * 0.6 + 0.2
		}));
	}
	function frame() {
		ctx.clearRect(0, 0, w, h);
		for (const s of stars) {
			s.a += 0.02;
			const twinkle = (Math.sin(s.a) + 1) / 2;
			ctx.fillStyle = `rgba(255,180,220,${0.35 + twinkle * 0.65})`;
			ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
			s.y += s.s; if (s.y > h) s.y = -5;
		}
		requestAnimationFrame(frame);
	}
	window.addEventListener("resize", resize);
	resize(); frame();
})();

// Countdown
(function initCountdown() {
	const ids = { d: "d", h: "h", m: "m", s: "s" };
	function tick() {
		const now = new Date();
		let diff = Math.max(0, targetDate - now);
		const d = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= d * 86400000;
		const h = Math.floor(diff / (1000 * 60 * 60)); diff -= h * 3600000;
		const m = Math.floor(diff / (1000 * 60)); diff -= m * 60000;
		const s = Math.floor(diff / 1000);
		document.getElementById(ids.d).textContent = String(d).padStart(2, "0");
		document.getElementById(ids.h).textContent = String(h).padStart(2, "0");
		document.getElementById(ids.m).textContent = String(m).padStart(2, "0");
		document.getElementById(ids.s).textContent = String(s).padStart(2, "0");
	}
	tick(); setInterval(tick, 1000);
})();

// Greeting card open/close + confetti
(function initCard() {
	const card = document.getElementById("greetingCard");
	const openBtn = document.getElementById("openCardBtn");

	function toggle(openExplicit) {
		const willOpen = openExplicit ?? !card.classList.contains("open");
		card.classList.toggle("open", willOpen);
		card.setAttribute("aria-expanded", String(willOpen));
		if (willOpen) {
			// Burst confetti
			const end = Date.now() + 600;
			const colors = ["#ff8ab3","#ff5e9c","#ffb089","#ffe9e0"];
			(function frame() {
				confetti({
					particleCount: 40,
					spread: 60,
					startVelocity: 35,
					origin: { x: Math.random(), y: 0.2 + Math.random() * 0.2 },
					colors
				});
				if (Date.now() < end) requestAnimationFrame(frame);
			})();
		}
	}
	card.addEventListener("click", () => toggle());
	card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
	openBtn.addEventListener("click", () => toggle(true));
})();

// Lightbox for gallery
(function initLightbox() {
	const lb = document.getElementById("lightbox");
	const img = document.getElementById("lightboxImg");
	const closeBtn = lb.querySelector(".lightbox__close");
	document.querySelectorAll(".zoomable").forEach((el) => {
		el.addEventListener("click", () => {
			img.src = el.src;
			lb.classList.add("show");
			lb.setAttribute("aria-hidden", "false");
		});
	});
	function close() {
		lb.classList.remove("show");
		lb.setAttribute("aria-hidden", "true");
	}
	closeBtn.addEventListener("click", close);
	lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
	document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();

// Background music via YouTube (loops). Autoplay requires muted until user interacts.
(function initMusic() {
	const videoId = "lD0QTb-ieVY";
	const btn = document.getElementById("musicBtn");
	let player, isReady = false, isPlaying = false, userInteracted = false;

	function loadApi() {
		if (window.YT) return ready();
		const tag = document.createElement("script");
		tag.src = "https://www.youtube.com/iframe_api";
		document.head.appendChild(tag);
		window.onYouTubeIframeAPIReady = ready;
	}
	function ready() {
		player = new YT.Player("yt-player", {
			videoId,
			playerVars: {
				autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1,
				iv_load_policy: 3, rel: 0, loop: 1, playlist: videoId
			},
			events: {
				onReady(ev){
					isReady = true;
					ev.target.mute(); // enable autoplay
					ev.target.playVideo();
					isPlaying = true;
					btn.textContent = "Mute music";
				},
				onStateChange(ev){
					// Loop safety
					if (ev.data === YT.PlayerState.ENDED) ev.target.playVideo();
				}
			}
		});
	}
	btn.addEventListener("click", () => {
		userInteracted = true;
		if (!isReady) return;
		if (player.isMuted()) { player.unMute(); btn.textContent = isPlaying ? "Mute music" : "Play music"; }
		else { player.mute(); btn.textContent = "Unmute music"; }
		if (!isPlaying) { player.playVideo(); isPlaying = true; }
	});
	loadApi();
})();

// Small nicety: set title dynamically
document.title = `${celebrantName} • 22nd Birthday`;
