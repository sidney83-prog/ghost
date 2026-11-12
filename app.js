const STORAGE_KEY = "ghost_experimento_001_moments";
const $ = (id) => document.getElementById(id);
let moments = loadMoments();

function loadMoments() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveMoments() { localStorage.setItem(STORAGE_KEY, JSON.stringify(moments)); }
function localDay(date = new Date()) {
  const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,"0"), d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function formatDuration(seconds) {
  const s = Number(seconds) || 0;
  if (s < 60) return `${s} s`;
  const mins = Math.floor(s/60), rem = s%60;
  if (mins < 60) return rem ? `${mins} min ${rem} s` : `${mins} min`;
  const hours = Math.floor(mins/60), rest = mins%60;
  return `${hours} h${rest ? ` ${rest} min` : ""}`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function render() {
  const today = localDay();
  const todayMoments = moments.filter(m => m.day === today);
  const totalToday = todayMoments.reduce((sum,m) => sum + Number(m.duration),0);
  const pct = Math.min(100, totalToday/10);
  $("totalSeconds").textContent = totalToday.toLocaleString("pt-BR");
  $("progressFill").style.width = `${pct}%`;
  $("progressPercent").textContent = `${Math.round(pct)}% da referência diária`;
  $("remaining").textContent = totalToday >= 1000 ? "Referência alcançada" : `${(1000-totalToday).toLocaleString("pt-BR")} s restantes`;
  $("momentCount").textContent = `${moments.length} ${moments.length === 1 ? "momento" : "momentos"}`;
  $("allTime").textContent = formatDuration(moments.reduce((s,m)=>s+Number(m.duration),0));
  $("avgPresence").textContent = moments.length ? `${(moments.reduce((s,m)=>s+Number(m.presence),0)/moments.length).toFixed(1).replace(".",",")} / 5` : "—";
  const counts = moments.reduce((acc,m)=>(acc[m.category]=(acc[m.category]||0)+1,acc),{});
  const top = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  $("topCategory").textContent = top ? top[0] : "Ainda observando";
  const timeline = $("timeline");
  if (!moments.length) {
    timeline.innerHTML = `<div class="empty-state panel" id="emptyState"><div class="empty-symbol">✳</div><h3>Seu primeiro rastro começa aqui.</h3><p>Registre um momento vivido. Não precisa ser extraordinário para ter significado.</p></div>`;
    return;
  }
  const sorted = [...moments].sort((a,b)=>b.createdAt-a.createdAt);
  timeline.innerHTML = sorted.map(m => `
    <article class="moment-card panel">
      <div class="moment-symbol">${symbolFor(m.category)}</div>
      <div>
        <div class="moment-title">${escapeHtml(m.title)}</div>
        <div class="moment-meta">${escapeHtml(m.category)} · ${escapeHtml(m.intention)}<br>${new Date(m.createdAt).toLocaleString("pt-BR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})} · energia ${m.energy}/5 · presença ${m.presence}/5</div>
      </div>
      <div style="display:flex;align-items:start"><span class="moment-duration">${formatDuration(m.duration)}</span><button class="delete-button" data-delete="${m.id}" aria-label="Excluir momento">×</button></div>
      ${m.reflection ? `<p class="moment-reflection">${escapeHtml(m.reflection)}</p>` : ""}
    </article>`).join("");
  timeline.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => {
    if (confirm("Excluir este registro?")) {
      moments = moments.filter(m => m.id !== btn.dataset.delete);
      saveMoments(); render(); toast("Registro excluído.");
    }
  }));
}
function symbolFor(category) {
  return ({Presença:"✳",Conexão:"◎",Exploração:"⌁",Criação:"✧",Contemplação:"◌",Aprendizado:"↗",Cuidado:"♡",Outro:"·"})[category] || "✳";
}
function toast(message) {
  const el=$("toast"); el.textContent=message; el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2200);
}
$("momentForm").addEventListener("submit", event => {
  event.preventDefault();
  const duration = Number($("duration").value);
  if (!Number.isInteger(duration) || duration < 1 || duration > 86400) {
    toast("Informe uma duração entre 1 e 86.400 segundos."); return;
  }
  const moment = {
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+Math.random()),
    title: $("momentTitle").value.trim(),
    duration,
    category: $("category").value,
    intention: $("intention").value,
    energy: Number($("energy").value),
    presence: Number($("presence").value),
    reflection: $("reflection").value.trim(),
    createdAt: Date.now(),
    day: localDay()
  };
  if (!moment.title) return;
  moments.push(moment); saveMoments(); render();
  event.target.reset(); $("energy").value=3; $("presence").value=3;
  updateRanges(); toast("Momento guardado. Um novo rastro.");
  window.scrollTo({top:0,behavior:"smooth"});
});
function updateRanges() {
  $("energyOut").textContent = `${$("energy").value} / 5`;
  $("presenceOut").textContent = `${$("presence").value} / 5`;
}
$("energy").addEventListener("input",updateRanges);
$("presence").addEventListener("input",updateRanges);
$("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({app:"Ghost Experimento 001",exportedAt:new Date().toISOString(),moments},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob), a=document.createElement("a");
  a.href=url; a.download=`ghost-registros-${localDay()}.json`; a.click(); URL.revokeObjectURL(url);
  toast("Arquivo de registros exportado.");
});
$("todayLabel").textContent = new Intl.DateTimeFormat("pt-BR",{weekday:"short",day:"2-digit",month:"short",year:"numeric"}).format(new Date()).replace(".","");
updateRanges(); render();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
}
