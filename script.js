const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

/* Confetti on load */
window.addEventListener("load", () => {
	const duration = 900, end = Date.now() + duration;
	(function frame(){
		confetti({ particleCount: 40, spread: 60, startVelocity: 35, origin:{ x: Math.random(), y: Math.random()*0.3 } });
		if (Date.now() < end) requestAnimationFrame(frame);
	})();
});

/* Countdown to Sept 18, 2025 (local) */
(function countdown(){
	const target = new Date("2025-09-18T00:00:00");
	const d=$("#cd-d"), h=$("#cd-h"), m=$("#cd-m"), s=$("#cd-s");
	function tick(){
		const now = new Date();
		let diff = Math.max(0, target - now);
		const dd = Math.floor(diff/86400000); diff -= dd*86400000;
		const hh = Math.floor(diff/3600000);  diff -= hh*3600000;
		const mm = Math.floor(diff/60000);    diff -= mm*60000;
		const ss = Math.floor(diff/1000);
		d.textContent = String(dd).padStart(2,"0");
		h.textContent = String(hh).padStart(2,"0");
		m.textContent = String(mm).padStart(2,"0");
		s.textContent = String(ss).padStart(2,"0");
	}
	tick(); setInterval(tick, 1000);
})();

/* Draggable windows by bar */
function makeDraggable(winEl, handleSel='[data-drag]'){
	const handle = $(handleSel, winEl) || winEl;
	let startX=0, startY=0, sx=0, sy=0, dragging=false;
	handle.addEventListener("pointerdown", (e)=>{
		if (e.button !== 0) return;
		dragging = true;
		handle.setPointerCapture(e.pointerId);
		const rect = winEl.getBoundingClientRect();
		sx = rect.left; sy = rect.top;
		startX = e.clientX; startY = e.clientY;
		winEl.style.transition = "none";
		winEl.style.zIndex = String(Date.now());
	});
	handle.addEventListener("pointermove", (e)=>{
		if (!dragging) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		winEl.style.left = Math.max(0, sx + dx) + "px";
		winEl.style.top  = Math.max(0, sy + dy) + "px";
	});
	handle.addEventListener("pointerup", () => { dragging=false; winEl.style.transition=""; });
}

/* Window open/close with animation and ESC close */
function openWindow(win){
	if (win.classList.contains("open")) return;
	win.hidden = false;
	// position slightly random so multiple windows are not stacked exactly
	win.style.left = (200 + Math.random()*60) + "px";
	win.style.top = (120 + Math.random()*40) + "px";
	requestAnimationFrame(()=> win.classList.add("open"));
	win.style.zIndex = String(Date.now());
}
function closeWindow(win){
	win.classList.remove("open");
	// Pause media inside when closing
	const v = $("video", win); if (v) { try{ v.pause(); }catch{} }
	setTimeout(()=>{ win.hidden = true; }, 180);
}
function toggleWindow(win){
	if (win.hidden || !win.classList.contains("open")) openWindow(win);
	else closeWindow(win);
}

/* Bind window chrome */
function bindWindow(win){
	makeDraggable(win);
	const closeBtn = $('[data-close]', win);
	const minBtn = $('[data-minimize]', win);
	if (closeBtn) closeBtn.addEventListener("click", ()=> closeWindow(win));
	if (minBtn) minBtn.addEventListener("click", ()=> win.classList.toggle("minimized"));
	win.addEventListener("pointerdown", ()=> win.style.zIndex = String(Date.now()));
}

/* Icons toggle their windows */
$$(".icon").forEach(icon=>{
	const targetSel = icon.getAttribute("data-target");
	const win = $(targetSel);
	if (!win) return;
	icon.addEventListener("click", ()=> toggleWindow(win));
});

/* Bind all windows */
$$(".window").forEach(bindWindow);

/* Global ESC closes the topmost open window */
document.addEventListener("keydown", (e)=>{
	if (e.key !== "Escape") return;
	const openWins = $$(".window.open").sort((a,b)=> (parseInt(a.style.zIndex||"0") - parseInt(b.style.zIndex||"0")));
	const top = openWins.pop();
	if (top) closeWindow(top);
});

/* Music player */
(function(){
	const audio = $("#audio");
	const playBtn = $("#play");
	const pauseBtn = $("#pause");
	const seek = $("#seek");
	const time = $("#time");
	const music = $("#music");
	makeDraggable(music, ".music__bar");
	$("[data-minimize]", music).addEventListener("click", ()=> music.classList.toggle("minimized"));

	function fmt(t){
		if (isNaN(t)) return "0:00";
		const m = Math.floor(t/60);
		const s = Math.floor(t%60).toString().padStart(2,"0");
		return `${m}:${s}`;
	}
	playBtn.addEventListener("click", ()=> audio.play());
	pauseBtn.addEventListener("click", ()=> audio.pause());
	audio.addEventListener("timeupdate", ()=>{
		if (!isNaN(audio.duration)){
			seek.value = String((audio.currentTime / audio.duration) * 100 || 0);
			time.textContent = `${fmt(audio.currentTime)}`;
		}
	});
	seek.addEventListener("input", ()=>{
		if (!isNaN(audio.duration)){
			audio.currentTime = (Number(seek.value)/100) * audio.duration;
		}
	});
})();

/* Lightbox for gallery */
(function(){
	const lb = $("#lightbox");
	const img = $("#lightboxImg");
	const closeBtn = $(".lightbox__close");
	$$(".gallery .zoom").forEach(el=>{
		el.addEventListener("click", ()=>{
			img.src = el.src;
			lb.classList.add("show");
			lb.setAttribute("aria-hidden","false");
		});
	});
	function close(){ lb.classList.remove("show"); lb.setAttribute("aria-hidden","true"); }
	closeBtn.addEventListener("click", close);
	lb.addEventListener("click", (e)=>{ if (e.target === lb) close(); });
	document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") close(); });
})();

/* FX canvas: faint scan noise */
(() => {
	const c = $("#fx"); const ctx = c.getContext("2d");
	function resize(){ c.width = innerWidth; c.height = innerHeight; }
	window.addEventListener("resize", resize); resize();
	let t=0; (function loop(){
		ctx.clearRect(0,0,c.width,c.height);
		ctx.globalAlpha = 0.02;
		for (let i=0;i<40;i++){
			const y = Math.random()*c.height;
			ctx.fillStyle = "white";
			ctx.fillRect(0, y, c.width, 1);
		}
		ctx.globalAlpha = 1;
		t+=1; requestAnimationFrame(loop);
	})();
})();
