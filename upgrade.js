/* CodexStudys upgrade module: Bohr model, valence/noble-gas info, mistake notebook,
   daily goal + streak, memory challenge, PWA status/update. Loaded after the inline script. */
(()=>{"use strict";
const $=id=>document.getElementById(id),GOAL=10;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const J={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}}};
const today=d=>{d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const nextDay=k=>{const[y,m,d]=k.split("-").map(Number);return today(new Date(y,m-1,d+1))};
const shuf=a=>[...a].sort(()=>Math.random()-.5);

/* ---------- progress + streak ---------- */
function loadP(){const p=J.get("codex-pt-daily",null);return p&&typeof p==="object"&&p.days&&typeof p.days==="object"?p:{v:1,days:{},topics:{}}}
function addP(ok,topic){const p=loadP(),t=today(),d=p.days[t]=p.days[t]||{n:0,c:0};d.n++;if(ok)d.c++;p.topics=p.topics||{};const x=p.topics[topic]=p.topics[topic]||[0,0];x[1]++;if(ok)x[0]++;J.set("codex-pt-daily",p)}
function streaks(days,now){const done=Object.keys(days).filter(k=>days[k]&&days[k].n>=GOAL).sort();let longest=0,run=0,prev=null;
 for(const k of done){run=prev&&nextDay(prev)===k?run+1:1;longest=Math.max(longest,run);prev=k}
 const set=new Set(done);let cur=0;const d=new Date(now);if(!set.has(today(d)))d.setDate(d.getDate()-1);
 while(set.has(today(d))){cur++;d.setDate(d.getDate()-1)}return{cur,longest}}

/* ---------- element panel extras + simplified Bohr model ---------- */
const LB="KLMNOPQ";let braf=0,play=true,spd=1,ang=[];
const reduced=()=>document.documentElement.dataset.reducedMotion==="true"||matchMedia("(prefers-reduced-motion: reduce)").matches;
function valence(z){if(z===2)return"2";const g=grp(z);return g===1||g===2?String(g):g>=13?String(g-10):"Varies (d/f-block)"}
function extra(e){const sh=shells(e.z),n=sh.length,col=getComputedStyle(document.documentElement).getPropertyValue("--vio")||"#8f7bff";ang=sh.map(()=>0);
 let s=`<svg id="bsv" viewBox="0 0 240 240" role="img" aria-label="Bohr model of ${esc(e.n)}: ${sh.join(", ")} electrons per shell"><circle cx="120" cy="120" r="17" fill="var(--gold)"/><text x="120" y="125" text-anchor="middle" font-size="13" font-weight="800" fill="#000">${esc(e.s)}</text>`;
 sh.forEach((c,i)=>{const r=n===1?48:30+i*(82/(n-1));s+=`<circle cx="120" cy="120" r="${r}" fill="none" stroke="var(--mu)" stroke-opacity=".45"/><text x="120" y="${120-r-2}" text-anchor="middle" font-size="8" fill="var(--mu)">${LB[i]}</text><g class="bg">`;
  for(let k=0;k<c;k++){const a=k/c*6.2832;s+=`<circle cx="${(120+r*Math.sin(a)).toFixed(1)}" cy="${(120-r*Math.cos(a)).toFixed(1)}" r="3.4" fill="var(--vio)"/>`}s+="</g>"});s+="</svg>";
 const lab=sh.map((c,i)=>LB[i]+" "+c).join(" · ");
 $("info").insertAdjacentHTML("beforeend",`<div class="sec g" id="bohr"><h3>Bohr model (simplified)</h3>${s}<div class="act" style="padding:4px 0"><button id="bpl" class="on" aria-pressed="true">⏸ Pause</button><button id="brs">↺ Reset</button></div><label class="note">Speed <input id="bsp" type="range" min="0.25" max="3" step="0.25" value="1" style="accent-color:var(--vio);width:60%"></label><div class="note">${lab}. Simplified Bohr picture, not literal quantum orbitals.</div></div>
 <div class="sec g"><h3>Electron details</h3><div class="kv"><span>Noble-gas config</span><span>${cfgC(e.z,1)}</span></div><div class="kv"><span>Shell-wise</span><span>${lab}</span></div><div class="kv"><span>Valence electrons</span><span>${valence(e.z)}</span></div></div>`);
 play=!reduced();spd=1;paint();const b=$("bpl");
 b.onclick=()=>{play=!play;paint()};$("brs").onclick=()=>{ang=ang.map(()=>0);spd=1;$("bsp").value=1;play=!reduced();paint();draw()};$("bsp").oninput=ev=>{spd=+ev.target.value};
 cancelAnimationFrame(braf);let last=performance.now();
 const tick=t=>{if(!document.body.classList.contains("open")||!$("bsv")){braf=0;return}braf=requestAnimationFrame(tick);const dt=Math.min((t-last)/1000,.1);last=t;if(play){ang=ang.map((a,i)=>(a+dt*spd*40/(i+1))%360);draw()}};braf=requestAnimationFrame(tick)}
function paint(){const b=$("bpl");if(!b)return;b.textContent=play?"⏸ Pause":"▶ Play";b.setAttribute("aria-pressed",play);b.classList.toggle("on",play)}
function draw(){document.querySelectorAll("#bsv .bg").forEach((g,i)=>g.setAttribute("transform","rotate("+(ang[i]||0)+" 120 120)"))}
const _open=window.open;window.open=function(e){_open.call(this,e);try{extra(e)}catch(x){console.error("Bohr/extra failed",x)}};

/* ---------- mistake notebook ---------- */
const MK="codex-pt-mistakes";
const loadM=()=>{const a=J.get(MK,[]);return Array.isArray(a)?a.filter(x=>x&&typeof x.q==="string"&&Array.isArray(x.o)&&Number.isInteger(x.a)):[]};
const _qa=window.qAns;
window.qAns=function(){const n=QZ.log.length;_qa.apply(this,arguments);if(QZ.log.length>n){const r=QZ.log[QZ.log.length-1];addP(r.ok,r.t);
 if(!r.ok){const M=loadM(),i=M.findIndex(m=>m.q===r.q),o={q:r.q,o:r.o,a:r.a,e:r.e,t:r.t,date:today(),right:i>=0?M[i].right:0,mastered:false};if(i>=0)M[i]=o;else M.push(o);if(!J.set(MK,M))toast("⚠ Storage unavailable: mistake not saved")}}};
function toast(m){const t=$("toast");if(!t)return;t.textContent=m;t.classList.add("on");setTimeout(()=>t.classList.remove("on"),2500)}
let R=null,RF="";
function rView(){const el=$("vrb"),p=loadP(),st=streaks(p.days,new Date()),td=p.days[today()]||{n:0,c:0},tot=Object.values(p.days).reduce((a,d)=>[a[0]+d.n,a[1]+d.c],[0,0]),M=loadM();
 let h=`<div class="hero g"><h2>📅 Daily goal &amp; Review</h2><p>Answer ${GOAL} questions a day (quiz or memory game) to keep your streak. Days are counted in your local time.</p></div>`;
 const tp=Object.entries(p.topics||{}),weak=tp.filter(([,v])=>v[1]>=3).sort((a,b)=>a[1][0]/a[1][1]-b[1][0]/b[1][1])[0];
 h+=`<div class="blk g"><div class="facts"><div class="fc"><b>🔥 ${st.cur}</b><span>Current streak</span></div><div class="fc"><b>${st.longest}</b><span>Longest streak</span></div><div class="fc"><b>${Math.min(td.n,GOAL)}/${GOAL}</b><span>${td.n>=GOAL?"Today's goal done ✅":"Today's goal"}</span></div><div class="fc"><b>${tot[0]?Math.round(tot[1]/tot[0]*100):0}%</b><span>${tot[1]}/${tot[0]} correct</span></div></div>`;
 h+=tp.length?`<div class="sub">Topic-wise</div>${tp.map(([k,v])=>`<div class="tr"><span>${esc(k)}</span><span>${v[0]}/${v[1]}</span></div>`).join("")}`:`<div class="note">No activity yet. Take a quiz or play the memory game.</div>`;
 const days=Object.keys(p.days).sort().reverse().slice(0,7);
 if(days.length)h+=`<div class="sub">Recent days</div>${days.map(k=>`<div class="tr"><span>${k}</span><span>${p.days[k].c}/${p.days[k].n}${p.days[k].n>=GOAL?" ✅":""}</span></div>`).join("")}`;
 if(weak)h+=`<div class="sent">💡 Revise <b>${esc(weak[0])}</b> next (${weak[1][0]}/${weak[1][1]} correct).</div>`;
 h+=`<div class="act" style="padding:10px 0 0"><button data-rp="1">🗑 Reset progress</button></div></div>`;
 const open=M.filter(m=>!m.mastered),tc={};M.forEach(m=>tc[m.t]=(tc[m.t]||0)+1);
 h+=`<div class="blk g"><div class="pill" style="background:linear-gradient(135deg,#7c5cff,#a58bff)">📓 Mistake notebook · ${M.length}</div>`;
 if(R){const m=M.find(x=>x.q===R.ids[R.i]);if(!m){R=null;return rView()}
  h+=`<div class="note">Question ${R.i+1} of ${R.ids.length}</div><div class="qq">${esc(m.q)}</div><div class="opts2">${m.o.map((o,j)=>`<button class="opt2" data-ro="${j}"><b>${"ABCD"[j]}</b>${esc(o)}</button>`).join("")}</div><div id="rfb"></div><div class="act" style="padding:10px 0 0"><button data-rx="1">✕ Exit practice</button></div></div>`;el.innerHTML=h;return}
 if(!M.length)h+=`<div class="note">Nothing here yet. Wrong quiz answers are saved automatically.</div>`;
 else{h+=`<div class="qrow"><button class="chip${RF?"":" on"}" data-rf="">All</button>${Object.keys(tc).map(t=>`<button class="chip${RF===t?" on":""}" data-rf="${esc(t)}">${esc(t)} (${tc[t]})</button>`).join("")}</div>
  <div class="act" style="padding:0 0 8px"><button class="on" data-rall="1">▶ Practice ${RF?esc(RF):"all"} (${open.filter(m=>!RF||m.t===RF).length})</button><button data-rclr="1">Clear notebook</button></div>`;
  h+=M.filter(m=>!RF||m.t===RF).map(m=>`<div class="rv"><div class="qq">${esc(m.q)}</div><div class="note">${esc(m.t)} · ${m.date} · correct in revision: ${m.right||0}${m.mastered?" · ✅ mastered":""}</div><div class="act" style="padding:6px 0 0"><button data-rone="${esc(m.q)}">Retry</button><button data-rm="${esc(m.q)}">${m.mastered?"Unmaster":"Mastered"}</button><button data-rd="${esc(m.q)}">Remove</button></div></div>`).join("")}
 el.innerHTML=h+"</div>"}
function rClick(ev){const b=ev.target.closest("button");if(!b)return;const d=b.dataset;let M=loadM();
 if("rp"in d){if(confirm("Reset all daily progress, streaks and history?")){J.set("codex-pt-daily",{v:1,days:{},topics:{}});}return rView()}
 if("rf"in d){RF=d.rf;return rView()}
 if("rall"in d){const ids=M.filter(m=>!m.mastered&&(!RF||m.t===RF)).map(m=>m.q);if(!ids.length)return toast("No unmastered questions");R={ids:shuf(ids),i:0};return rView()}
 if("rone"in d){R={ids:[d.rone],i:0};return rView()}
 if("rx"in d){R=null;return rView()}
 if("rclr"in d){if(confirm("Delete all saved mistakes?"))J.set(MK,[]);return rView()}
 if("rd"in d){if(confirm("Remove this question?"))J.set(MK,M.filter(m=>m.q!==d.rd));return rView()}
 if("rm"in d){M=M.map(m=>m.q===d.rm?Object.assign(m,{mastered:!m.mastered}):m);J.set(MK,M);return rView()}
 if("ro"in d&&R){const m=M.find(x=>x.q===R.ids[R.i]);if(!m)return;const j=+d.ro,ok=j===m.a;b.parentNode.querySelectorAll(".opt2").forEach((x,k)=>{x.disabled=true;x.classList.toggle("ok",k===m.a);if(k===j&&!ok)x.classList.add("no")});
  if(ok)m.right=(m.right||0)+1;J.set(MK,M);addP(ok,m.t);const last=R.i>=R.ids.length-1;
  $("rfb").innerHTML=`<div class="ex ${ok?"g":"r"}"><b>${ok?"✅ Correct":"❌ Wrong"}</b> Answer: <b>${esc(m.o[m.a])}</b><br>💡 ${esc(m.e)}<br><small>Concept: ${esc(m.t)}</small></div><div class="act" style="padding:10px 0 0">${last?`<button data-rx="1" class="on">Finish</button>`:`<button data-rn="1" class="on">Next →</button>`}</div>`;return}
 if("rn"in d&&R){R.i++;return rView()}}

/* ---------- memory challenge ---------- */
const G={mode:"s2n",diff:1,rounds:10,timed:false,tid:null,q:null,s:0,n:0,st:0,bst:0,list:[]};
const MM=[["s2n","Symbol → Name"],["n2s","Name → Symbol"],["z2n","Number → Name"]],MD=[[1,"Easy (1–20)"],[2,"Medium (1–54)"],[3,"Hard (1–118)"]],MR=[5,10,20];
const poolOf=()=>E.filter(e=>e.z<=(G.diff===1?20:G.diff===2?54:118));
function gSetup(){clearInterval(G.tid);G.q=null;const ctl=`<div class="qrow">${MM.map(([k,n])=>`<button class="chip${G.mode===k?" on":""}" data-gm="${k}">${n}</button>`).join("")}</div><div class="qrow">${MD.map(([k,n])=>`<button class="chip${G.diff===k?" on":""}" data-gd="${k}">${n}</button>`).join("")}</div><div class="qrow">${MR.map(k=>`<button class="chip${G.rounds===k?" on":""}" data-gr="${k}">${k} rounds</button>`).join("")}<button class="chip${G.timed?" on":""}" data-gt="1">⏱ Timed 10s</button></div>`;
 const b=J.get("codex-pt-mem-best",{});$("vmb").innerHTML=`<div class="hero g"><h2>🎮 Memory Challenge</h2><p>Pick a mode, difficulty and rounds. Answers are checked against the element table.</p></div><div class="blk g">${ctl}<div class="act" style="padding:10px 0 0"><button class="on" data-gs="1">▶ Start</button></div><div class="note">${b.date===today()?"Today's best: "+b.score+"%":"No score yet today."}</div></div>`}
function gStart(){const p=poolOf();G.list=shuf(p).slice(0,G.rounds);G.n=G.s=G.st=G.bst=0;gNext()}
function gNext(){clearInterval(G.tid);if(G.n>=G.list.length)return gEnd();const e=G.list[G.n],p=poolOf(),o=shuf([e,...shuf(p.filter(x=>x.z!==e.z)).slice(0,3)]);G.q={e,o,done:false};
 const m=G.mode,t=m==="s2n"?`Which element has the symbol <b>${esc(e.s)}</b>?`:m==="n2s"?`What is the symbol of <b>${esc(e.n)}</b>?`:`Which element has atomic number <b>${e.z}</b>?`;
 $("vmb").innerHTML=`<div class="blk g"><div class="sc"><span>Round ${G.n+1}/${G.list.length}</span><span>Score ${G.s}</span><span>🔥 ${G.st}</span><span id="gtm"></span></div><div class="qq">${t}</div><div class="opts2">${o.map((x,i)=>`<button class="opt2" data-go="${x.z}"><b>${"ABCD"[i]}</b>${esc(m==="n2s"?x.s:x.n)}</button>`).join("")}</div><div id="gfb"></div></div>`;
 if(G.timed){let t=10;const el=$("gtm");el.textContent="⏱ "+t;G.tid=setInterval(()=>{t--;if(el.isConnected)el.textContent="⏱ "+t;if(t<=0||!el.isConnected){clearInterval(G.tid);if(el.isConnected)gAns(-1)}},1000)}}
function gAns(z){const q=G.q;if(!q||q.done)return;q.done=true;clearInterval(G.tid);const ok=z===q.e.z;G.n++;if(ok){G.s++;G.st++;G.bst=Math.max(G.bst,G.st)}else G.st=0;addP(ok,"Memory");
 document.querySelectorAll("#vmb .opt2").forEach(b=>{b.disabled=true;const v=+b.dataset.go;b.classList.toggle("ok",v===q.e.z);if(v===z&&!ok)b.classList.add("no")});
 $("gfb").innerHTML=`<div class="ex ${ok?"g":"r"}"><b>${ok?"✅ Correct":z<0?"⏰ Time up":"❌ Wrong"}</b> ${esc(q.e.n)} (${esc(q.e.s)}), Z = ${q.e.z}, Group ${grp(q.e.z)}, Period ${per(q.e.z)}</div><div class="act" style="padding:10px 0 0"><button class="on" data-gn="1">${G.n>=G.list.length?"See result":"Next →"}</button></div>`}
function gEnd(){const pc=Math.round(G.s/G.list.length*100),b=J.get("codex-pt-mem-best",{}),nb=b.date!==today()||pc>b.score;if(nb)J.set("codex-pt-mem-best",{date:today(),score:pc});
 $("vmb").innerHTML=`<div class="blk g qres"><div class="big2">${G.s}<small> / ${G.list.length}</small></div><div class="qs">${pc}% accuracy · best streak ${G.bst}${nb?" · 🎉 New best today":""}</div><div class="act"><button class="on" data-gs="1">🔁 Replay</button><button data-gx="1">⚙ Settings</button></div></div>`}
function gClick(ev){const b=ev.target.closest("button");if(!b)return;const d=b.dataset;
 if(d.gm){G.mode=d.gm;return gSetup()}if(d.gd){G.diff=+d.gd;return gSetup()}if(d.gr){G.rounds=+d.gr;return gSetup()}if("gt"in d){G.timed=!G.timed;return gSetup()}
 if("gs"in d)return gStart();if("gx"in d)return gSetup();if("gn"in d)return gNext();if("go"in d)gAns(+d.go)}

/* ---------- tabs ---------- */
function init(){const nav=document.querySelector(".tabs");if(!nav||!$("vq"))return;
 nav.insertAdjacentHTML("beforeend",`<button class="tab" data-v="vr">📓 Review</button><button class="tab" data-v="vm">🎮 Memory</button>`);
 $("vq").insertAdjacentHTML("afterend",`<section id="vr" class="view"><div class="pad" id="vrb"></div></section><section id="vm" class="view"><div class="pad" id="vmb"></div></section>`);
 $("vrb").onclick=rClick;$("vmb").onclick=gClick;
 nav.querySelectorAll(".tab").forEach(t=>{if(t.dataset.v!=="vr"&&t.dataset.v!=="vm")return;t.onclick=()=>{clearInterval(G.tid);document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===t));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id===t.dataset.v));if(t.dataset.v==="vr"){R=null;rView()}else gSetup();scrollTo(0,0)}});
 /* leaving the memory tab via other tabs must stop its timer */
 nav.addEventListener("click",ev=>{const t=ev.target.closest(".tab");if(t&&t.dataset.v!=="vm")clearInterval(G.tid)});
 const st=document.createElement("style");st.textContent=`#bsv{width:100%;max-width:300px;display:block;margin:0 auto}.tabs{overflow-x:auto}#cxnet{position:fixed;left:12px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:70;padding:7px 14px;border-radius:99px;background:#d63b4a;color:#fff;font-weight:700;font-size:.78rem;display:none}#cxnet.on{display:block}#cxup{position:fixed;left:50%;transform:translateX(-50%);bottom:70px;z-index:70;padding:10px 16px;border-radius:14px;background:var(--bg);border:1px solid var(--vio);display:none;gap:10px;align-items:center;font-size:.85rem}#cxup.on{display:flex}.opt2:focus-visible,.chip:focus-visible,.tab:focus-visible,.act button:focus-visible{outline:3px solid var(--gold);outline-offset:2px}`;document.head.append(st);
 /* offline indicator + update banner */
 document.body.insertAdjacentHTML("beforeend",`<div id="cxnet" role="status" aria-live="polite">📴 Offline: saved content only</div><div id="cxup" role="alert"><span>New version ready.</span><button class="nx" style="margin:0;padding:8px 16px" id="cxrl">Reload</button></div>`);
 const net=()=>$("cxnet").classList.toggle("on",!navigator.onLine);net();addEventListener("online",net);addEventListener("offline",net);$("cxrl").onclick=()=>location.reload();
 if("serviceWorker"in navigator){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.register("service-worker.js").catch(e=>console.warn("SW registration failed",e));navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had)$("cxup").classList.add("on")})}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.__cxTest={streaks,today,nextDay,valence,GOAL};
})();
