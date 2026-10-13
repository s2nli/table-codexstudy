/* CodexStudys Exam Master: syllabus, notes, exception drills, practice, mocks, flashcards, spaced revision, local progress. */
(()=>{"use strict";
const D=window.EXD;if(!D)return;
const KEY="codex-exam-v1",BAK="codex-exam-v1-corrupt-backup",PKEY="codex-ncert-pyq-v1";
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const br=s=>esc(s).replace(/\n/g,"<br>");
const day=()=>Math.floor(Date.now()/864e5);
const INTERVALS=[0,1,2,4,7,15,30];
const L="ABCD";
const MODES={
 "NEET":{fmt:"180 MCQs, 3 h, +4/−1 (Chemistry has 45 questions). Source: secondary guides; confirm on the NTA brochure.",sec:60,types:["mcq","ar","stmt","match","order"]},
 "JEE Main":{fmt:"MCQs and numerical (integer) questions, +4/−1 for MCQ. Confirm numerical-section rules on the current NTA bulletin.",sec:144,types:["mcq","ar","stmt","match","order","int"]},
 "JEE Advanced":{fmt:"Format and marking change every year (single, multiple-correct with partial marking, integer). The marking used here is illustrative; read the current JEE Advanced information brochure.",sec:180,types:["mcq","ar","stmt","match","order","multi","int"]}
};
/* ---------- storage with validation and recovery ---------- */
const blank=()=>({v:1,mode:"NEET",done:{},ncert:{},bm:[],q:{},fc:{},mocks:[]});
let notice="";
function load(){let raw=null;try{raw=localStorage.getItem(KEY)}catch(_){return blank()}
 if(!raw)return blank();
 try{const o=JSON.parse(raw);if(!o||typeof o!=="object"||Array.isArray(o)||o.v!==1)throw 0;
  const b=blank();
  b.mode=MODES[o.mode]?o.mode:"NEET";
  ["done","ncert","q","fc"].forEach(k=>{b[k]=o[k]&&typeof o[k]==="object"&&!Array.isArray(o[k])?o[k]:{}});
  b.bm=Array.isArray(o.bm)?o.bm.filter(x=>typeof x==="string"):[];
  b.mocks=Array.isArray(o.mocks)?o.mocks.filter(m=>m&&typeof m.s==="number").slice(-20):[];
  return b}
 catch(_){try{localStorage.setItem(BAK,raw)}catch(__){}notice="Saved progress could not be read. A copy was kept for recovery and progress was reset.";return blank()}}
let S=load();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));return true}catch(_){notice="Browser storage is full or blocked: progress will not persist.";return false}};
/* ---------- question pool: authored + generated from element data ---------- */
const sup=n=>String(n).replace(/\d/g,d=>"⁰¹²³⁴⁵⁶⁷⁸⁹"[d]);
const hasEl=()=>typeof E!=="undefined"&&typeof cfg==="function"&&typeof pos==="function";
const cfgTxt=z=>{const o=cfg(z);return ORD.filter(k=>o[k]).map(k=>k+sup(o[k])).join(" ")};
const unpaired=z=>{const o=cfg(z);let u=0;for(const k in o){const c=CAP[k[1]],n=o[k];u+=n<=c/2?n:c-n}return u};
const opts4=(right,fmt,pool)=>{const s=new Set([right]);for(const p of pool){if(s.size>=4)break;s.add(p)}let i=1;while(s.size<4){s.add(right+i);i++}const a=[...s].slice(0,4);a.sort((x,y)=>x-y);return{o:a.map(fmt),ans:a.indexOf(right)}};
function genQs(){if(!hasEl())return[];const out=[];
 const zs=[];for(let z=3;z<=54;z++)if(![10,18,36,54].includes(z))zs.push(z);
 zs.forEach(z=>{const el=E[z-1],g=grp(z),p=per(z),b=blk(z);if(g==="—")return;
  const gp=opts4(g,x=>"Group "+x+", Period "+p,[g+1,g-1,g+2,g-2].filter(x=>x>=1&&x<=18));
  out.push(["g-pos-"+z,"config","mcq",[D.EXAMS[0],D.EXAMS[1]],2,"An atom has the ground-state configuration "+cfgTxt(z)+". Its group and period are",gp.o,gp.ans,"Highest shell n = "+p+" gives the period. Block "+b+"-block. Group "+g+" (this is "+el.n+", Z = "+z+").","gen"]);
  const u=unpaired(z),up=opts4(u,String,[u+1,u-1,u+2,u-2,0,1].filter(x=>x>=0&&x<=7));
  out.push(["g-unp-"+z,"aufbau","int",[D.EXAMS[1],D.EXAMS[2]],2,"Number of unpaired electrons in a ground-state "+el.n+" atom (Z = "+z+") is",null,u,"Ground state "+cfgTxt(z)+". Fill degenerate orbitals singly (Hund's rule) and count unpaired electrons = "+u+".","gen"]);
 });
 return out}
