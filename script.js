const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

/* Confetti + floating hearts on load */
window.addEventListener("load", () => {
	// quick confetti
	const duration = 900, end = Date.now() + duration;
	(function frame(){
		confetti({ particleCount: 40, spread: 60, startVelocity: 35, origin:{ x: Math.random(), y: Math.random()*0.3 } });
		if (Date.now() < end) requestAnimationFrame(frame);
	})();
	// floating hearts
	const fx = $("#fx"); const ctx = fx.getContext("2d");
	function resize(){ fx.width = innerWidth; fx.height = innerHeight; }
	window.addEventListener("resize", resize); resize();
	const hearts = Array.from({length:24}, () => ({
		x: Math.random()*fx.width,
		y: fx.height + Math.random()*fx.height*0.6,
		s: 0.6 + Math.random()*0.9,
		v: 0.6 + Math.random()*1.1,
		a: Math.random()*Math.PI
	}));
	function drawHeart(x,y,size){
		ctx.save(); ctx.translate(x,y); ctx.scale(size,size);
		ctx.fillStyle = "rgba(255,120,170,.25)";
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.bezierCurveTo(-12,-12, -24,10, 0,24);
		ctx.bezierCurveTo(24,10, 12,-12, 0,0);
		ctx.fill(); ctx.restore();
	}
	(function loop(){
		ctx.clearRect(0,0,fx.width,fx.height);
		hearts.forEach(h=>{
			h.y -= h.v * 0.8; h.x += Math.sin(h.a+=0.02) * 0.6;
			if (h.y < -30) { h.y = fx.height + 30; h.x = Math.random()*fx.width; }
			drawHeart(h.x, h.y, h.s);
		});
		requestAnimationFrame(loop);
	})();
});

/* Draggable windows */
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

/* Window open/close behavior */
function openWindow(win){
	if (win.classList.contains("open")) return;
	win.hidden = false;
	win.style.left = (200 + Math.random()*60) + "px";
	win.style.top = (120 + Math.random()*40) + "px";
	requestAnimationFrame(()=> win.classList.add("open"));
	win.style.zIndex = String(Date.now());
}
function closeWindow(win){
	// pause media when closing
	const v = $("video", win); if (v) { try{ v.pause(); v.currentTime = v.currentTime; }catch{} }
	win.classList.remove("open");
	setTimeout(()=>{ win.hidden = true; }, 200);
}
function toggleWindow(win){ (win.hidden || !win.classList.contains("open")) ? openWindow(win) : closeWindow(win); }

/* Bind windows */
function bindWindow(win){
	makeDraggable(win);
	const closeBtn = $('[data-close]', win);
	const minBtn = $('[data-minimize]', win);
	if (closeBtn) closeBtn.addEventListener("click", ()=> closeWindow(win));
	if (minBtn) minBtn.addEventListener("click", ()=> win.classList.toggle("minimized"));
	win.addEventListener("pointerdown", ()=> win.style.zIndex = String(Date.now()));
}
$$(".window").forEach(bindWindow);

/* Icons toggle open/close */
$$(".icon").forEach(icon=>{
	const win = $(icon.getAttribute("data-target"));
	if (!win) return;
	icon.addEventListener("click", ()=> toggleWindow(win));
});

/* Global Esc closes topmost */
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
			time.textContent = fmt(audio.currentTime);
		}
	});
	seek.addEventListener("input", ()=>{
		if (!isNaN(audio.duration)){
			audio.currentTime = (Number(seek.value)/100) * audio.duration;
		}
	});
})();
