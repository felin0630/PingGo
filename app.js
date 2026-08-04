"use strict";

const STORAGE_KEY = "pinggo-lists-v1";
const SCHOOL_STORAGE_KEY = "pinggo-favorite-schools-v1";
const HIDE_ENDED_KEY = "pinggo-hide-ended-v1";
const CLOUD_DOCUMENT_VERSION = 1;
let cloudSaveTimer = 0;
const eventFacts = document.getElementById("eventFacts");
const mobileLayout = window.matchMedia("(max-width: 640px)");
const compactEventFacts = event => { if(event.matches) eventFacts.removeAttribute("open"); else eventFacts.setAttribute("open",""); };
compactEventFacts(mobileLayout); mobileLayout.addEventListener("change",compactEventFacts);
const EVENT = { dateRange: "日期待核對", venue: "場地待核對", address: "臺北市松山區南京東路四段 10 號" };
const GROUP_SCHEDULES = [
  { groups:["9歲男","10歲男","11歲男","9歲女"], division:"北區賽（一）", dateRange:"2026/7/17–7/22", startDate:"2026-07-17", endDate:"2026-07-22", venue:"臺北市體育館一樓" },
  { groups:["12歲男","13歲男","15歲男","13歲女","15歲女"], division:"北區賽（二）", dateRange:"2026/8/3–8/6", startDate:"2026-08-03", endDate:"2026-08-06", venue:"臺北市體育館四樓" },
  { groups:["10歲女","11歲女","12歲女"], division:"北區賽（三）", dateRange:"2026/8/5–8/6", startDate:"2026-08-05", endDate:"2026-08-06", venue:"臺北市體育館一樓" }
];
// 官方時間預訂表：組別 -> [第幾次賽, 起始場次, 結束場次, 日期, 預定時間]
const OFFICIAL_MATCH_TIMES = {
  "10歲男":[[1,1,80,"2026/7/17","08:30"],[1,81,144,"2026/7/17","09:40"],[1,145,176,"2026/7/17","10:50"],[1,177,208,"2026/7/17","12:10"],[1,209,240,"2026/7/17","13:30"],[1,241,272,"2026/7/17","14:50"],[1,273,304,"2026/7/17","16:00"],[1,305,320,"2026/7/17","17:10"],[1,321,328,"2026/7/17","17:40"],[1,329,335,"2026/7/18","08:30"],[2,1,80,"2026/7/18","08:30"],[2,81,144,"2026/7/18","09:40"],[2,145,176,"2026/7/18","10:50"],[2,177,208,"2026/7/18","12:10"],[2,209,240,"2026/7/18","13:30"],[2,241,272,"2026/7/18","14:50"],[2,273,304,"2026/7/18","16:00"],[2,305,320,"2026/7/18","17:10"],[2,321,328,"2026/7/18","17:40"],[3,1,80,"2026/7/19","08:30"],[3,81,144,"2026/7/19","09:40"],[3,145,176,"2026/7/19","10:50"],[3,177,208,"2026/7/19","12:10"],[3,209,240,"2026/7/19","13:30"],[3,241,272,"2026/7/19","14:50"],[3,273,304,"2026/7/19","16:00"],[3,305,320,"2026/7/19","17:10"],[3,321,328,"2026/7/19","17:40"]],
  "11歲男":[[1,1,20,"2026/7/17","09:40"],[1,21,80,"2026/7/17","10:50"],[1,81,144,"2026/7/17","12:10"],[1,145,208,"2026/7/17","13:30"],[1,209,272,"2026/7/17","14:50"],[1,273,304,"2026/7/17","16:00"],[1,305,320,"2026/7/17","17:10"],[1,321,328,"2026/7/17","17:40"],[1,329,335,"2026/7/18","09:40"],[2,1,20,"2026/7/18","09:40"],[2,21,80,"2026/7/18","10:50"],[2,81,144,"2026/7/18","12:10"],[2,145,208,"2026/7/18","13:30"],[2,209,272,"2026/7/18","14:50"],[2,273,304,"2026/7/18","16:00"],[2,305,320,"2026/7/18","17:10"],[2,321,328,"2026/7/18","17:40"],[3,1,20,"2026/7/19","09:40"],[3,21,80,"2026/7/19","10:50"],[3,81,144,"2026/7/19","12:10"],[3,145,208,"2026/7/19","13:30"],[3,209,272,"2026/7/19","14:50"],[3,273,304,"2026/7/19","16:00"],[3,305,320,"2026/7/19","17:10"],[3,321,328,"2026/7/19","17:40"]],
  "9歲男":[[1,1,112,"2026/7/20","08:00"],[1,113,224,"2026/7/20","10:00"],[1,225,288,"2026/7/20","12:00"],[1,289,320,"2026/7/20","13:00"],[1,321,352,"2026/7/20","14:00"],[1,353,384,"2026/7/20","15:10"],[1,385,416,"2026/7/20","16:20"],[1,417,448,"2026/7/20","17:20"],[1,449,464,"2026/7/20","18:20"],[1,465,472,"2026/7/20","19:20"],[1,473,479,"2026/7/21","08:00"],[2,1,112,"2026/7/21","08:00"],[2,113,224,"2026/7/21","10:00"],[2,225,288,"2026/7/21","12:00"],[2,289,320,"2026/7/21","13:00"],[2,321,352,"2026/7/21","14:00"],[2,353,384,"2026/7/21","15:10"],[2,385,416,"2026/7/21","16:20"],[2,417,448,"2026/7/21","17:20"],[2,449,464,"2026/7/21","18:20"],[2,465,472,"2026/7/21","19:20"],[3,1,112,"2026/7/22","08:00"],[3,113,224,"2026/7/22","10:00"],[3,225,288,"2026/7/22","12:00"],[3,289,320,"2026/7/22","13:30"],[3,321,352,"2026/7/22","15:00"],[3,353,384,"2026/7/22","16:30"],[3,385,416,"2026/7/22","17:30"],[3,417,448,"2026/7/22","18:30"],[3,449,464,"2026/7/22","19:30"],[3,465,472,"2026/7/22","20:00"]],
  "9歲女":[[1,1,48,"2026/7/20","13:00"],[1,49,112,"2026/7/20","14:00"],[1,113,176,"2026/7/20","15:10"],[1,177,208,"2026/7/20","16:20"],[1,209,240,"2026/7/20","17:20"],[1,241,272,"2026/7/20","18:20"],[1,273,288,"2026/7/20","19:20"],[1,289,296,"2026/7/20","19:50"],[1,297,303,"2026/7/21","12:00"],[2,1,48,"2026/7/21","13:00"],[2,49,112,"2026/7/21","14:00"],[2,113,176,"2026/7/21","15:10"],[2,177,208,"2026/7/21","16:20"],[2,209,240,"2026/7/21","17:20"],[2,241,272,"2026/7/21","18:20"],[2,273,288,"2026/7/21","19:20"],[2,289,296,"2026/7/21","19:50"],[3,1,48,"2026/7/22","12:00"],[3,49,112,"2026/7/22","13:30"],[3,113,176,"2026/7/22","15:00"],[3,177,208,"2026/7/22","16:30"],[3,209,240,"2026/7/22","17:30"],[3,241,272,"2026/7/22","18:30"],[3,273,288,"2026/7/22","19:30"],[3,289,296,"2026/7/22","20:00"]],
  "10歲女":[[1,1,24,"2026/8/5","10:30"],[1,25,88,"2026/8/5","11:30"],[1,89,120,"2026/8/5","13:00"],[1,121,136,"2026/8/5","14:00"],[1,137,144,"2026/8/5","15:00"],[1,145,151,"2026/8/5","16:30"],[2,1,24,"2026/8/5","18:00"],[2,25,88,"2026/8/5","19:30"],[2,89,120,"2026/8/6","08:00"],[2,121,136,"2026/8/6","09:30"],[2,137,144,"2026/8/6","11:00"],[3,1,24,"2026/8/6","13:00"],[3,25,88,"2026/8/6","14:00"],[3,89,120,"2026/8/6","16:00"],[3,121,136,"2026/8/6","18:00"],[3,137,144,"2026/8/6","19:00"]],
  "11歲女":[[1,1,24,"2026/8/5","14:00"],[1,25,88,"2026/8/5","15:00"],[1,89,120,"2026/8/5","16:30"],[1,121,136,"2026/8/5","18:00"],[1,137,144,"2026/8/5","19:30"],[1,145,151,"2026/8/6","08:00"],[2,1,24,"2026/8/6","08:00"],[2,25,88,"2026/8/6","09:30"],[2,89,120,"2026/8/6","11:00"],[2,121,136,"2026/8/6","12:00"],[2,137,144,"2026/8/6","13:00"],[3,1,24,"2026/8/6","14:00"],[3,25,88,"2026/8/6","16:00"],[3,89,120,"2026/8/6","18:00"],[3,121,136,"2026/8/6","19:00"],[3,137,144,"2026/8/6","19:30"]],
  "12歲女":[[1,1,48,"2026/8/5","10:30"],[1,49,80,"2026/8/5","11:30"],[1,81,96,"2026/8/5","13:00"],[1,97,104,"2026/8/5","14:00"],[1,105,111,"2026/8/5","15:00"],[2,1,48,"2026/8/5","16:30"],[2,49,80,"2026/8/5","18:00"],[2,81,96,"2026/8/6","08:00"],[2,97,104,"2026/8/6","09:30"],[3,1,48,"2026/8/6","12:00"],[3,49,80,"2026/8/6","13:00"],[3,81,96,"2026/8/6","14:00"],[3,97,104,"2026/8/6","16:00"]],
  "12歲男":[[1,1,56,"2026/8/3","12:30"],[1,57,112,"2026/8/3","14:30"],[1,113,176,"2026/8/3","16:00"],[1,177,208,"2026/8/4","09:30"],[1,209,224,"2026/8/4","11:30"],[1,225,232,"2026/8/4","13:00"],[1,233,239,"2026/8/4","14:30"],[2,1,28,"2026/8/5","09:30"],[2,29,56,"2026/8/5","11:00"],[2,57,84,"2026/8/5","12:00"],[2,85,112,"2026/8/5","13:00"],[2,113,176,"2026/8/5","14:00"],[2,177,208,"2026/8/5","16:00"],[2,209,224,"2026/8/5","17:00"],[2,225,232,"2026/8/5","18:00"],[3,1,40,"2026/8/6","09:30"],[3,41,72,"2026/8/6","11:30"],[3,73,104,"2026/8/6","15:00"],[3,105,120,"2026/8/6","16:30"],[3,121,128,"2026/8/6","17:30"]],
  "13歲男":[[1,1,8,"2026/8/3","10:30"],[1,9,40,"2026/8/3","11:30"],[1,41,56,"2026/8/3","12:30"],[1,57,64,"2026/8/3","14:30"],[1,65,71,"2026/8/3","16:00"],[1,73,104,"2026/8/4","14:30"],[1,105,120,"2026/8/4","16:00"],[1,121,128,"2026/8/4","17:00"],[1,129,135,"2026/8/5","12:00"]],
  "13歲女":[[1,1,8,"2026/8/4","09:30"],[1,9,40,"2026/8/4","11:30"],[1,41,72,"2026/8/4","13:00"]],
  "15歲男":[[1,1,96,"2026/8/4","08:00"],[1,97,160,"2026/8/4","09:30"],[1,161,192,"2026/8/4","11:30"],[1,193,208,"2026/8/4","13:00"],[1,209,216,"2026/8/4","14:30"],[1,217,223,"2026/8/4","16:00"],[2,1,96,"2026/8/5","08:00"],[2,97,160,"2026/8/5","09:30"],[2,161,192,"2026/8/5","11:00"],[2,193,208,"2026/8/5","12:00"],[2,209,216,"2026/8/5","13:00"],[3,1,96,"2026/8/6","09:30"],[3,97,160,"2026/8/6","13:30"],[3,161,192,"2026/8/6","15:00"],[3,193,208,"2026/8/6","16:30"],[3,209,216,"2026/8/6","17:30"]],
  "15歲女":[[1,1,48,"2026/8/3","10:30"],[1,49,80,"2026/8/3","11:30"],[1,81,96,"2026/8/3","12:30"],[1,97,104,"2026/8/3","14:30"],[1,105,111,"2026/8/3","16:00"],[2,1,48,"2026/8/3","17:30"],[2,49,96,"2026/8/3","19:00"],[2,97,104,"2026/8/3","20:00"],[3,1,48,"2026/8/4","13:00"],[3,49,80,"2026/8/4","14:30"],[3,81,96,"2026/8/4","16:00"],[3,97,104,"2026/8/4","17:00"]]
};
function officialMatchTime(group,match){
  const number=Number(match.match);
  // 目前 players.json 來源皆為各組「第一次賽」籤表；stage 是籤表晉級輪次，不能拿來對應官方的（ㄧ）（二）（三）。
  const row=(OFFICIAL_MATCH_TIMES[group]||[]).find(([attempt,from,to])=>attempt===1&&number>=from&&number<=to);
  return row?{date:row[3],time:row[4]}:null;
}
const RESULT_FOLDERS = {
  9:"https://drive.google.com/drive/folders/1jPIC1QhGzd4oRXoXbW2dHlBhTxIqbO-V",
  10:"https://drive.google.com/drive/folders/1xSwWtoMxxbefUArbznNDkvlzDbtZpigJ",
  11:"https://drive.google.com/drive/folders/11kPw9Pg7eh-tGUnHQP37T3VU5pUAP77j",
  12:"https://drive.google.com/drive/folders/1VVWIYllPmYQaG1B1iZJpcYHYXrnbaZVH",
  13:"https://drive.google.com/drive/folders/1OfkshKyabfKYWMT7K9oE31MvBT8a6ZZY",
  15:"https://drive.google.com/drive/folders/1gkI9L18GzvmsI_jW6gPwbjrGLJ8gMCx4"
};
const resultFolder = p => RESULT_FOLDERS[Number.parseInt(p.group,10)] || "https://drive.google.com/drive/folders/1hkj0eE1H2bOVYd6NrJNvzTuJ7tRfagmM";
const scheduleForGroup = group => GROUP_SCHEDULES.find(schedule=>schedule.groups.includes(group)) || EVENT;
const state = { players: [], mode: "player", lists: loadLists(), favoriteSchools: loadFavoriteSchools(), hideEnded: loadHideEnded(), activeSchool: "", firstMatchIndex: new Map(), user: null, cloudReady: false, applyingCloud: false };
const el = id => document.getElementById(id);
const norm = value => String(value ?? "").normalize("NFKC").replace(/臺/g,"台").replace(/\s+/g,"").toLowerCase();
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
const playerId = p => [p.group,p.school,p.name,p.seed].map(norm).join("|");
const firstMatch = p => (p.matches || [])[0] || {};
const playerVenue = p => p.venue || firstMatch(p).venue || EVENT.venue;
const dateLabel = m => m.date || m.matchDate || m.dateRange || EVENT.dateRange;
const sortKey = m => `${m.date || m.matchDate || m.sortDate || "9999-99-99"} ${m.time || "99:99"}`;
function matchStart(m){
  const date=String(m.date||m.matchDate||"").match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  const time=String(m.time||"").match(/^(\d{1,2}):(\d{2})$/);
  return date&&time?new Date(Number(date[1]),Number(date[2])-1,Number(date[3]),Number(time[1]),Number(time[2])):null;
}
function isUpcomingMatch(m,p,now=new Date()){
  const start=matchStart(m);
  if(start)return start.getTime()>=now.getTime();
  return !p.endDate||new Date(`${p.endDate}T23:59:59`).getTime()>=now.getTime();
}

