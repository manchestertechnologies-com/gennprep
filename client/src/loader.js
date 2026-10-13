// Gold loading bar + spinner, shown automatically while the site waits for the server
import api from "./api/axios";

const style = document.createElement("style");
style.textContent = `
#gold-bar { position: fixed; top: 0; left: 0; height: 3px; width: 0; z-index: 9999; pointer-events: none;
  background: linear-gradient(90deg, #a8823f, #d4b26a, #f2e2bb, #d4b26a); background-size: 200% 100%;
  box-shadow: 0 0 12px rgba(212,178,106,.7); opacity: 0; transition: width .4s ease, opacity .3s ease;
  animation: gold-shimmer 1.2s linear infinite; }
#gold-spin { position: fixed; top: 14px; right: 16px; z-index: 9999; display: flex; align-items: center; gap: 8px;
  padding: 8px 14px 8px 10px; border-radius: 999px; background: #141414; border: 1px solid rgba(212,178,106,.4);
  box-shadow: 0 0 30px -8px rgba(212,178,106,.5); color: #d4b26a; font: 600 13px Poppins, Inter, sans-serif;
  opacity: 0; transform: translateY(-6px); transition: opacity .25s ease, transform .25s ease; pointer-events: none; }
#gold-spin.show { opacity: 1; transform: none; }
#gold-spin i { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(212,178,106,.25);
  border-top-color: #d4b26a; animation: gold-turn .8s linear infinite; }
@keyframes gold-shimmer { to { background-position: -200% 0; } }
@keyframes gold-turn { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { #gold-bar, #gold-spin i { animation: none; } }
`;
document.head.appendChild(style);

const bar = document.createElement("div");
bar.id = "gold-bar";
const spin = document.createElement("div");
spin.id = "gold-spin";
spin.setAttribute("role", "status");
spin.innerHTML = "<i></i><span>Loading…</span>";
document.body.append(bar, spin);

let active = 0, barTimer = 0, spinTimer = 0, grow = 0;

const start = () => {
  active++;
  if (active > 1) return;
  clearTimeout(barTimer); clearTimeout(spinTimer); clearInterval(grow);
  // Only show for loads longer than a moment, so quick clicks don't flicker
  barTimer = setTimeout(() => {
    bar.style.opacity = "1";
    let w = 10;
    bar.style.width = w + "%";
    grow = setInterval(() => { w = Math.min(90, w + (90 - w) * 0.08); bar.style.width = w + "%"; }, 200);
  }, 150);
  spinTimer = setTimeout(() => spin.classList.add("show"), 1000);
};

const stop = () => {
  active = Math.max(0, active - 1);
  if (active > 0) return;
  clearTimeout(barTimer); clearTimeout(spinTimer); clearInterval(grow);
  spin.classList.remove("show");
  if (bar.style.opacity === "1") {
    bar.style.width = "100%";
    setTimeout(() => { bar.style.opacity = "0"; setTimeout(() => { bar.style.width = "0"; }, 300); }, 200);
  }
};

api.interceptors.request.use((config) => { start(); return config; }, (error) => { stop(); return Promise.reject(error); });
api.interceptors.response.use((res) => { stop(); return res; }, (error) => { stop(); return Promise.reject(error); });