let POOL=null;
function pool(){if(POOL)return POOL;POOL=D.Q.map(q=>q.concat(["orig"])).concat(genQs());POOL.forEach(q=>{q[3]=[].concat(q[3]);if(q[3].some(x=>x===undefined))q[3]=D.EXAMS.slice()});
 const seen=new Set();POOL=POOL.filter(q=>{if(seen.has(q[0]))return false;seen.add(q[0]);return true});return POOL}
const byId=id=>pool().find(q=>q[0]===id);
const SRC=q=>q[9]==="gen"?"GENERATED from element data":"ORIGINAL PRACTICE";
/* ---------- scoring ---------- */
function isRight(q,r){if(r==null||r==="")return false;const ty=q[2],a=q[7];if(ty==="int")return Number(r)===a;if(ty==="multi"){const s=[...r].sort().join(),t=[...a].sort().join();return s===t}return r===a}
function mark(q,r,mode){const ty=q[2];if(r==null||r===""||(Array.isArray(r)&&!r.length))return 0;
 if(mode==="JEE Advanced"){if(ty==="int")return isRight(q,r)?4:0;
  if(ty==="multi"){const a=q[7];if(r.some(x=>!a.includes(x)))return -2;return r.length===a.length?4:r.length}
  return isRight(q,r)?3:-1}
 return isRight(q,r)?4:-1}
function maxMark(q,mode){return mode==="JEE Advanced"?(q[2]==="mcq"||q[2]==="ar"||q[2]==="stmt"||q[2]==="match"||q[2]==="order"?3:4):4}
/* ---------- progress recording ---------- */
function rec(q,ok){const id=q[0],s=S.q[id]=S.q[id]||{a:0,c:0,box:0,due:day()};s.a++;if(ok){s.c++;s.box=Math.min(INTERVALS.length-1,s.box+1);s.due=day()+INTERVALS[s.box];s.w=0}else{s.box=0;s.due=day();s.w=1}s.t=day();save()}
const wrongIds=()=>Object.keys(S.q).filter(id=>S.q[id].w&&byId(id));
const dueIds=()=>Object.keys(S.q).filter(id=>S.q[id].due<=day()&&S.q[id].a&&byId(id));
function topicStats(){const t={};Object.keys(S.q).forEach(id=>{const q=byId(id);if(!q)return;const x=t[q[1]]=t[q[1]]||{a:0,c:0};x.a+=S.q[id].a;x.c+=S.q[id].c});return t}
/* ---------- view state ---------- */
const V={sub:"home",nt:"ie",run:null,mock:null,fc:null,rev:"bm",pf:{topic:"all",diff:"all",type:"all",src:"all",n:10},msg:""};
const mode=()=>S.mode;
function eligible(q){const m=MODES[mode()];return q[3].includes(mode())&&m.types.includes(q[2])}
/* ---------- renderers ---------- */
function chipRow(items,cur,att){return `<div class="xr">${items.map(([k,l])=>`<button class="xb${cur===k?" on":""}" ${att}="${esc(k)}">${esc(l)}</button>`).join("")}</div>`}
function qBlock(q,st){ /* st: {sel, shown, mockMode} */
 const ty=q[2],multi=ty==="multi";let h=`<div class="xm">${esc(D.TOP[q[1]])} · ${esc(ty)} · ${"★".repeat(q[4])} · ${esc(SRC(q))}</div><div class="xq">${br(q[5])}</div>`;
 if(ty==="int"){h+=`<input id="xint" class="xin" inputmode="numeric" pattern="-?[0-9]*" placeholder="Enter integer answer" value="${st.sel==null?"":esc(st.sel)}" ${st.shown?"disabled":""}>`}
 else{const sel=multi?(st.sel||[]):[st.sel];h+=q[6].map((o,i)=>{let c="xo";if(st.shown){if(multi?q[7].includes(i):q[7]===i)c+=" ok";else if(sel.includes(i))c+=" bad"}else if(sel.includes(i))c+=" pick";return `<button class="${c}" data-o="${i}" ${st.shown?"disabled":""}><b>${L[i]}</b><span>${esc(o)}</span></button>`}).join("");
  if(multi)h+=`<div class="xm">Multiple answers may be correct.</div>`}
 return h}