function loadLists(){
  try {
    const stored=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!Array.isArray(stored))return [];
    return stored.map((list,index)=>({
      name:String(list?.name||`我的名單 ${index+1}`),
      playerIds:Array.isArray(list?.playerIds)?list.playerIds:[],
      names:Array.isArray(list?.names)?list.names:[]
    }));
  } catch { return []; }
}
function loadFavoriteSchools(){
  try { const stored=JSON.parse(localStorage.getItem(SCHOOL_STORAGE_KEY)); return Array.isArray(stored)?stored:[]; }
  catch { return []; }
}
function loadHideEnded(){ try { return localStorage.getItem(HIDE_ENDED_KEY)!=="false"; } catch { return true; } }
function playerHasEnded(p){ return Boolean(p.endDate&&p.endDate<new Date().toLocaleDateString("sv-SE")); }
function saveLists(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lists)); updateListsUI(); queueCloudSave(); }
function saveFavoriteSchools(){ localStorage.setItem(SCHOOL_STORAGE_KEY,JSON.stringify(state.favoriteSchools));updateListsUI();queueCloudSave() }

function firebaseConfigured(){
  const config=window.PINGGO_FIREBASE_CONFIG;
  return config && config.apiKey && !String(config.apiKey).includes("請貼上");
}
function setSyncStatus(message){ const node=el("syncStatus"); if(node)node.textContent=message; }
function mergeLists(localLists=[],cloudLists=[]){
  const merged=new Map();
  [...localLists,...cloudLists].forEach(list=>{
    const name=String(list?.name||"我的名單").trim()||"我的名單";
    const key=norm(name); const current=merged.get(key)||{name,playerIds:[],names:[]};
    (list?.playerIds||[]).forEach((id,index)=>{if(!current.playerIds.includes(id)){current.playerIds.push(id);current.names.push((list.names||[])[index]||"")}});
    merged.set(key,current);
  });
  return [...merged.values()];
}
function cloudDocument(){ return firebase.firestore().collection("users").doc(state.user.uid); }
function queueCloudSave(){
  if(!state.user||!state.cloudReady||state.applyingCloud)return;
  clearTimeout(cloudSaveTimer); setSyncStatus("正在同步…");
  cloudSaveTimer=setTimeout(saveToCloud,450);
}
async function saveToCloud(){
  if(!state.user||!state.cloudReady)return;
  try{
    await cloudDocument().set({version:CLOUD_DOCUMENT_VERSION,lists:state.lists,favoriteSchools:state.favoriteSchools,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    setSyncStatus("已同步至 Google 帳號");
  }catch(error){console.error(error);setSyncStatus("同步失敗，資料仍保存在此裝置");}
}
async function loadAndMergeCloud(){
  setSyncStatus("正在合併收藏…");
  try{
    const snapshot=await cloudDocument().get(); const remote=snapshot.exists?snapshot.data():{};
    state.applyingCloud=true;
    state.lists=mergeLists(state.lists,remote.lists||[]);
    state.favoriteSchools=[...new Set([...state.favoriteSchools,...(remote.favoriteSchools||[])])];
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state.lists));
    localStorage.setItem(SCHOOL_STORAGE_KEY,JSON.stringify(state.favoriteSchools));
    state.applyingCloud=false; updateListsUI(); renderNext();
    await saveToCloud();
  }catch(error){state.applyingCloud=false;console.error(error);setSyncStatus("無法讀取雲端，暫用此裝置資料");}
}
function updateAccountUI(){
  const button=el("authButton"); if(!button)return;
  if(state.user){button.textContent=`${state.user.displayName||state.user.email||"已登入"} · 登出`;button.classList.add("signed-in")}
  else{button.textContent="使用 Google 登入";button.classList.remove("signed-in")}
}
async function handleAuthButton(){
  if(!firebaseConfigured()){setSyncStatus("請先完成 Firebase 設定");return;}
  if(state.user){await firebase.auth().signOut();return;}
  const provider=new firebase.auth.GoogleAuthProvider(); provider.setCustomParameters({prompt:"select_account"});
  try{
    if(window.matchMedia("(max-width: 640px)").matches)await firebase.auth().signInWithRedirect(provider);
    else await firebase.auth().signInWithPopup(provider);
  }catch(error){console.error(error);setSyncStatus(error.code==="auth/unauthorized-domain"?"請在 Firebase 加入此網站網域":"Google 登入未完成，請再試一次");}
}
function initFirebase(){
  el("authButton")?.addEventListener("click",handleAuthButton);
  if(!firebaseConfigured()||typeof firebase==="undefined"){setSyncStatus("收藏目前儲存在這台裝置");return;}
  try{
    firebase.initializeApp(window.PINGGO_FIREBASE_CONFIG); state.cloudReady=true;
    firebase.auth().getRedirectResult().catch(error=>{console.error(error);setSyncStatus("Google 登入未完成，請再試一次")});
    firebase.auth().onAuthStateChanged(async user=>{
      state.user=user;updateAccountUI();
      if(user){await loadAndMergeCloud();state.mode="schedule";setTab("schedule");render()}else setSyncStatus("已登出；新變更只保存在這台裝置");
    });
  }catch(error){console.error(error);setSyncStatus("Firebase 設定有誤，暫用此裝置資料");}
}
function getSavedPlayers(){
  const ids = new Set(state.lists.flatMap(list => list.playerIds || []));
  const schools = new Set(state.favoriteSchools);
  return state.players.filter(p => ids.has(playerId(p)) || schools.has(p.school));
}
function scheduleEntries(players){
  return players.flatMap(p => (p.matches || []).map((m,index) => ({ p,m,index })))
    .sort((a,b) => sortKey(a.m).localeCompare(sortKey(b.m)) || a.p.name.localeCompare(b.p.name,"zh-Hant"));
}

