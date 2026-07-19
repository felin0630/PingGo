let players=[],mode="player";
const query=document.getElementById("query"),group=document.getElementById("group"),results=document.getElementById("results"),status=document.getElementById("status"),empty=document.getElementById("empty"),error=document.getElementById("error");
const norm=v=>String(v||"").replace(/臺/g,"台").replace(/\s+/g,"").toLowerCase();
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
function selectedPlayers(){
 const q=norm(query.value),g=group.value;
 return players.filter(p=>(g==="all"||p.group===g)&&(!q||norm([p.name,p.school,p.seed,...(p.alias||[])].join("|")).includes(q)));
}
function playerCard(p){
 return `<article class="card"><div class="card-top"><div><div class="name">${esc(p.name)}</div><div class="sub">${esc(p.school)}・籤位 ${esc(p.seed)}・籤表第 ${esc(p.page)} 頁</div></div><div class="badge">${esc(p.group)}</div></div>
 <div class="route"><div class="route-title">若一路晉級的可能場次</div>
 ${(p.matches||[]).map((m,i)=>`<div class="step"><div class="dot">${i+1}</div><div class="stepbody"><span class="matchno">場次 ${esc(m.match)}</span>${m.time?`<span class="time">${esc(m.time)}</span>`:""}<div class="hint">${i===0?"起始／第一個可能場次":"晉級後才會出賽，對手待前場結果確認"}</div></div></div>`).join("")||'<div class="hint">請查看原始籤表確認。</div>'}
 </div></article>`;
}
function renderPlayers(){
 const found=selectedPlayers();status.textContent=`找到 ${found.length} 位選手`;empty.hidden=found.length>0;results.innerHTML=found.slice(0,100).map(playerCard).join("");
}
function renderSchools(){
 const q=norm(query.value),g=group.value,schools={};
 players.forEach(p=>{if(g!=="all"&&p.group!==g)return;if(q&&!norm(p.school).includes(q))return;(schools[p.school]??=[]).push(p)});
 const entries=Object.entries(schools).sort((a,b)=>a[0].localeCompare(b[0],"zh-Hant"));status.textContent=`找到 ${entries.length} 所學校`;empty.hidden=entries.length>0;
 results.innerHTML=entries.slice(0,80).map(([school,ps])=>`<article class="card"><div class="name">${esc(school)}</div><div class="sub">共 ${ps.length} 位選手</div><div class="school-list">${ps.sort((a,b)=>a.group.localeCompare(b.group,"zh-Hant")||a.seed-b.seed).map(p=>`<div class="row"><strong>${esc(p.name)}</strong><small>${esc(p.group)}・籤位 ${esc(p.seed)}・可能場次 ${(p.matches||[]).map(m=>m.match).join(" → ")||"待確認"}</small></div>`).join("")}</div></article>`).join("");
}
function renderMatches(){
 const raw=query.value.trim(),matchNo=parseInt(raw,10),g=group.value;
 if(!matchNo){status.textContent="請輸入場次編號";results.innerHTML="";empty.hidden=true;return}
 const found=players.filter(p=>(g==="all"||p.group===g)&&(p.matches||[]).some(m=>m.match===matchNo));
 status.textContent=`場次 ${matchNo}：找到 ${found.length} 位可能相關選手`;empty.hidden=found.length>0;
 results.innerHTML=`<article class="card"><div class="name">場次 ${matchNo}</div><div class="sub">以下為籤表路線中可能進入此場次的選手</div><div class="match-list">${found.map(p=>`<div class="row"><strong>${esc(p.name)}</strong><small>${esc(p.school)}・${esc(p.group)}・籤位 ${esc(p.seed)}</small></div>`).join("")}</div></article>`;
}
function render(){results.innerHTML="";if(mode==="player")renderPlayers();else if(mode==="school")renderSchools();else renderMatches()}
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));b.classList.add("active");mode=b.dataset.mode;query.placeholder=mode==="player"?"輸入選手姓名、學校或籤位編號":mode==="school"?"輸入學校名稱":"輸入場次編號";query.value="";render()}));
query.addEventListener("input",render);group.addEventListener("change",render);
fetch("./players.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{players=d;[...new Set(players.map(p=>p.group))].sort((a,b)=>a.localeCompare(b,"zh-Hant")).forEach(g=>group.insertAdjacentHTML("beforeend",`<option>${esc(g)}</option>`));render()}).catch(()=>{status.textContent="";error.hidden=false});