function expl(q,r){const ok=isRight(q,r);const ans=q[2]==="int"?String(q[7]):q[2]==="multi"?q[7].map(i=>L[i]).join(", "):L[q[7]];return `<div class="xe ${ok?"ok":"bad"}"><b>${ok?"Correct":"Not correct"}.</b> Answer: ${esc(ans)}<br>${esc(q[8])}</div>`}
function bmBtn(q){const on=S.bm.includes(q[0]);return `<button class="xb${on?" on":""}" data-bm="${esc(q[0])}" aria-pressed="${on}">${on?"★ Bookmarked":"☆ Bookmark"}</button>`}
function pick(n,f){const a=pool().filter(q=>eligible(q)&&(!f||f(q)));for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,n)}
function vHome(){const ts=topicStats(),tot=Object.values(S.q).reduce((a,x)=>({a:a.a+x.a,c:a.c+x.c}),{a:0,c:0}),keys=Object.keys(D.TOP),dn=keys.filter(k=>S.done[k]).length;
 const weak=Object.keys(ts).filter(k=>ts[k].a>=1).sort((a,b)=>ts[a].c/ts[a].a-ts[b].c/ts[b].a).slice(0,4);
 const total=pool().length,gen=pool().filter(q=>q[9]==="gen").length;
 return `<p class="xm"><b>${esc(mode())}:</b> ${esc(MODES[mode()].fmt)}</p>
 <div class="xg"><div><b>${total}</b><span>questions (${total-gen} authored + ${gen} generated)</span></div><div><b>${tot.a?Math.round(100*tot.c/tot.a):0}%</b><span>accuracy (${tot.a} attempts)</span></div><div><b>${dn}/${keys.length}</b><span>topics done</span></div><div><b>${dueIds().length}</b><span>due for revision</span></div><div><b>${S.bm.length}</b><span>bookmarks</span></div><div><b>${wrongIds().length}</b><span>in wrong notebook</span></div></div>
 <h4>Weakest topics so far</h4>${weak.length?weak.map(k=>`<div class="xm">${esc(D.TOP[k])}: ${ts[k].c}/${ts[k].a} correct (${Math.round(100*ts[k].c/ts[k].a)}%)</div>`).join(""):'<p class="xm">Attempt some questions to see weak-topic analysis.</p>'}
 <div class="xr"><button class="xb on" data-go="practice">Start practice</button><button class="xb" data-go="mock">Take a mock</button><button class="xb" data-go="exc">Exception drill</button><button class="xb" data-go="due">Revise due (${dueIds().length})</button></div>
 <p class="xm">Honest status: no PYQs are bundled (${pyqCount()} imported by you). This bank is practice material, it cannot predict future questions.</p>`}
function vSyl(){const m=mode(),lines=D.SYL[m];
 return `<h4>Official syllabus lines (paraphrased) for ${esc(m)}</h4><ul class="xl">${lines.map(l=>`<li>${esc(l)}</li>`).join("")}</ul><p class="xm">Verify against the current official syllabus: nta.ac.in (NEET, JEE Main) and jeeadv.ac.in (JEE Advanced). Edition/year not yet checked here.</p>
 <h4>Topic checklist</h4>${Object.keys(D.TOP).map(k=>`<label class="xc"><input type="checkbox" data-done="${k}" ${S.done[k]?"checked":""}> ${esc(D.TOP[k])} <span class="xm">(${pool().filter(q=>q[1]===k).length} Qs)</span></label>`).join("")}
 <h4>NCERT Class 11 Ch. 3 sections (Classification of Elements and Periodicity in Properties)</h4>${D.NCERT_TOPICS.map((t,i)=>`<label class="xc"><input type="checkbox" data-nc="${i}" ${S.ncert[i]?"checked":""}> ${esc(t)}</label>`).join("")}
 <p class="xm">Section titles follow the commonly used NCERT chapter. Page numbers and exact NCERT lines are pending verification: this app does not quote NCERT; all explanations are paraphrased and the new NCERT edition may reorder sections.</p>`}