function updateListsUI(){
  el("listCount").textContent = new Set(state.lists.flatMap(x=>x.playerIds || [])).size + state.favoriteSchools.length;
  el("favoriteSchools").innerHTML=state.favoriteSchools.length?`<section class="saved-list"><div class="saved-list-head"><div><strong>★ 收藏的球隊／學校</strong><div class="sub">會自動納入下一位排序</div></div></div><div class="chips">${state.favoriteSchools.map(school=>`<button class="chip school-chip" data-remove-school="${esc(school)}" type="button">${esc(school)} ×</button>`).join("")}</div></section>`:`<p class="sub">尚未收藏學校。請在學校查詢結果按 ☆。</p>`;
  el("favoriteSchools").querySelectorAll("[data-remove-school]").forEach(btn=>btn.addEventListener("click",()=>toggleFavoriteSchool(btn.dataset.removeSchool)));
  const saved = el("savedLists");
  saved.innerHTML = state.lists.length ? state.lists.map((list,i)=>`<section class="saved-list"><div class="saved-list-head"><div><strong>${esc(list.name)}</strong><div class="sub">${list.playerIds.length} 位</div></div><button class="delete-button" data-delete-list="${i}" type="button">刪除</button></div><div class="chips">${list.names.map(n=>`<span class="chip">${esc(n)}</span>`).join("")}</div></section>`).join("") : `<p class="sub">尚未建立名單。把姓名整批貼上就能開始。</p>`;
  saved.querySelectorAll("[data-delete-list]").forEach(btn=>btn.addEventListener("click",()=>{ state.lists.splice(Number(btn.dataset.deleteList),1); saveLists(); renderNext(); }));
}

function renderNext(){
  const now=new Date();
  const entries = getSavedPlayers().map(p=>({p,m:(p.matches||[]).find(m=>isUpcomingMatch(m,p,now))})).filter(entry=>entry.m)
    .sort((a,b)=>sortKey(a.m).localeCompare(sortKey(b.m))||a.p.name.localeCompare(b.p.name,"zh-Hant"));
  el("nextCount").textContent=entries.length?`共 ${entries.length} 位`:"";
  el("nextCards").innerHTML = entries.length ? entries.map((entry,i)=>`<article class="next-card${i<2?" next-card-priority":""}"><div class="next-label">${i===0?"下一位":i===1?"再下一位":`第 ${i+1} 位`}</div><div class="next-when"><span>時間</span><strong>${esc(dateLabel(entry.m))} ${esc(entry.m.time || "時間待定")}</strong></div><button class="next-name next-player-button" data-next-player="${esc(playerId(entry.p))}" type="button">${esc(entry.p.name)}</button><div class="next-school">🏫 ${esc(entry.p.school)}</div><div class="next-meta">${esc(entry.p.group)} · 場次 ${esc(entry.m.match)}</div><div class="next-meta next-venue">📍 ${esc(playerVenue(entry.p))}</div></article>`).join("") : `<div class="empty-card"><button class="empty-list-button" data-open-lists type="button">${getSavedPlayers().length?"管理常用名單":"＋ 先建立常用名單"}</button><p class="sub">${getSavedPlayers().length?"關注名單目前沒有未結束賽程；完整資料仍可從選手查詢查看。":"貼上球隊或親友姓名後，這裡會依日期與時間顯示完整出賽順序。"}</p></div>`;
  el("nextCards").querySelector("[data-open-lists]")?.addEventListener("click",openListsDialog);
  el("nextCards").querySelectorAll("[data-next-player]").forEach(button=>button.addEventListener("click",()=>showPlayer(button.dataset.nextPlayer)));
}