function vNotes(){const n=D.NOTES.find(x=>x.k===V.nt)||D.NOTES[0];
 const sel=`<select id="xnt">${D.NOTES.map(x=>`<option value="${x.k}"${x.k===n.k?" selected":""}>${esc(x.t)}</option>`).join("")}</select>`;
 const tb=n.table?`<div class="xs"><table>${n.table.h.length?`<tr>${n.table.h.map(c=>`<th>${esc(c)}</th>`).join("")}</tr>`:""}${n.table.r.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></div>`:"";
 const li=a=>a&&a.length?`<ul class="xl">${a.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"<p class=\"xm\">None to note.</p>";
 return `${sel}${n.optional?'<p class="xm"><b>OPTIONAL:</b> not confirmed as part of every exam syllabus.</p>':""}<h4>Explanation</h4><p>${esc(n.ex)}</p><h4>Rules</h4>${li(n.rules)}<h4>Trend</h4><p>${esc(n.trend)}</p><h4>Why</h4><p>${esc(n.why)}</p><h4>Exceptions</h4>${li(n.exc)}${tb}${n.solved?`<h4>Solved example</h4><p><b>Q.</b> ${esc(n.solved.q)}<br><b>A.</b> ${esc(n.solved.a)}</p>`:""}<h4>Common mistakes</h4>${li(n.mist)}
 <div class="xr"><button class="xb on" data-prac="${n.k}">Practice this topic (${pool().filter(q=>q[1]===n.k&&eligible(q)).length})</button><button class="xb" data-markdone="${n.k}">${S.done[n.k]?"✓ Done (undo)":"Mark topic done"}</button></div><p class="xm">NCERT reference: Class 11, Chapter 3. Page/line references pending verification; text above is paraphrased.</p>`}
function vExc(){const rows=D.NOTES.filter(n=>n.exc&&n.exc.length);
 return `<p class="xm">High-priority exceptions. Each has a reason: learn the reason, not just the order.</p>`+rows.map(n=>`<div class="xn"><b>${esc(n.t)}</b><ul class="xl">${n.exc.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")+`<div class="xr"><button class="xb on" data-go="excdrill">Start exception drill</button></div>`}
function vPrac(){const f=V.pf,r=V.run;
 if(r&&r.i<r.qs.length){const q=r.qs[r.i];return `<div class="xm">Question ${r.i+1}/${r.qs.length} · score ${r.sc}</div>${qBlock(q,r)}<div class="xr">${r.shown?`<button class="xb on" data-next="1">${r.i+1<r.qs.length?"Next":"Finish"}</button>`:`<button class="xb on" data-check="1">Check</button>`}${bmBtn(q)}</div>${r.shown?expl(q,r.sel):""}`}
 if(r&&r.i>=r.qs.length)return `<h4>Finished</h4><p>Score: ${r.sc}/${r.qs.length}. Wrong answers were added to your notebook.</p><div class="xr"><button class="xb on" data-go="practice">Back</button></div>`;
 const tp=[["all","All topics"]].concat(Object.keys(D.TOP).map(k=>[k,D.TOP[k]]));
 const sel=(id,arr,cur)=>`<select id="${id}">${arr.map(([k,l])=>`<option value="${esc(k)}"${String(cur)===String(k)?" selected":""}>${esc(l)}</option>`).join("")}</select>`;
 return `<p class="xm">Questions are filtered for <b>${esc(mode())}</b> (types and exam tags). ${esc(V.msg)}</p><div class="xr">${sel("fp-t",tp,f.topic)}${sel("fp-d",[["all","Any difficulty"],[1,"Easy"],[2,"Medium"],[3,"Hard"]],f.diff)}${sel("fp-y",[["all","Any type"],["mcq","MCQ"],["ar","Assertion-reason"],["stmt","Statements"],["match","Match"],["order","Ordering"],["multi","Multi-correct"],["int","Integer"]],f.type)}${sel("fp-s",[["all","Any source"],["orig","Original practice"],["gen","Generated"]],f.src)}${sel("fp-n",[[5,"5 Qs"],[10,"10 Qs"],[20,"20 Qs"]],f.n)}</div><div class="xr"><button class="xb on" data-start="1">Start</button></div>`}
function vMock(){const m=V.mock,M=MODES[mode()];
 if(m&&!m.done){const q=m.qs[m.i],left=Math.max(0,m.end-Date.now());return `<div class="xr"><b id="xtm">${fmtT(left)}</b><span class="xm">Q ${m.i+1}/${m.qs.length}</span></div>${qBlock(q,{sel:m.r[m.i],shown:false})}<div class="xr"><button class="xb" data-mprev="1">Prev</button><button class="xb on" data-mnext="1">${m.i+1<m.qs.length?"Save & next":"Save"}</button><button class="xb" data-mclear="1">Clear</button><button class="xb" data-msubmit="1">Submit</button></div><div class="xp">${m.qs.map((_,i)=>`<button class="xpi${i===m.i?" cur":""}${m.r[i]!=null&&m.r[i]!==""&&!(Array.isArray(m.r[i])&&!m.r[i].length)?" ans":""}" data-mj="${i}">${i+1}</button>`).join("")}</div>`}
 if(m&&m.done){let sc=0,mx=0,c=0,w=0,u=0;m.qs.forEach((q,i)=>{const k=mark(q,m.r[i],mode());mx+=maxMark(q,mode());sc+=k;const a=m.r[i]!=null&&m.r[i]!==""&&!(Array.isArray(m.r[i])&&!m.r[i].length);if(!a)u++;else if(isRight(q,m.r[i]))c++;else w++});
  return `<h4>Result: ${sc} / ${mx}</h4><p>${c} correct, ${w} wrong, ${u} unattempted. Marking is illustrative for ${esc(mode())}.</p>${m.qs.map((q,i)=>`<div class="xn"><b>Q${i+1}.</b> ${br(q[5])}${expl(q,m.r[i])}</div>`).join("")}<div class="xr"><button class="xb on" data-go="mock">New mock</button></div>`}
 const h=S.mocks.slice(-5).reverse().map(x=>`<div class="xm">${esc(x.m)}: ${x.s}/${x.x} (${x.n} Qs)</div>`).join("");
 return `<p class="xm">${esc(M.fmt)}</p><div class="xr"><select id="xmn"><option value="10">10 questions</option><option value="20" selected>20 questions</option><option value="30">30 questions</option></select><button class="xb on" data-mstart="1">Start timed mock</button></div><p class="xm">Time allowed = ${M.sec}s per question for this mode. Mixed topics, no feedback until you submit.</p>${h?"<h4>Recent mocks</h4>"+h:""}`}
const fmtT=ms=>{const s=Math.ceil(ms/1000);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")};
function vCards(){const f=V.fc;
 if(f&&f.i<f.list.length){const c=D.FLASH[f.list[f.i]];return `<div class="xm">Card ${f.i+1}/${f.list.length}</div><div class="xcard" data-flip="1"><b>${esc(f.show?c[1]:c[0])}</b><span class="xm">${f.show?"Answer":"Tap to reveal"}</span></div>${f.show?`<div class="xr"><button class="xb" data-fc="0">Again</button><button class="xb on" data-fc="1">Got it</button></div>`:""}`}
 const due=D.FLASH.map((_,i)=>i).filter(i=>!S.fc[i]||S.fc[i].due<=day());
 return `<p class="xm">${D.FLASH.length} exception and fact cards. ${due.length} due now.</p><div class="xr"><button class="xb on" data-fcs="due">Study due (${due.length})</button><button class="xb" data-fcs="all">Shuffle all</button></div>`}
function listQs(ids,label){if(!ids.length)return `<p class="xm">Nothing here yet.</p>`;return `<div class="xr"><button class="xb on" data-rp="${esc(ids.join(","))}">Practice these (${ids.length})</button></div>`+ids.slice(0,40).map(id=>{const q=byId(id);return q?`<div class="xn">${esc(D.TOP[q[1]])}<br>${br(q[5])}</div>`:""}).join("")}
function vRev(){const t=[["bm","Bookmarks"],["wr","Wrong notebook"],["wk","Weak topics"],["du","Due today"]];let b;
 if(V.rev==="bm")b=listQs(S.bm.filter(byId));else if(V.rev==="wr")b=listQs(wrongIds());else if(V.rev==="du")b=listQs(dueIds());
 else{const ts=topicStats(),ks=Object.keys(ts).filter(k=>ts[k].a>=1&&ts[k].c/ts[k].a<0.7);b=ks.length?ks.map(k=>`<div class="xn"><b>${esc(D.TOP[k])}</b>: ${ts[k].c}/${ts[k].a} correct <button class="xb" data-prac="${k}">Practice</button></div>`).join(""):'<p class="xm">No weak topics detected yet (needs attempts below 70% accuracy).</p>'}
 return chipRow(t,V.rev,"data-rv")+b}
function pyqList(){try{const a=JSON.parse(localStorage.getItem(PKEY));return Array.isArray(a)?a:[]}catch(_){return[]}}
const pyqCount=()=>pyqList().length;
function vPyq(){const a=pyqList();
 return `<p class="xm"><b>Verified PYQs bundled: 0.</b> I could not verify individual questions against official papers here, and invented PYQs are not allowed. Import your own verified list (JSON). Each item needs exam, year, source, q, 4 options and answer index. Imported items are your responsibility to verify. Questions in this app are labelled ORIGINAL PRACTICE or GENERATED, never PYQ.</p><div class="xr">${["NEET","JEE Main","JEE Advanced"].map(e=>`<span class="xb">${esc(e)}: ${a.filter(x=>x.exam===e).length}</span>`).join("")}</div><p class="xm">Use the NCERT Prep tab's PYQs section to import the file; it shares this store.</p>`+a.slice(0,30).map(x=>`<div class="xn"><b>${esc(x.exam)} ${esc(x.year)}</b> · ${esc(x.source)}<br>${esc(x.q)}</div>`).join("")}
function vData(){return `<p class="xm">${esc(notice)||"Progress is stored only in this browser."}</p><div class="xr"><button class="xb on" data-exp="1">Export progress</button><button class="xb" data-imp="1">Import progress</button><input type="file" id="xfile" accept="application/json" hidden><button class="xb" data-rec="1">Restore corrupted backup</button><button class="xb dg" data-reset="1">Reset all progress</button></div>`}
const TABS=[["home","Home"],["syl","Syllabus"],["notes","Notes"],["exc","Exceptions"],["practice","Practice"],["mock","Mock"],["cards","Cards"],["rev","Revise"],["pyq","PYQ"],["data","Data"]];
let tid=0;
function draw(){const el=$("#ve");if(!el)return;clearInterval(tid);
 const body={home:vHome,syl:vSyl,notes:vNotes,exc:vExc,practice:vPrac,mock:vMock,cards:vCards,rev:vRev,pyq:vPyq,data:vData}[V.sub]();
 el.querySelector(".pad").innerHTML=`<div class="g xw"><div class="xr" role="tablist" aria-label="Exam mode">${D.EXAMS.map(e=>`<button class="xb${mode()===e?" on":""}" data-mode="${esc(e)}" role="tab" aria-selected="${mode()===e}">${esc(e)}</button>`).join("")}</div><div class="xr xsub">${TABS.map(([k,l])=>`<button class="xb${V.sub===k?" on":""}" data-sub="${k}">${l}</button>`).join("")}</div>${notice&&V.sub!=="data"?`<p class="xm">${esc(notice)}</p>`:""}${body}</div>`;
 bind(el);
 if(V.sub==="mock"&&V.mock&&!V.mock.done)tid=setInterval(()=>{const t=$("#xtm"),m=V.mock;if(!m||m.done){clearInterval(tid);return}const left=m.end-Date.now();if(t)t.textContent=fmtT(Math.max(0,left));if(left<=0){clearInterval(tid);finishMock()}},1000)}
function readSel(){const r=V.run||V.mock;return r}
function finishMock(){const m=V.mock;if(!m||m.done)return;m.done=true;let sc=0,mx=0;m.qs.forEach((q,i)=>{const a=m.r[i]!=null&&m.r[i]!==""&&!(Array.isArray(m.r[i])&&!m.r[i].length);if(a)rec(q,isRight(q,m.r[i]));sc+=mark(q,m.r[i],mode());mx+=maxMark(q,mode())});S.mocks.push({m:mode(),s:sc,x:mx,n:m.qs.length,d:day()});save();draw()}
function startRun(qs){V.run={qs,i:0,sel:null,shown:false,sc:0};V.sub="practice";draw()}
function curVal(){const q=V.mock?V.mock.qs[V.mock.i]:V.run.qs[V.run.i];if(q[2]==="int"){const e=$("#xint");return e&&e.value!==""?e.value.trim():null}return null}
function bind(el){
 el.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{S.mode=b.dataset.mode;save();V.run=null;V.mock=null;draw()});
 el.querySelectorAll("[data-sub]").forEach(b=>b.onclick=()=>{V.sub=b.dataset.sub;if(V.sub!=="practice")V.run=null;draw()});
 el.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const g=b.dataset.go;V.run=null;V.mock=null;V.fc=null;
  if(g==="exc"){V.sub="exc"}else if(g==="excdrill"){const qs=pick(10,q=>["ie","eg","config","radii","iso"].includes(q[1])&&q[4]>=2);if(!qs.length){V.msg="No exception questions for this mode.";V.sub="practice"}else return startRun(qs)}
  else if(g==="due"){const qs=dueIds().map(byId).filter(q=>q&&eligible(q)).slice(0,10);if(!qs.length){V.msg="Nothing due for this mode.";V.sub="practice"}else return startRun(qs)}
  else V.sub=g;draw()});
 const nt=$("#xnt");if(nt)nt.onchange=()=>{V.nt=nt.value;draw()};
 el.querySelectorAll("[data-done]").forEach(c=>c.onchange=()=>{c.checked?S.done[c.dataset.done]=1:delete S.done[c.dataset.done];save()});
 el.querySelectorAll("[data-nc]").forEach(c=>c.onchange=()=>{c.checked?S.ncert[c.dataset.nc]=1:delete S.ncert[c.dataset.nc];save()});
 el.querySelectorAll("[data-markdone]").forEach(b=>b.onclick=()=>{const k=b.dataset.markdone;S.done[k]?delete S.done[k]:S.done[k]=1;save();draw()});
 el.querySelectorAll("[data-prac]").forEach(b=>b.onclick=()=>{const k=b.dataset.prac,qs=pick(10,q=>q[1]===k);if(!qs.length){V.msg="No questions for this topic in "+mode()+".";V.sub="practice";return draw()}startRun(qs)});
 const st=el.querySelector("[data-start]");if(st)st.onclick=()=>{const g=i=>$(i).value,f=V.pf={topic:g("#fp-t"),diff:g("#fp-d"),type:g("#fp-y"),src:g("#fp-s"),n:+g("#fp-n")};
  const qs=pick(f.n,q=>(f.topic==="all"||q[1]===f.topic)&&(f.diff==="all"||q[4]===+f.diff)&&(f.type==="all"||q[2]===f.type)&&(f.src==="all"||(f.src==="gen")===(q[9]==="gen")));
  if(!qs.length){V.msg="No questions match these filters.";return draw()}V.msg="";startRun(qs)};
 /* option clicks (practice + mock) */
 el.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const i=+b.dataset.o,r=V.mock&&!V.mock.done?V.mock:V.run;if(!r)return;const q=(V.mock&&!V.mock.done?V.mock.qs[V.mock.i]:r.qs[r.i]);
  if(V.mock&&!V.mock.done){const m=V.mock;if(q[2]==="multi"){const a=Array.isArray(m.r[m.i])?m.r[m.i]:[];m.r[m.i]=a.includes(i)?a.filter(x=>x!==i):a.concat(i)}else m.r[m.i]=i}
  else{if(r.shown)return;if(q[2]==="multi"){const a=Array.isArray(r.sel)?r.sel:[];r.sel=a.includes(i)?a.filter(x=>x!==i):a.concat(i)}else r.sel=i}
  draw()});
 const ck=el.querySelector("[data-check]");if(ck)ck.onclick=()=>{const r=V.run,q=r.qs[r.i];if(q[2]==="int")r.sel=curVal();
  if(r.sel==null||r.sel===""||(Array.isArray(r.sel)&&!r.sel.length)){return}
  r.shown=true;const ok=isRight(q,r.sel);if(ok)r.sc++;rec(q,ok);draw()};
 const nx=el.querySelector("[data-next]");if(nx)nx.onclick=()=>{const r=V.run;r.i++;r.sel=null;r.shown=false;draw();scrollTo(0,0)};
 el.querySelectorAll("[data-bm]").forEach(b=>b.onclick=()=>{const id=b.dataset.bm,i=S.bm.indexOf(id);i>=0?S.bm.splice(i,1):S.bm.push(id);save();const keep=$("#xint")&&$("#xint").value;draw();const e=$("#xint");if(e&&keep)e.value=keep});
 /* mock */
 const ms=el.querySelector("[data-mstart]");if(ms)ms.onclick=()=>{const n=+$("#xmn").value,qs=pick(n,null);if(qs.length<5){V.msg="Not enough questions for this mode.";return draw()}V.mock={qs,i:0,r:[],end:Date.now()+qs.length*MODES[mode()].sec*1000,done:false};draw()};
 const saveInt=()=>{const m=V.mock,q=m.qs[m.i];if(q[2]==="int"){const v=curVal();m.r[m.i]=v}};
 const mn=el.querySelector("[data-mnext]");if(mn)mn.onclick=()=>{saveInt();if(V.mock.i+1<V.mock.qs.length)V.mock.i++;draw()};
 const mp=el.querySelector("[data-mprev]");if(mp)mp.onclick=()=>{saveInt();if(V.mock.i>0)V.mock.i--;draw()};
 const mc=el.querySelector("[data-mclear]");if(mc)mc.onclick=()=>{V.mock.r[V.mock.i]=null;draw()};
 el.querySelectorAll("[data-mj]").forEach(b=>b.onclick=()=>{saveInt();V.mock.i=+b.dataset.mj;draw()});
 const sm=el.querySelector("[data-msubmit]");if(sm)sm.onclick=()=>{saveInt();if(confirm("Submit the mock now?"))finishMock()};
 /* cards */
 el.querySelectorAll("[data-fcs]").forEach(b=>b.onclick=()=>{let l=D.FLASH.map((_,i)=>i);if(b.dataset.fcs==="due")l=l.filter(i=>!S.fc[i]||S.fc[i].due<=day());for(let i=l.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[l[i],l[j]]=[l[j],l[i]]}if(!l.length){V.msg="";return draw()}V.fc={list:l,i:0,show:false};draw()});
 const fl=el.querySelector("[data-flip]");if(fl)fl.onclick=()=>{V.fc.show=true;draw()};
 el.querySelectorAll("[data-fc]").forEach(b=>b.onclick=()=>{const f=V.fc,i=f.list[f.i],s=S.fc[i]=S.fc[i]||{box:0,due:day()};if(b.dataset.fc==="1"){s.box=Math.min(INTERVALS.length-1,s.box+1);s.due=day()+INTERVALS[s.box]}else{s.box=0;s.due=day()}save();f.i++;f.show=false;draw()});
 /* revise */
 el.querySelectorAll("[data-rv]").forEach(b=>b.onclick=()=>{V.rev=b.dataset.rv;draw()});
 el.querySelectorAll("[data-rp]").forEach(b=>b.onclick=()=>{const qs=b.dataset.rp.split(",").map(byId).filter(q=>q&&eligible(q)).slice(0,20);if(!qs.length){V.msg="None of these suit "+mode()+".";V.sub="practice";return draw()}startRun(qs)});
 /* data */
 const ex=el.querySelector("[data-exp]");if(ex)ex.onclick=()=>{const b=new Blob([JSON.stringify(S)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="codex-exam-progress.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
 const im=el.querySelector("[data-imp]");if(im)im.onclick=()=>$("#xfile").click();
 const fi=$("#xfile");if(fi)fi.onchange=()=>{const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!o||o.v!==1||typeof o!=="object")throw 0;localStorage.setItem(KEY,JSON.stringify(o));S=load();notice="Progress imported.";draw()}catch(_){notice="That file is not valid progress data. Nothing was changed.";draw()}};if(fi.files[0])r.readAsText(fi.files[0])};
 const rc=el.querySelector("[data-rec]");if(rc)rc.onclick=()=>{try{const b=localStorage.getItem(BAK);if(!b){notice="No backup found.";return draw()}JSON.parse(b);localStorage.setItem(KEY,b);S=load();notice="Backup restored."}catch(_){notice="Backup could not be restored."}draw()};
 const rs=el.querySelector("[data-reset]");if(rs)rs.onclick=()=>{if(confirm("Reset ALL Exam Master progress? This cannot be undone.")){S=blank();save();notice="Progress reset.";draw()}};
}
function init(){const nav=$(".tabs");if(!nav||$("#ve"))return;
 const st=document.createElement("style");st.textContent=".xw{padding:14px}.xr{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px;align-items:center}.xb,#ve select,.xin{padding:10px 12px;min-height:44px;border-radius:12px;border:1px solid var(--bd);background:transparent;color:inherit;font:inherit;font-weight:600;cursor:pointer}.xb.on{background:var(--vio);color:#fff}.xb.dg{border-color:#e5484d;color:#e5484d}.xin{width:100%;box-sizing:border-box;cursor:text}.xo{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;margin:6px 0;padding:12px;min-height:44px;border-radius:12px;border:1px solid var(--bd);background:transparent;color:inherit;font:inherit;cursor:pointer}.xo b{color:var(--gold)}.xo.pick{border-color:var(--vio);background:color-mix(in srgb,var(--vio) 18%,transparent)}.xo.ok{border-color:#34c27a;background:rgba(52,194,122,.15)}.xo.bad{border-color:#e5484d;background:rgba(229,72,77,.15)}.xm{font-size:.8rem;color:var(--mu);line-height:1.5}.xq{font-size:1rem;font-weight:700;line-height:1.5;margin:6px 0}.xe{margin:10px 0;padding:10px;border-left:3px solid var(--gold);font-size:.88rem;line-height:1.5}.xe.ok{border-color:#34c27a}.xe.bad{border-color:#e5484d}.xn{margin:10px 0;padding:10px;border-left:3px solid var(--vio);font-size:.88rem;line-height:1.5}.xl{margin:4px 0 8px;padding-left:20px;font-size:.88rem;line-height:1.55}.xc{display:flex;gap:8px;align-items:center;padding:8px 0;font-size:.9rem}.xc input{width:20px;height:20px;accent-color:var(--vio)}.xg{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:8px 0}.xg div{border:1px solid var(--bd);border-radius:12px;padding:10px}.xg b{display:block;font-size:1.3rem;color:var(--gold)}.xg span{font-size:.72rem;color:var(--mu)}.xs{overflow-x:auto}.xs table{border-collapse:collapse;font-size:.8rem}.xs th,.xs td{border:1px solid var(--bd);padding:6px 8px;white-space:nowrap}.xcard{border:1px solid var(--bd);border-radius:16px;padding:28px 16px;text-align:center;min-height:120px;display:grid;gap:8px;place-content:center;cursor:pointer;margin:8px 0}.xp{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.xpi{width:38px;height:38px;border-radius:10px;border:1px solid var(--bd);background:transparent;color:inherit;cursor:pointer}.xpi.ans{background:color-mix(in srgb,var(--vio) 30%,transparent)}.xpi.cur{outline:2px solid var(--gold)}.xsub{overflow-x:auto;flex-wrap:nowrap}#ve select{max-width:100%;min-width:0;flex:1 1 140px;text-overflow:ellipsis}#ve .xw{min-width:0;overflow-wrap:anywhere}#ve .pad{max-width:100vw;box-sizing:border-box}.xsub .xb{white-space:nowrap}#ve h4{margin:14px 0 6px}.xb:focus-visible,.xo:focus-visible{outline:2px solid var(--gold);outline-offset:2px}";document.head.appendChild(st);
 const b=document.createElement("button");b.className="tab";b.dataset.v="ve";b.textContent="🏆 Exam Master";nav.appendChild(b);
 const sec=document.createElement("section");sec.id="ve";sec.className="view";sec.innerHTML='<div class="pad"></div>';document.body.insertBefore(sec,($("#vn")||$("#vq")).nextSibling);
 b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===b));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id==="ve"));draw();scrollTo(0,0)});
 nav.addEventListener("click",ev=>{const t=ev.target.closest(".tab");if(t&&t!==b)clearInterval(tid)});
 draw()}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
window.__EXAM_TEST__={pool,isRight,mark,unpaired,cfgTxt,load:()=>S};
})();