function matchRoute(p){
  const matches=(p.matches||[]).map((m,index)=>({m,index})).filter(entry=>!state.hideEnded||isUpcomingMatch(entry.m,p));
  if(!matches.length)return `<p class="sub">${state.hideEnded?"已結束場次目前已隱藏。關閉上方開關即可查看完整賽程。":"目前沒有可確認的場次資料。"}</p>`;
  return `<div class="route">${matches.map(({m,index})=>`<div class="match-row"><span class="date">📅 ${esc(dateLabel(m))}</span><span><span class="time">${esc(m.time || "時間待定")}</span> <span class="match">場次 ${esc(m.match)} · ${index===0?"首個可能場次":"若晉級"}</span></span></div>`).join("")}</div>`;
}
function opponentBlock(p){
  const first=firstMatch(p); if(!first.match)return `<div class="opponent-box pending"><strong>首場對手</strong><p>目前沒有足夠場次資料可供配對。</p></div>`;
  const candidates=(state.firstMatchIndex.get(`${p.group}|${first.match}`)||[]).filter(x=>playerId(x)!==playerId(p));
  if(candidates.length===1){const rival=candidates[0];return `<div class="opponent-box"><div><span class="opponent-label">首場可能對手</span><button class="player-link" data-player-id="${esc(playerId(rival))}" type="button">${esc(rival.name)}</button><p>${esc(rival.school)} · ${esc(rival.group)} · 籤位 ${esc(rival.seed)}</p></div><span class="versus">VS</span></div>`}
  if(candidates.length>1)return `<div class="opponent-box pending"><strong>首場對手需核對</strong><p>目前同場次出現 ${candidates.length+1} 位選手，可能是原始籤表解析異常，請以官方籤表為準。</p></div>`;
  return `<div class="opponent-box pending"><strong>首場對手尚未確定</strong><p>可能為輪空，或需等待前一場勝者產生；請以大會最新公告為準。</p></div>`;
}
function isSaved(p){ return state.lists.some(list=>(list.playerIds || []).includes(playerId(p))); }
function isFavoriteSchool(school){return state.favoriteSchools.includes(school)}
function toggleFavoriteSchool(school){const index=state.favoriteSchools.indexOf(school);if(index>=0)state.favoriteSchools.splice(index,1);else state.favoriteSchools.push(school);saveFavoriteSchools();renderNext();render()}
function playerCard(p,back=false){
  const ended=p.endDate&&p.endDate<new Date().toLocaleDateString("sv-SE");
  return `<article class="card"><div class="card-top"><div><button class="player-link" data-player-id="${esc(playerId(p))}" type="button">${esc(p.name)}</button><div class="sub">${esc(p.school)} · 籤位 ${esc(p.seed)} · 籤表第 ${esc(p.page)} 頁</div><div class="player-venue">📅 ${esc(p.dateRange)} · 📍 ${esc(playerVenue(p))}</div>${ended?`<div class="ended-badge">此組賽事已結束</div>`:""}</div><div><span class="badge">${esc(p.group)}</span> <button class="star-button" data-quick-save="${esc(playerId(p))}" type="button" aria-label="加入我的最愛">${isSaved(p)?"★":"☆"}</button></div></div><a class="result-button" href="${esc(resultFolder(p))}" target="_blank" rel="noopener noreferrer">✓ 查看 ${esc(p.group)}官方成績</a>${opponentBlock(p)}${matchRoute(p)}${back?`<button class="text-button" data-back-school type="button">← 回到 ${esc(state.activeSchool)}</button>`:""}</article>`;
}

function wireResults(){
  el("results").querySelectorAll("[data-player-id]").forEach(btn=>btn.addEventListener("click",()=>showPlayer(btn.dataset.playerId,true)));
  el("results").querySelectorAll("[data-quick-save]").forEach(btn=>btn.addEventListener("click",()=>quickSave(btn.dataset.quickSave)));
  const back=el("results").querySelector("[data-back-school]"); if(back) back.addEventListener("click",()=>{ state.mode="school"; setTab("school"); el("query").value=state.activeSchool; render(); });
}
function showPlayer(id,back=false){
  const p=state.players.find(x=>playerId(x)===id); if(!p)return;
  state.mode="player"; setTab("player"); el("query").value=p.name; el("status").textContent=`${p.name}的全部可能場次`;
  el("results").innerHTML=playerCard(p,back); wireResults(); el("results").scrollIntoView({behavior:"smooth",block:"start"});
}
function quickSave(id){
  let list=state.lists.find(x=>x.name==="我的最愛"); if(!list){list={name:"我的最愛",playerIds:[],names:[]};state.lists.unshift(list)}
  const p=state.players.find(x=>playerId(x)===id); const pos=list.playerIds.indexOf(id);
  if(pos>=0){list.playerIds.splice(pos,1); list.names.splice(pos,1)} else {list.playerIds.push(id);list.names.push(p.name)}
  saveLists(); renderNext(); render();
}

function renderPlayers(){
  if(!state.players.length){el("status").textContent="資料仍在載入，請稍候…";el("results").innerHTML="";return}
  const q=norm(el("query").value), group=el("group").value;
  const found=state.players.filter(p=>(!state.hideEnded||!playerHasEnded(p))&&(group==="all"||p.group===group)&&q&&norm(`${p.name}|${p.school}|${p.seed}`).includes(q)).slice(0,80);
  el("status").textContent=q?`找到 ${found.length} 位選手${found.length===80?"（僅顯示前 80 位）":""}`:"輸入姓名開始查詢";
  el("results").innerHTML=found.map(p=>playerCard(p)).join(""); wireResults();
}
function renderSchools(){
  const raw=el("query").value, terms=[...new Set(raw.split(/[\n,，、;；]+/).map(norm).filter(Boolean))], group=el("group").value, schools=new Map();
  if(terms.length) state.players.forEach(p=>{if((!state.hideEnded||!playerHasEnded(p))&&(group==="all"||p.group===group)&&terms.some(q=>norm(p.school).includes(q))){if(!schools.has(p.school))schools.set(p.school,[]);schools.get(p.school).push(p)}});
  const entries=[...schools.entries()].slice(0,40); el("status").textContent=terms.length?`找到 ${entries.length} 所學校${terms.length>1?"（跨校查詢）":""}`:`輸入一所或多所學校開始查詢`;
  el("results").innerHTML=entries.map(([school,ps])=>{const sorted=[...ps].sort((a,b)=>sortKey(firstMatch(a)).localeCompare(sortKey(firstMatch(b)))||a.name.localeCompare(b.name,"zh-Hant"));return `<article class="card"><div class="card-top"><div><strong>${esc(school)}</strong><div class="sub">共 ${ps.length} 位 · 各年齡組依正確賽期排序</div></div><div class="school-actions"><span class="badge">球隊模式</span><button class="star-button" data-school-save="${esc(school)}" type="button" aria-label="收藏${esc(school)}">${isFavoriteSchool(school)?"★ 已收藏":"☆ 收藏學校"}</button></div></div>${sorted.map(p=>`<div class="school-player"><button class="player-link" data-player-id="${esc(playerId(p))}" data-school="${esc(school)}" type="button">${esc(p.name)}</button><span class="sub">${esc(dateLabel(firstMatch(p)))} ${esc(firstMatch(p).time||"時間待定")} · ${esc(playerVenue(p))}</span><button class="star-button" data-quick-save="${esc(playerId(p))}" type="button">${isSaved(p)?"★":"☆"}</button></div>`).join("")}</article>`}).join("");
  el("results").querySelectorAll("[data-school]").forEach(btn=>btn.addEventListener("click",()=>{state.activeSchool=btn.dataset.school})); wireResults();
  el("results").querySelectorAll("[data-school-save]").forEach(btn=>btn.addEventListener("click",()=>toggleFavoriteSchool(btn.dataset.schoolSave)));
}
function render(){
  if(state.mode==="schedule"){renderNext();return}
  const q=norm(el("query").value);
  if(state.mode==="school"&&q&&state.players.some(p=>norm(p.name)===q)){state.mode="player";setTab("player")}
  state.mode==="player"?renderPlayers():renderSchools();
}
function setTab(mode){
  document.querySelectorAll(".tab").forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle("active",active);b.setAttribute("aria-selected",String(active))});
  el("schedulePanel").hidden=mode!=="schedule";el("queryPanel").hidden=mode==="schedule";
  if(mode!=="schedule")el("query").placeholder=mode==="player"?"輸入選手姓名":"輸入一所或多所學校，以逗號分隔";
}

function createList(){
  const name=el("listName").value.trim()||"我的名單";
  const names=[...new Set(el("batchNames").value.split(/[\n,，、;；\t]+/).map(x=>x.trim()).filter(Boolean))];
  const matches=[],missing=[]; names.forEach(n=>{const found=state.players.filter(p=>norm(p.name)===norm(n));found.length?matches.push(...found):missing.push(n)});
  const unique=[...new Map(matches.map(p=>[playerId(p),p])).values()];
  if(!unique.length){el("batchFeedback").textContent="沒有找到可加入的姓名，請確認文字與官方資料一致。";return}
  state.lists.push({name,playerIds:unique.map(playerId),names:unique.map(p=>p.name)}); saveLists(); renderNext();
  el("batchFeedback").textContent=`已建立「${name}」，加入 ${unique.length} 位${missing.length?`；找不到：${missing.join("、")}`:""}。`;
  el("listName").value="";el("batchNames").value="";
  state.mode="schedule";setTab("schedule");render();el("listsDialog").close();
}

document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{state.mode=btn.dataset.mode;setTab(state.mode);el("query").value="";render()}));
el("query").addEventListener("input",render); el("group").addEventListener("change",render);
el("hideEnded").checked=state.hideEnded; el("hideEnded").addEventListener("change",event=>{state.hideEnded=event.target.checked;try{localStorage.setItem(HIDE_ENDED_KEY,String(state.hideEnded))}catch{}render()});
el("searchButton").addEventListener("click",render); el("query").addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();render()}});
const utilityRail=document.querySelector(".utility-rail"), mobileMenuToggle=el("mobileMenuToggle");
function closeMobileMenu(){utilityRail.classList.remove("open");mobileMenuToggle.setAttribute("aria-expanded","false");mobileMenuToggle.setAttribute("aria-label","展開功能選單")}
function openListsDialog(){closeMobileMenu();const dialog=el("listsDialog");if(!dialog.open)dialog.showModal();el("batchNames").focus()}
mobileMenuToggle.addEventListener("click",()=>{const open=utilityRail.classList.toggle("open");mobileMenuToggle.setAttribute("aria-expanded",String(open));mobileMenuToggle.setAttribute("aria-label",open?"收合功能選單":"展開功能選單")});
el("sideManageLists").addEventListener("click",openListsDialog); document.querySelector(".utility-tools a").addEventListener("click",closeMobileMenu); el("createList").addEventListener("click",createList);
initFirebase();

const DATA_URL = location.protocol === "file:"
  ? "https://raw.githubusercontent.com/felin0630/PingGo/main/players.json"
  : "./players.json";
const loadController = new AbortController();
const loadTimeout = setTimeout(()=>loadController.abort(),15000);
el("status").textContent = location.protocol === "file:" ? "正在連線讀取公開賽程資料…" : "正在載入賽程資料…";
fetch(DATA_URL,{cache:"no-store",signal:loadController.signal}).then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}).then(data=>{
  clearTimeout(loadTimeout);
  state.players=Array.isArray(data)?data:(data.players||[]);
  state.players.forEach(p=>{const schedule=scheduleForGroup(p.group);Object.assign(p,schedule);(p.matches||[]).forEach(m=>{const exact=officialMatchTime(p.group,m);m.date=exact?.date||"";m.time=exact?.time||"";m.dateRange=schedule.dateRange;m.sortDate=exact?.date?.replaceAll("/","-")||schedule.startDate;m.venue=schedule.venue})});
  state.firstMatchIndex=new Map(); state.players.forEach(p=>{const match=firstMatch(p).match;if(!match)return;const key=`${p.group}|${match}`;if(!state.firstMatchIndex.has(key))state.firstMatchIndex.set(key,[]);state.firstMatchIndex.get(key).push(p)});
  [...new Set(state.players.map(p=>p.group).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"zh-Hant")).forEach(group=>el("group").insertAdjacentHTML("beforeend",`<option value="${esc(group)}">${esc(group)}</option>`));
  updateListsUI();renderNext();render();
}).catch(error=>{clearTimeout(loadTimeout);console.error(error);el("status").textContent=location.protocol === "file:" ? "無法連上公開資料。請確認網路連線，或將整個資料夾部署到 GitHub Pages 後再開啟。" : "資料載入失敗，請確認 players.json 已與 index.html 放在同一層後重新整理。"});
