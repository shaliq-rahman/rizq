// Rizq app logic (framework-agnostic, runs in the browser). Started once from app/RizqApp.tsx.
/* eslint-disable */
export function startRizq(seed){
 if(typeof window==='undefined'||window.__rizqStarted)return;
 window.__rizqStarted=true;

const DEFAULT={v:2,updated:0,salary:50000,living:15000,extra:0,cash:0,buffer:0,start:(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')})(),strategy:'snowball',gst:true,
 cards:[{n:'Card 1',b:30000,r:3.6}],
 emis:[{n:'Loan 1',a:5000,m:12,p:false}],
 ticks:{},actual:{},spend:[]};
let S=seed&&seed.cards?JSON.parse(JSON.stringify(seed)):null;
try{const l=JSON.parse(localStorage.getItem('debtplan')||'null');if(l&&(!S||(l.updated||0)>(S.updated||0)))S=l}catch(e){}
if(!S)S=JSON.parse(JSON.stringify(DEFAULT));
S.ticks=S.ticks||{};S.actual=S.actual||{};S.spend=S.spend||[];
let spAmt='',spNote='',spCat='Food',spMode='UPI',spDate=null,spIdx=null;
let tab='home',hot=null,chartIdx=null,resetArmed=false,firstPaint=true,justTicked=null;
const inr=x=>'₹'+Math.round(x).toLocaleString('en-IN');
const cmp=x=>Math.abs(x)>=1e6?kfmt(x):inr(x);
const kfmt=x=>x>=100000?'₹'+(x/100000).toFixed(x>=1000000?1:2).replace(/\.?0+$/,'')+'L':x>=1000?'₹'+Math.round(x/1000)+'K':'₹'+Math.round(x);
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FM=['January','February','March','April','May','June','July','August','September','October','November','December'];
function mAdd(ym,k){let [y,m]=ym.split('-').map(Number);m=m-1+k;y+=Math.floor(m/12);m=((m%12)+12)%12;return {y,m}}
const mLbl=o=>MN[o.m]+' '+o.y, dLbl=(d,o)=>d+' '+MN[o.m]+' '+o.y, dLong=(d,o)=>d+' '+FM[o.m]+' '+o.y;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CARDC=['#1E7A4C','#C8443A','#F5A524','#2B6CB0','#7C5CBF','#D9782D','#0F8B8D','#B5547A'];
const LOANC=['#94A3B8','#8FA89A','#A8A29E','#9DB3A5','#7FA39A','#A3B18A','#B08968','#7C8D86','#8B9DC3','#A7B0A2'];
const LIVC='#6FA82B';
function colorOf(name){const ci=S.cards.findIndex(c=>c.n===name);if(ci>=0)return CARDC[ci%CARDC.length];const ei=S.emis.findIndex(e=>e.n===name);if(ei>=0){const e=S.emis[ei];return e.p?(['#2B6CB0','#D9782D','#0F8B8D','#B5547A'][S.emis.filter((x,j)=>x.p&&j<ei).length%4]):LOANC[ei%LOANC.length]}return '#999'}
// Every card/loan must have a unique, non-empty name: payments, balances, colours and ticks are all keyed by name.
function uniqNames(){const seen=new Set();let ch=false;
 const fix=(arr,base)=>arr.forEach((x,i)=>{let n=String(x.n==null?'':x.n).trim()||base;if(seen.has(n.toLowerCase())){let k=2;while(seen.has((n+' '+k).toLowerCase()))k++;n=n+' '+k}seen.add(n.toLowerCase());if(n!==x.n){x.n=n;ch=true}});
 fix(S.cards,'Card');fix(S.emis,'Loan');return ch}
const LOGO_WORD='/rizq-word.png';
const LOGO_FAV='/icon-192.png';
const ICONS={
card:'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6.5 15h4"/>',
trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H4.5a3 3 0 0 0 3 4M16 6h3.5a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
party:'<path d="m4 20 4.5-12 7.5 7.5L4 20Z"/><path d="M13 5.5c.5 1 .5 2 0 3M17 9c1.2-.3 2.2-.2 3 .5M16 3.5v.01M20.5 6v.01M19 13v.01"/>',
repeat:'<path d="M17 3l3.5 3.5L17 10"/><path d="M3.5 11V10a3.5 3.5 0 0 1 3.5-3.5h13.5M7 21l-3.5-3.5L7 14"/><path d="M20.5 13v1a3.5 3.5 0 0 1-3.5 3.5H3.5"/>',
flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
cart:'<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5H5l2.2 11h11l2-8H6"/>',
bank:'<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
wallet:'<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="3" y="8" width="18" height="12" rx="3"/><circle cx="16.5" cy="14" r="1.2"/>',
bolt:'<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z"/>',
shield:'<path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6L12 3Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
cal:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
pie:'<path d="M12 3a9 9 0 1 0 9 9h-9V3Z"/><path d="M15.5 3.6A9 9 0 0 1 20.4 8.5H15.5V3.6Z"/>',
alert:'<path d="M12 3.5 2.8 19.5h18.4L12 3.5Z"/><path d="M12 10v4.5M12 17.2v.01"/>',
bars:'<path d="M5 20v-7M12 20V5M19 20v-10"/>',
down:'<path d="m3 6 6.5 6.5 4-4L21 16"/><path d="M15 16h6v-6"/>',
rocket:'<path d="M14.5 4.5c3-1.5 5-1 5-1s.5 2-1 5L12 15l-3-3 5.5-7.5Z"/><path d="m9 12-3.5.5L4 15l3.5 1M12 15l-.5 3.5L9 20l-1-3.5"/><circle cx="15" cy="9" r="1.2"/>',
bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
cash:'<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v.01M18 14.5v.01"/>',
refresh:'<path d="M20 11a8 8 0 0 0-14.5-4M4 4v3.5h3.5"/><path d="M4 13a8 8 0 0 0 14.5 4M20 20v-3.5h-3.5"/>',
check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
user:'<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.6-3.8 3.6-6 7.5-6s6.9 2.2 7.5 6"/>',
lock:'<rect x="4.5" y="10.5" width="15" height="10" rx="2.8"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/>',
eyeoff:'<path d="M3 3l18 18M10.6 6c.5-.1.9-.1 1.4-.1 6 0 9.5 6.1 9.5 6.1a16 16 0 0 1-3 3.8M6.5 7.6A15 15 0 0 0 2.5 12S6 18.1 12 18.1a9 9 0 0 0 3.2-.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
bell:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.6 2H4.4L6 16Z"/><path d="M10 20.7a2 2 0 0 0 4 0"/>',
free:'<path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M11.5 12.5 20 4M14.5 4H20v5.5"/>',
spark:'<path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18l-1.8-5.4L4.5 10.8 10.2 9 12 3.5Z"/>',
sal:'<rect x="3" y="7" width="18" height="12" rx="2.5"/><path d="M3 11h18M12 4v3"/><path d="m9.5 4.5 2.5-1.5 2.5 1.5"/>',
home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
fork:'<path d="M7 3v7.5M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 10.5V21M17.5 3c-2.3 1.8-3.5 4.6-3.5 8h3.5V21"/>',
car:'<path d="M5 12.5 6.8 7h10.4l1.8 5.5"/><rect x="3" y="12" width="18" height="6.5" rx="2.2"/><path d="M7.5 15.2h.01M16.5 15.2h.01"/>',
heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>',
bag:'<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
users:'<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.5-3.2 2.7-5 5.5-5s5 1.8 5.5 5"/><circle cx="17" cy="9" r="2.2"/><path d="M16.5 14.2c2.2.2 3.6 1.6 4 4"/>',
ticket:'<path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3v3Z"/><path d="M13 6v12"/>',
dots:'<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
trash:'<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
chev:'<path d="m9 5 7 7-7 7"/>',
chevl:'<path d="m15 5-7 7 7 7"/>'
};
const I=n=>`<svg class="ic" viewBox="0 0 24 24">${ICONS[n]||''}</svg>`;
const HI=n=>`<span class="hi">${I(n)}</span>`;
const EMO={card:'card',close:'party',emi:'repeat',last:'flag',living:'cart',move:'bank',salary:'cash',pre:'bolt',fund:'shield',buffer:'wallet'};

function simulate(st){
 const skipFirst=st.emiPaidFor===st.start; // this month's EMIs already paid -> no EMI in the first salary month
 const cards=st.cards.filter(c=>+c.b>0).map(c=>({n:c.n,bal:+c.b,b0:+c.b,mn:+c.mn||0,r:(+c.r||0)/100*(st.gst?1.18:1)}));
 const order=[...cards].sort((a,b)=>st.strategy==='avalanche'?(b.r-a.r)||(a.bal-b.bal):(a.bal-b.bal));
 const loans=st.emis.filter(e=>+e.a>0&&+e.m>0).map(e=>({n:e.n,a:+e.a,left:+e.m,bal:+e.a*+e.m,b0:+e.a*+e.m,p:!!e.p}));
 const close={},rows=[],mins={};let interest=0,shortfall=false,short=false;
 const snap=()=>{const o={};order.forEach(c=>o[c.n]=Math.max(0,c.bal));loans.forEach(l=>o[l.n]=Math.max(0,l.bal));return o};
 function payCards(pool){const pays={},kind={};order.forEach(c=>pays[c.n]=0);let target=null;
  for(const c of order){if(c.bal<=0.5)continue;let mn=Math.min(c.bal,c.mn>0?c.mn:Math.max(500,Math.round(c.bal*.05/100)*100));if(mn>pool+0.5)short=true;mn=Math.min(mn,pool);pays[c.n]+=mn;c.bal-=mn;pool-=mn;kind[c.n]='min'}
  for(const c of order){if(c.bal<=0.5||pool<=0)continue;const p=Math.min(c.bal,pool);pays[c.n]+=p;c.bal-=p;pool-=p;if(p>0){kind[c.n]='target';target=c.n}}
  order.forEach(c=>{if(pays[c.n]>0&&c.bal<=0.5)kind[c.n]='close'});
  return {pays,pool,target,kind}}
 const cardsLeft=()=>order.reduce((s,c)=>s+Math.max(0,c.bal),0);
 const loansLeft=()=>loans.reduce((s,l)=>s+Math.max(0,l.bal),0);
 const s0=mAdd(st.start,0);const start=snap();
 if(+st.cash-(+st.buffer)>0&&cardsLeft()>0){const r=payCards(+st.cash-(+st.buffer));
  order.forEach(c=>{if(r.kind[c.n]==='close'&&!close[c.n])close[c.n]=dLbl(5,s0)});
  rows.push({key:'cash',kind:'cash',title:'Right now',payDate:dLbl(5,s0),toDebt:+st.cash-(+st.buffer)-r.pool,emi:0,ems:[],pays:r.pays,ck:r.kind,target:r.target,pre:{},spare:0,cardsLeft:cardsLeft(),loansLeft:loansLeft(),snap:snap()})}
 for(let i=0;i<120;i++){
  const sm=mAdd(st.start,i),pm=mAdd(st.start,i+1);
  let emi=0;const ems=[];
  if(!(i===0&&skipFirst))for(const l of loans){if(l.left>0&&l.bal>0.5){const a=Math.min(l.a,l.bal);emi+=a;l.bal-=a;l.left--;const last=l.bal<=0.5;ems.push({n:l.n,a,last});if(last&&!close[l.n])close[l.n]=mLbl(sm)}}
  const free=(+st.salary)+(+st.extra||0)-(+st.living)-emi;
  if(free<0)shortfall=true;
  let it=0;order.forEach(c=>{if(c.bal>0.5){const x=c.bal*c.r;c.bal+=x;it+=x}});interest+=it;
  let pool=Math.max(0,free),r={pays:{},kind:{},target:null,pool};
  if(cardsLeft()>0.5){r=payCards(pool);pool=r.pool;order.forEach(c=>{if(r.kind[c.n]==='close'&&!close[c.n])close[c.n]=dLbl(5,pm)})}
  const pre={},preClose={};
  for(const l of loans.filter(l=>l.p)){if(pool<=0.5)break;if(l.bal>0.5){const x=Math.min(pool,l.bal);pre[l.n]=x;l.bal-=x;pool-=x;if(l.bal<=0.5){l.left=0;preClose[l.n]=1;if(!close[l.n])close[l.n]=mLbl(sm)}}}
  const anyCard=Object.values(r.pays).some(v=>v>0);
  rows.push({key:st.start+'#'+i,kind:'month',sm,pm,title:mLbl(sm),payDate:anyCard?dLbl(5,pm):dLbl(15,sm),toDebt:Math.max(0,free)-pool,emi,ems,pays:r.pays,ck:r.kind,target:r.target,pre,preClose,spare:pool,cardsLeft:cardsLeft(),loansLeft:loansLeft(),snap:snap(),interest:it});
  if(cardsLeft()<=0.5&&loans.every(l=>l.bal<=0.5||l.left<=0))break}
 const stuck=cardsLeft()>0.5||loans.some(l=>l.bal>0.5&&l.left>0);
 const lastLoan=[...rows].reverse().find(r=>r.kind==='month'&&(r.emi>0||Object.keys(r.pre).length));
 const lastCard=[...rows].reverse().find(r=>Object.values(r.pays).some(v=>v>0));
 const base=Math.max(0,...st.emis.filter(e=>+e.a>0).map(e=>+e.m));
 // debt-free = whichever is later: the final loan EMI/prepayment (15th) or the final card payment (5th of the next month)
 const loanD=lastLoan?new Date(lastLoan.sm.y,lastLoan.sm.m,15):null;
 const cardD=lastCard?(lastCard.kind==='cash'?new Date(s0.y,s0.m,5):new Date(lastCard.pm.y,lastCard.pm.m,5)):null;
 const freeD=loanD&&cardD?(cardD>loanD?cardD:loanD):(loanD||cardD||new Date());
 const freeM={y:freeD.getFullYear(),m:freeD.getMonth()};
 const freeDate=(loanD||cardD)?dLong(freeD.getDate(),freeM):'Today';
 return {rows,order,loans,close,interest,shortfall:shortfall||short,stuck,start,
  freeDate,freeM:(loanD||cardD)?freeM:s0,freeD,
  cardsDate:lastCard?(lastCard.kind==='cash'?dLong(5,s0):dLong(5,lastCard.pm)):'—',
  cardsD:cardD?cardD.getTime():null,
  baseM:base?mAdd(st.start,base-1+(skipFirst?1:0)):null}
}

function stepsFor(r,P){
 const st=[];
 if(r.kind==='cash'){
  st.push({id:'buffer',e:EMO.buffer,t:`Keep ${inr(S.buffer)} for daily needs`,d:`Spending money till salary. Don’t use cards.`,info:true,amt:S.buffer,c:LIVC,grp:'Now'});
 }else{
  const sd=dLbl(15,r.sm);
  st.push({id:'salary',e:EMO.salary,t:`Salary ${inr(+S.salary+(+S.extra||0))} arrives`,d:`${sd}`,info:true,grp:sd+' · Salary day'});
  r.ems.forEach(x=>st.push({id:'emi:'+x.n,e:x.last?EMO.last:EMO.emi,t:`${x.n} EMI`,chip:x.last?['Last EMI','c-last']:['EMI','c-emi'],d:x.last?'Final instalment — done after this.':'Auto-debit — keep balance ready.',amt:x.a,c:colorOf(x.n),pay:1,grp:sd+' · Salary day'}));
  st.push({id:'living',e:EMO.living,t:`Keep ${inr(S.living)} for daily needs`,d:`≈ ${inr(S.living/30)}/day · food, rent, fuel, bills`,amt:S.living,c:LIVC,grp:sd+' · Salary day'});
  if(r.toDebt>0)st.push({id:'move',e:EMO.move,t:`Move ${inr(r.toDebt)} to a debt account`,d:`Keep it separate so it isn’t spent.`,amt:r.toDebt,c:'#1E7A4C',grp:sd+' · Salary day'});
 }
 const due=r.kind==='cash'?`By ${r.payDate} · Card due date`:`By ${r.payDate} · Card due date`;
 P.order.forEach(c=>{const v=r.pays[c.n];if(!(v>0))return;const k=r.ck[c.n];
  const chip=k==='close'?['Closes','c-close']:k==='target'?['Target','c-target']:['Minimum due','c-min'];
  const d=k==='close'?`Clears the balance — keep card frozen.`:k==='target'?`Extra goes here — more than the minimum.`:`Pay the exact minimum on the statement.`;
  st.push({id:'card:'+c.n,e:k==='close'?EMO.close:EMO.card,t:`Pay ${c.n}`,chip,d,amt:v,c:colorOf(c.n),pay:1,grp:due})});
 Object.entries(r.pre||{}).forEach(([n,v])=>st.push({id:'pre:'+n,e:EMO.pre,t:`Part-prepay ${n}`,chip:r.preClose&&r.preClose[n]?['Closes','c-close']:['Prepay','c-pre'],d:r.preClose&&r.preClose[n]?'Final payment — get a closure letter.':'Ask lender to cut tenure; check charges.',amt:v,c:colorOf(n),pay:1,grp:`By ${dLbl(15,r.sm)} · Prepayment`}));
 if(r.spare>0.5)st.push({id:'fund',e:EMO.fund,t:`Save ${inr(r.spare)} in an emergency fund`,d:'Debts done — build 3–6 months of expenses.',amt:r.spare,c:'#14B8A6',grp:'Then'});
 return st}

const tk=(r,s)=>S.ticks[r.key+'|'+s.id];
function rowProg(r,P){const st=stepsFor(r,P).filter(s=>!s.info);const d=st.filter(s=>tk(r,s)).length;return {d,n:st.length}}
function migrate(P){let ch=false;for(const r of P.rows){if(S.ticks[r.key]===1){stepsFor(r,P).forEach(s=>{if(!s.info)S.ticks[r.key+'|'+s.id]=1});delete S.ticks[r.key];ch=true}}return ch}
const shortM=d=>{const p=d.split(' ');return p.length===3?p[1].slice(0,3)+' '+p[2]:d};
const monthsBetween=(a,b)=>(b.y-a.y)*12+(b.m-a.m);

let emiArmed=false,animNext=true,rzT=null,authReady=false,authMode='login',authU='',authP='',authErr='',authBusy=false,authEye=false;
let cloud=null,cloudUser=null,cloudOff=false,cloudT=null,unsub=null,savedTxt='',notifOpen=false;
const cloudMsg=()=>cloudOff||!cloud?'Saved on this device':(cloudUser?'Synced ✓':'Saved on this device · sign in to sync');
function setSaved(t){savedTxt=t;const el=document.getElementById('saved');if(el)el.textContent=t;const c=document.getElementById('cstat');if(c)c.textContent=t}
function persist(){S.updated=Date.now();try{localStorage.setItem('debtplan',JSON.stringify(S))}catch(e){}
 clearTimeout(cloudT);if(cloud&&cloudUser){setSaved('Saving…');cloudT=setTimeout(pushNow,1200)}else setSaved(cloudMsg())}
async function pushNow(){if(!cloud||!cloudUser)return;try{await cloud.save(cloudUser,S);setSaved('Synced ✓')}catch(e){console.warn(e);setSaved('Sync failed — will retry on next change')}}
function adopt(r){S=r;S.ticks=S.ticks||{};S.actual=S.actual||{};S.spend=S.spend||[];try{localStorage.setItem('debtplan',JSON.stringify(S))}catch(e){}}
function initCloud(c){if(cloud||!c)return;cloud=c;cloudOff=false;
 c.onUser(u=>{authReady=true;cloudUser=u||null;
  if(!u){if(unsub){unsub();unsub=null}setSaved(cloudMsg());render();return}
  try{const last=localStorage.getItem('rizq_uid');if(last&&last!==u.uid){S=JSON.parse(JSON.stringify(DEFAULT));localStorage.removeItem('debtplan');tab='home';spIdx=null}localStorage.setItem('rizq_uid',u.uid)}catch(e){}
  showSplash();animNext=true;
  setSaved('Syncing…');
  if(unsub)unsub();
  unsub=c.subscribe(u,remote=>{
   if(!remote){pushNow();return}
   const ru=remote.updated||0,lu=S.updated||0;
   if(ru>lu){adopt(remote);setSaved('Synced ✓');renderSafe()}
   else if(ru<lu)pushNow();else setSaved('Synced ✓')});
  render()})}
window.addEventListener('rizq-cloud',()=>initCloud(window.RizqCloud));
window.addEventListener('rizq-cloud-off',()=>{if(!cloud){cloudOff=true;render()}});
if(window.RizqCloud)initCloud(window.RizqCloud);
const uname=()=>String((cloudUser&&cloudUser.email)||'').split('@')[0];
function cloudCard(){
 let body;
 if(cloudOff||!cloud)body='<div class="muted">Cloud sync isn’t set up yet. Add your Firebase keys (<b>.env.local</b> or Vercel environment variables) to sync across devices.</div>';
 else if(!cloudUser)body='<div class="muted">Not signed in.</div>';
 else body='<div class="muted">You’re logged in. <span id="cstat">'+esc(savedTxt||'Synced ✓')+'</span></div><button class="btn" data-cloud="push">Upload data now</button><button class="btn ghost" data-cloud="signout">Log out</button>';
 return '<div class="card fade"><h3>'+HI('refresh')+'Cloud sync</h3>'+body+'</div>'}

function ring(p,size,stroke,col,track){const r=(size-stroke)/2,c=2*Math.PI*r;return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-Math.min(1,p))}" style="transition:stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)"/></svg>`}

function paidStats(P){let paid=0,total=0;for(const r of P.rows)for(const s of stepsFor(r,P))if(s.pay){total+=s.amt;if(tk(r,s))paid+=s.amt}return {paid,total}}
// Current balance of every debt, from what you've ticked. Each debt only needs ITS OWN payments ticked
// (e.g. tick a loan's last EMI -> that loan goes to 0 even if other steps that month are still open).
function currentSnap(P){
 const cur={...P.start},rel=(r,n)=>stepsFor(r,P).filter(s=>s.id==='emi:'+n||s.id==='card:'+n||s.id==='pre:'+n);
 const names=Object.keys(P.start);
 for(const n of names){
  for(const r of P.rows){
   const st=rel(r,n);
   if(!st.length){if((r.snap[n]||0)<=0.5)cur[n]=0;continue} // row has nothing for this debt: skip it
   if(st.every(s=>tk(r,s)))cur[n]=r.snap[n];else break}}
 return cur}

function hero(P){
 const now=new Date(),t0d=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 let mo=0,dd=0;if(P.freeD>t0d){mo=(P.freeD.getFullYear()-t0d.getFullYear())*12+P.freeD.getMonth()-t0d.getMonth();
  let an=new Date(t0d.getFullYear(),t0d.getMonth()+mo,t0d.getDate());if(an>P.freeD){mo--;an=new Date(t0d.getFullYear(),t0d.getMonth()+mo,t0d.getDate())}
  dd=Math.round((P.freeD-an)/864e5)}
 const {paid,total}=paidStats(P),pct=total?paid/total:0;
 const saved=P.baseM?Math.max(0,monthsBetween(P.freeM,P.baseM)):0;
 const parts=P.freeDate.split(' '),dm=parts.length>=3?parts[0]+' '+parts[1].slice(0,3):P.freeDate,yr=parts[2]||'';
 const t0=new Date(+S.start.split('-')[0],+S.start.split('-')[1]-1,1).getTime(),t1=P.freeD.getTime();
 const el=Math.max(0,Math.min(1,(now-t0)/Math.max(1,t1-t0)));
 const cp=P.cardsD?Math.max(0.08,Math.min(0.92,(P.cardsD-t0)/Math.max(1,t1-t0))):0.5;
 const cshort=P.cardsDate.split(' ').slice(1).map((x,i)=>i===0?x.slice(0,3):x).join(' ');
 return `<div class="hero"><div class="htop"><div class="lbl">Debt-free on</div>${saved>0?`<div class="badge">${I('bolt')} ${saved} months sooner</div>`:''}</div>
 <div class="hmain"><div class="date disp">${dm}<em>${yr}</em></div>
 <div class="ring">${ring(pct,100,10,'#C9F06B','rgba(255,255,255,.14)')}<div class="c">${Math.round(pct*100)}%<small>paid</small></div></div></div>
 <div class="count"><div><b data-count="${mo}">${mo}</b><small>Months</small></div><div><b data-count="${dd}">${dd}</b><small>Days</small></div><div><b>${kfmt(total-paid)}</b><small>Still to pay</small></div></div>
 <div class="journey"><div class="jbar"><div class="fill" style="width:${Math.max(3,el*100)}%"></div><div class="mk" style="left:${cp*100}%"><span>${I('card')} ${cshort}</span></div><div class="mk end" style="left:100%"><span>${I('flag')} Free</span></div></div>
 <div class="jfoot"><span>Cards cleared <b>${P.cardsDate}</b></span><span>Paid <b>${inr(paid)}</b></span></div></div></div>`}

function focusCard(P){
 const r=P.rows.find(r=>{const p=rowProg(r,P);return p.d<p.n});
 if(!r)return `<div class="card fade"><h3>${HI('party')}Every step is done</h3><div class="muted">You’re debt-free. Next: 3–6 month emergency fund, then a monthly SIP.</div></div>`;
 const pr=rowProg(r,P);
 return `<div class="card fade"><h3><span>${r.kind==='cash'?HI('bolt')+'Do this now':HI('cal')+r.title+' — your steps'}</span><span class="chip c-min">${pr.d}/${pr.n} done</span></h3>
 <div class="muted">${r.kind==='cash'?`Use your ${inr(S.cash)} before ${r.payDate}.`:`Tick each step · to debt this month: <b>${inr(r.toDebt)}</b>`}</div>
 <div class="prog"><i style="width:${pr.n?pr.d/pr.n*100:0}%"></i></div>${stepList(r,P)}</div>`}

function stepList(r,P){
 const st=stepsFor(r,P);let g=null,h='';
 for(const s of st){if(s.grp!==g){g=s.grp;h+=`<div class="when">${esc(g)}</div>`}
  const on=!s.info&&tk(r,s);
  h+=`<div class="step ${on?'on':''} ${s.info?'info':''} ${justTicked===r.key+'|'+s.id?'just':''}" ${s.info?'':`data-step="${r.key}|${esc(s.id)}"`}>
  <span class="bx">${on?'✓':s.info?'':''}</span><span class="sico" style="color:${s.c||'var(--violet)'};background:color-mix(in srgb,${s.c||'#1E7A4C'} 13%,#fff)">${I(s.e)}</span><span class="tx"><span class="tt">${esc(s.t)} ${s.chip?`<span class="chip ${s.chip[1]}">${s.chip[0]}</span>`:''}</span><span class="ds">${s.d}</span></span>
  ${s.amt!=null&&!s.info?`<span class="am" style="color:color-mix(in srgb,${s.c||'#14231B'} 55%,#14231B)">${inr(s.amt)}</span>`:''}</div>`}
 return `<div class="steps">${h}</div>`}

function splitItems(r,P){
 const it=[];
 r.ems.forEach(x=>it.push({n:x.n+' EMI',v:x.a,c:colorOf(x.n)}));
 if(r.kind==='month')it.push({n:'Daily needs (you)',v:+S.living,c:LIVC});
 P.order.forEach(c=>{if(r.pays[c.n]>0)it.push({n:c.n,v:r.pays[c.n],c:colorOf(c.n)})});
 Object.entries(r.pre||{}).forEach(([n,v])=>it.push({n:n+' prepay',v,c:colorOf(n)}));
 if(r.spare>0.5)it.push({n:'Emergency fund',v:r.spare,c:'#14B8A6'});
 return it}

function donutCard(P){
 const r=P.rows.find(r=>r.kind==='month'&&rowProg(r,P).d<rowProg(r,P).n)||P.rows.find(r=>r.kind==='month');if(!r)return '';
 const it=splitItems(r,P),tot=it.reduce((s,x)=>s+x.v,0);let a=0;
 const R=70,ri=46,cx=75,cy=75;
 const paths=it.map((x,i)=>{const a0=a/tot*2*Math.PI,a1=(a+x.v)/tot*2*Math.PI-0.012;a+=x.v;const L=a1-a0>Math.PI?1:0;
  const p=(ang,rr)=>[cx+rr*Math.sin(ang),cy-rr*Math.cos(ang)];const[x0,y0]=p(a0,R),[x1,y1]=p(a1,R),[x2,y2]=p(a1,ri),[x3,y3]=p(a0,ri);
  return `<path data-hot="${i}" class="${hot!=null?(hot===i?'hot':'dim'):''}" d="M${x0},${y0} A${R},${R} 0 ${L} 1 ${x1},${y1} L${x2},${y2} A${ri},${ri} 0 ${L} 0 ${x3},${y3}Z" fill="${x.c}"/>`}).join('');
 const h=hot!=null&&it[hot]?it[hot]:null;
 return `<div class="card fade"><h3><span>${HI('pie')}Where ${r.title}’s salary goes</span></h3><div class="muted">Tap a slice or row.</div>
 <div class="donut"><svg viewBox="0 0 150 150" width="150" height="150">${paths}
 <text x="75" y="${h?70:72}" text-anchor="middle" class="dc" font-size="${h?13:17}" fill="#14231B">${h?inr(h.v):inr(tot)}</text>
 <text x="75" y="${h?87:90}" text-anchor="middle" font-size="12" fill="#55615A">${h?esc(h.n.length>18?h.n.slice(0,17)+'…':h.n):'salary'}</text></svg>
 <div class="leg">${it.map((x,i)=>`<div data-hot="${i}" class="${hot===i?'hot':''}"><i style="background:${x.c}"></i><span>${esc(x.n)}</span><b>${inr(x.v)}</b></div>`).join('')}</div></div></div>`}

function dailyCard(P){
 const first=P.rows.find(r=>r.kind==='month');const pct=(S.living-8000)/(35000-8000)*100;
 return `<div class="card fade"><h3 class="one"><span style="white-space:nowrap">${HI('wallet')}Daily needs</span><span class="seg"><button data-strat="snowball" class="${S.strategy==='snowball'?'on':''}"><span class="lg">Smallest first</span><span class="sh">Smallest</span></button><button data-strat="avalanche" class="${S.strategy==='avalanche'?'on':''}"><span class="lg">Highest rate</span><span class="sh">Highest</span></button></span></h3>
 <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:8px"><b class="disp" style="font-size:30px" id="livv">${inr(S.living)}</b><span class="muted" id="livd">≈ ${inr(S.living/30)}/day</span></div>
 <input type="range" id="living" min="8000" max="35000" step="500" value="${S.living}" style="--p:${pct}%">
 <div class="muted">Drag — see your debt-free date move.</div>
 ${P.shortfall?`<div class="warn">${I('alert')} In some months income can’t cover EMIs + daily needs + card minimums. Lower daily needs or add income.</div>`:''}
 ${P.stuck?`<div class="warn">${I('alert')} At this pace your debts aren’t cleared within 10 years — the monthly payment barely covers interest. Raise income or cut daily needs.</div>`:''}
 <div class="stats"><div class="stat"><small>Debt-free</small><b>${shortM(P.freeDate)}</b></div><div class="stat"><small>Cards cleared</small><b>${shortM(P.cardsDate)}</b></div><div class="stat"><small>Card interest</small><b>${inr(P.interest)}</b></div></div></div>`}

function debtList(P){
 const cur=currentSnap(P);
 const items=[...P.order.map(c=>({n:c.n,b0:c.b0,card:1})),...P.loans.map(l=>({n:l.n,b0:l.b0}))];
 return `<div class="card fade"><h3><span>${HI('bars')}Every debt, shrinking</span></h3><div class="muted">Bars fill as you tick payments.</div>
 ${items.map(x=>{const left=cur[x.n]!=null?cur[x.n]:x.b0,p=x.b0?Math.max(0,1-left/x.b0):1,cd=P.close[x.n];
  return `<div class="debt"><div class="h"><span><i style="background:${colorOf(x.n)}"></i>${esc(x.n)} ${x.card?'<span class="chip c-min">Card</span>':''}</span><span class="num">${left<=0.5?'<span class="chip c-close">Cleared ✓</span>':inr(left)}</span></div>
  <div class="b"><i style="width:${p*100}%;background:${colorOf(x.n)}"></i></div><div class="m"><span>${Math.round(p*100)}% paid of ${inr(x.b0)}</span><span>${cd?'Closes '+cd:''}</span></div></div>`}).join('')}</div>`}

function milestones(P){
 const items=[];
 P.order.forEach(c=>P.close[c.n]&&items.push([P.close[c.n],c.n+' cleared','card']));
 S.emis.filter(e=>+e.m>0&&+e.a>0).forEach(e=>P.close[e.n]&&items.push([P.close[e.n],e.n+(e.p?' closed':' EMI ends'),e.p?'bolt':'flag']));
 const key=s=>{const p=s.split(' ');const d=p.length===3?+p[0]:15;const m=MN.indexOf(p[p.length-2]);return +p[p.length-1]*10000+m*100+d};
 items.sort((a,b)=>key(a[0])-key(b[0]));
 const n=new Date(),nk=n.getFullYear()*10000+n.getMonth()*100+n.getDate();
 return `<div class="card fade"><h3><span>${HI('trophy')}Milestones</span><span class="muted" style="font-size:12px">swipe →</span></h3><div class="tl">${items.map(i=>`<div class="ms ${key(i[0])<=nk?'past':''}"><div class="e">${I(i[2])}</div><small>${i[0]}</small><b>${esc(i[1])}</b></div>`).join('')}<div class="ms final"><div class="e">${I('party')}</div><small>${P.freeDate}</small><b>100% DEBT-FREE</b></div></div></div>`}

function chartCard(P){
 const names=[...P.order.map(c=>c.n),...P.loans.filter(l=>l.p).map(l=>l.n)];
 const pts=[{lbl:'Today',snap:P.start},...P.rows.map(r=>({lbl:r.kind==='cash'?r.payDate:r.title,snap:r.snap}))];
 const W=Math.max(250,Math.min(430,innerWidth)-52),H=210,pad=Math.max(46,Math.round(W*.17)),n=pts.length;
 const tot=p=>names.reduce((s,k)=>s+(p.snap[k]||0),0);const mx=Math.max(...pts.map(tot))||1;
 const X=i=>pad+(W-pad*2)*i/(n-1),Y=v=>H-28-(H-48)*v/mx;
 let base=pts.map(()=>0);const layers=names.map(k=>{const top=pts.map((p,i)=>base[i]+(p.snap[k]||0));
  const d='M'+top.map((v,i)=>X(i)+','+Y(v)).join(' L')+' L'+base.map((v,i)=>[i,v]).reverse().map(([i,v])=>X(i)+','+Y(v)).join(' L')+'Z';base=top;return `<path d="${d}" fill="${colorOf(k)}" fill-opacity=".85"/>`});
 const grid=[0,.5,1].map(f=>`<line x1="${pad}" x2="${W-pad}" y1="${Y(mx*f)}" y2="${Y(mx*f)}" stroke="#E2E7DF"/><text x="${pad-4}" y="${Y(mx*f)+4}" font-size="11" text-anchor="end" fill="#66736B">${kfmt(mx*f)}</text>`).join('');
 const tstep=Math.ceil(n/Math.max(3,Math.floor(W/84)));let lastX=-999;
 const ticks=pts.map((p,i)=>{if(!(i%tstep===0||i===n-1))return '';const x=X(i);if(x-lastX<64)return '';lastX=x;return `<text x="${x}" y="${H-6}" font-size="11" text-anchor="middle" fill="#66736B">${p.lbl.replace(/^\d+ /,'')}</text>`}).join('');
 const ci=chartIdx!=null?Math.min(chartIdx,n-1):null;
 const tip=ci!=null?`<line x1="${X(ci)}" x2="${X(ci)}" y1="10" y2="${H-28}" stroke="#14231B" stroke-dasharray="3 3"/><circle cx="${X(ci)}" cy="${Y(tot(pts[ci]))}" r="5" fill="#fff" stroke="#14231B" stroke-width="2"/>`:'';
 const tipHtml=ci!=null?`<div class="tip" style="left:${X(ci)/W*100}%">${esc(pts[ci].lbl)} · <b>${inr(tot(pts[ci]))}</b> left</div>`:'';
 return `<div class="card fade"><h3><span>${HI('down')}Debt going down</span></h3><div class="muted">Cards + prepaid loans. Drag across the chart.</div>
 <div class="chart" id="chart">${tipHtml}<svg viewBox="0 0 ${W} ${H}" data-n="${n}" data-pad="${pad}" data-w="${W}">${grid}${layers.join('')}${ticks}${tip}</svg></div>
 <div class="leg" style="flex-direction:row;flex-wrap:wrap;max-height:none">${names.map(k=>`<div style="cursor:default"><i style="background:${colorOf(k)}"></i>${esc(k)}</div>`).join('')}</div></div>`}

function startCheck(){const d=new Date(),cur=d.getFullYear()*12+d.getMonth();const [y,m]=String(S.start).split('-').map(Number);return {diff:(y*12+(m-1))-cur,y:d.getFullYear(),m:d.getMonth()}}
function startBanner(){
 const c=startCheck();
 if(c.diff>1)return '<div class="startwarn"><div class="sw">'+I('alert')+'<span><b>Your plan starts in '+monthLbl(S.start)+'</b>, but it’s '+FM[c.m]+' '+c.y+' now — every date below is shifted.</span></div><button class="btn" data-fixstart="1">Set plan to '+FM[c.m]+' '+c.y+'</button></div>';
 if(c.diff<-1)return '<div class="startwarn soft"><div class="sw">'+I('alert')+'<span><b>Your plan started in '+monthLbl(S.start)+'.</b> Update your balances in Debts and set “Plan starts” to this month to keep the dates accurate.</span></div></div>';
 return ''}
function home(P){return startBanner()+hero(P)+focusCard(P)+donutCard(P)+dailyCard(P)+milestones(P)}

function cashOf(r,P){
 const cardsPaid=P.order.reduce((a,c)=>a+(r.pays[c.n]||0),0),pre=Object.values(r.pre||{}).reduce((a,b)=>a+b,0);
 if(r.kind==='cash'){const out=cardsPaid;return {in:+S.cash,parts:[['Card payments',cardsPaid,'#1E7A4C']],out,left:+S.cash-out,leftLbl:'Kept for daily needs',cash:true}}
 const inn=(+S.salary)+(+S.extra||0),parts=[];
 if(r.emi>0)parts.push(['EMIs',r.emi,'#8FA89A']);
 parts.push(['Daily needs',+S.living,'#6FA82B']);
 if(cardsPaid>0)parts.push(['Card payments',cardsPaid,'#C8443A']);
 if(pre>0)parts.push(['Loan prepayment',pre,'#2B6CB0']);
 const out=parts.reduce((a,p)=>a+p[1],0);
 return {in:inn,parts,out,left:inn-out,leftLbl:'Left over'}}
function ledger(r,P){
 const c=cashOf(r,P);
 const tr=spentKey(r.key),act=tr>0?tr:S.actual[r.key],has=act!==undefined&&act!=='';
 const bud=c.cash?+S.buffer:+S.living,diff=has?bud-(+act):0;
 return `<div class="ledger"><div class="lg head"><span>${I('wallet')} ${c.cash?'Cash in hand now':'Cash in hand (salary day)'}</span><b>${inr(c.in)}</b></div>
 ${c.parts.map(p=>`<div class="lg"><span><i style="background:${p[2]}"></i>${p[0]}</span><b>− ${inr(p[1])}</b></div>`).join('')}
 <div class="lg tot"><span>Total spent this month</span><b>${inr(c.out)}</b></div>
 <div class="lg"><span>${c.leftLbl}</span><b style="color:${c.left<0?'var(--coral)':'var(--violet)'}">${inr(c.left)}</b></div>
 <div class="act">${tr>0?`<div style="flex:1;font-size:12px;color:var(--mute);font-weight:600">Daily spending tracked: <b style="color:var(--ink)">${inr(tr)}</b> of ${inr(bud)} <span style="font-weight:500">(from Spend tab)</span></div>`:`<label>Your actual daily spending<input type="number" inputmode="numeric" data-actual="${r.key}" value="${has?act:''}" placeholder="${bud}"></label>`}${has?`<span class="chip ${diff>=0?'c-close':'c-last'}">${diff>=0?'Under by '+inr(diff):'Over by '+inr(-diff)}</span>`:''}</div></div>`}

const CATS=[['Food','fork','#D9782D'],['Groceries','cart','#6FA82B'],['Transport','car','#2B6CB0'],['Bills','bolt','#7C5CBF'],['Home','home','#0F8B8D'],['Health','heart','#C8443A'],['Shopping','bag','#B5547A'],['Family','users','#F5A524'],['Fun','ticket','#2BB6F0'],['Other','dots','#7C8D86']];
const MODES=['Cash','UPI','Debit card','Credit card'];
const catOf=n=>CATS.find(c=>c[0]===n)||CATS[CATS.length-1];
const pad2=n=>String(n).padStart(2,'0');
const todayStr=()=>{const t=new Date();return t.getFullYear()+'-'+pad2(t.getMonth()+1)+'-'+pad2(t.getDate())};
function periodIdxOf(ds){const [y,m,d]=ds.split('-').map(Number),[sy,sm]=S.start.split('-').map(Number);const idx=(y-sy)*12+(m-sm)-(d<15?1:0);return idx<0?-1:idx}
function periodLbl(i){const [sy,sm]=S.start.split('-').map(Number);if(i<0)return 'Now → 14 '+MN[sm-1];const a=mAdd(S.start,i),b=mAdd(S.start,i+1);return '15 '+MN[a.m]+' – 14 '+MN[b.m]+' '+b.y}
function periodEnd(i){const [sy,sm]=S.start.split('-').map(Number);if(i<0)return new Date(sy,sm-1,15);const b=mAdd(S.start,i+1);return new Date(b.y,b.m,15)} // exclusive: 00:00 on the 15th, so the 14th counts as a full day
const itemsIn=i=>S.spend.filter(x=>periodIdxOf(x.d)===i);
const spentKey=key=>{const i=key==='cash'?-1:+key.split('#')[1];return itemsIn(i).reduce((a,x)=>a+(+x.a||0),0)};
const actualFor=key=>{const t=spentKey(key);return t>0?t:S.actual[key]};
const dayLbl=ds=>{const [y,m,d]=ds.split('-').map(Number);const dt=new Date(y,m-1,d);return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()]+' '+d+' '+MN[m-1]};

const fmtDate=ds=>{const [y,m,d]=ds.split('-').map(Number);const dt=new Date(y,m-1,d);return (ds===todayStr()?'Today':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()])+', '+d+' '+MN[m-1]+' '+y};
function openDatePicker(opts){
 if(document.getElementById('dpov'))return;
 const monthOnly=!!(opts&&opts.month);
 const b=(monthOnly?S.start+'-01':(spDate||todayStr())).split('-').map(Number);const T={y:b[0],m:b[1],d:b[2]||1};
 const ty=new Date().getFullYear(),years=[];for(let y=ty-1;y<=ty+(monthOnly?1:3);y++)years.push(y);if(!years.includes(T.y)){years.push(T.y);years.sort()}
 const H=40,dim=(y,m)=>new Date(y,m,0).getDate();let built=0,touched=false;
 const ov=document.createElement('div');ov.id='dpov';
 ov.innerHTML='<div class="dpbk" data-dp="cancel"></div><div class="dpsheet"><div class="dpbar"><button data-dp="cancel">Cancel</button><b>'+(monthOnly?'Plan starts':'Select date')+'</b><button data-dp="done" class="done">Done</button></div><div class="dpquick">'+(monthOnly?'<button data-dp="today">This month</button>':'<button data-dp="today">Today</button><button data-dp="yest">Yesterday</button>')+'</div><div class="dpwheels'+(monthOnly?' m2':'')+'"><div class="dpband"></div>'+(monthOnly?'':'<div class="wh" id="whd"></div>')+'<div class="wh" id="whm"></div><div class="wh" id="why"></div></div></div>';
 document.body.appendChild(ov);
 ov.addEventListener('touchstart',e=>{if(e.target.closest('.wh'))touched=true},{passive:true});ov.addEventListener('pointerdown',e=>{if(e.target.closest('.wh'))touched=true});ov.addEventListener('wheel',()=>{touched=true},{passive:true});
 const wd=ov.querySelector('#whd'),wm=ov.querySelector('#whm'),wy=ov.querySelector('#why');
 const sc=(el,i,sm)=>el&&el.scrollTo({top:i*H,behavior:sm?'smooth':'auto'});
 const fill=(el,arr,sel)=>{if(!el)return;el.innerHTML='<i class="wsp"></i>'+arr.map(a=>'<div class="wi'+(a[0]===sel?' on':'')+'">'+a[1]+'</div>').join('')+'<i class="wsp"></i>'};
 const days=()=>Array.from({length:dim(T.y,T.m)},(_,i)=>[i+1,String(i+1)]);
 function build(){fill(wd,days(),T.d);fill(wm,MN.map((n,i)=>[i+1,FM[i]]),T.m);fill(wy,years.map(y=>[y,String(y)]),T.y);
  const place=()=>{sc(wd,T.d-1);sc(wm,T.m-1);sc(wy,years.indexOf(T.y))};requestAnimationFrame(place);if(!built){built=1;setTimeout(()=>{if(!touched)place()},80);setTimeout(()=>{if(!touched)place()},420)}}
 build();
 const mark=(el,i)=>[...el.querySelectorAll('.wi')].forEach((n,k)=>n.classList.toggle('on',k===i));
 function bind(el,fn){if(!el)return;let t;el.addEventListener('scroll',()=>{clearTimeout(t);t=setTimeout(()=>{const n=el.querySelectorAll('.wi').length,i=Math.max(0,Math.min(n-1,Math.round(el.scrollTop/H)));mark(el,i);fn(i)},90)});
  el.addEventListener('click',e=>{const it=e.target.closest('.wi');if(it)sc(el,[...el.querySelectorAll('.wi')].indexOf(it),true)})}
 const fix=()=>{if(!wd)return;const mx=dim(T.y,T.m);if(T.d>mx)T.d=mx;if(wd.querySelectorAll('.wi').length!==mx){fill(wd,days(),T.d);requestAnimationFrame(()=>sc(wd,T.d-1))}};
 bind(wd,i=>{T.d=i+1});
 bind(wm,i=>{T.m=i+1;fix()});
 bind(wy,i=>{T.y=years[i];fix()});
 const close=()=>{ov.classList.add('out');setTimeout(()=>ov.remove(),260)};
 const setTo=dt=>{T.y=dt.getFullYear();T.m=dt.getMonth()+1;T.d=dt.getDate();if(!years.includes(T.y)){years.push(T.y);years.sort()}build()};
 ov.addEventListener('click',e=>{const t=e.target.closest('[data-dp]');if(!t)return;const a=t.dataset.dp;
  if(a==='cancel')close();
  else if(a==='today')setTo(new Date());
  else if(a==='yest'){const d=new Date();d.setDate(d.getDate()-1);setTo(d)}
  else if(a==='done'){if(monthOnly){S.start=T.y+'-'+pad2(T.m);persist();close();render()}else{spDate=T.y+'-'+pad2(T.m)+'-'+pad2(T.d);close();render()}}});
}
const monthLbl=ym=>{const [y,m]=String(ym).split('-').map(Number);return FM[(m||1)-1]+' '+y};
function spendTab(P){
 if(!spDate)spDate=todayStr();
 const cur=periodIdxOf(todayStr());const maxI=Math.max(0,P.rows.filter(r=>r.kind==='month').length-1);
 let idx=spIdx==null?cur:spIdx;idx=Math.max(-1,Math.min(maxI,idx));
 const items=itemsIn(idx).sort((a,b)=>b.d.localeCompare(a.d)||b.id-a.id);
 const total=items.reduce((a,x)=>a+(+x.a||0),0),budget=idx<0?+S.buffer:+S.living,left=budget-total,pct=budget?Math.min(1,total/budget):0;
 const dl=idx===cur?Math.max(0,Math.ceil((periodEnd(idx)-new Date())/864e5)):0;
 const by={};items.forEach(x=>by[x.c]=(by[x.c]||0)+(+x.a||0));
 const cats=Object.entries(by).sort((a,b)=>b[1]-a[1]);
 let grp='',gd=null;
 items.forEach(x=>{if(x.d!==gd){gd=x.d;const dt=items.filter(y=>y.d===gd).reduce((a,y)=>a+(+y.a||0),0);grp+=`<div class="when" style="display:flex;justify-content:space-between"><span>${dayLbl(gd)}</span><span>${inr(dt)}</span></div>`}
  const c=catOf(x.c);grp+=`<div class="sp"><span class="sico" style="color:${c[2]};background:color-mix(in srgb,${c[2]} 14%,#fff)">${I(c[1])}</span><span class="tx"><b>${esc(x.n||x.c)}</b><small>${esc(x.c)} · <span class="chip ${x.m==='Credit card'?'c-last':'c-emi'}">${esc(x.m)}</span></small></span><span class="am">${inr(x.a)}</span><button class="x" data-delsp="${x.id}" aria-label="Delete">${I('trash')}</button></div>`});
 return `<div class="card fade" style="margin-top:0"><div class="perrow"><button class="pbtn" data-per="-1" aria-label="Previous period" ${idx<=-1?'disabled':''}>${I('chevl')}</button><div style="text-align:center"><div class="lbl" style="color:var(--violet)">${idx<0?'Until salary':'Salary month '+(idx+1)}</div><b>${periodLbl(idx)}</b></div><button class="pbtn" data-per="1" aria-label="Next period" ${idx>=maxI?'disabled':''}>${I('chev')}</button></div>
 <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:10px"><b class="disp" style="font-size:26px">${inr(total)}</b><span class="muted">of ${inr(budget)} ${idx<0?'buffer':'daily-needs budget'}</span></div>
 <div class="prog" style="height:10px"><i style="width:${pct*100}%;${left<0?'background:var(--coral)':''}"></i></div>
 <div class="stats"><div class="stat"><small>${left<0?'Over by':'Left'}</small><b style="color:${left<0?'var(--coral)':'var(--violet)'}">${inr(Math.abs(left))}</b></div><div class="stat"><small>Items</small><b>${items.length}</b></div><div class="stat"><small>${dl>0&&left>0?'Safe / day':'Days left'}</small><b>${dl>0&&left>0?inr(left/dl):(idx===cur?dl:'–')}</b></div></div></div>
 <div class="card fade"><h3>${HI('plus')}Add spending</h3>
 <div class="amtbox"><span>₹</span><input id="spa" type="number" inputmode="decimal" placeholder="0" value="${spAmt}"></div>
 <div class="lbl2">Category</div><div class="cats">${CATS.map(c=>`<button class="cat ${spCat===c[0]?'on':''}" data-cat="${c[0]}" style="--c:${c[2]}"><span>${I(c[1])}</span>${c[0]}</button>`).join('')}</div>
 <div class="f" style="margin-top:10px"><label>Paid for<input id="spn" type="text" placeholder="e.g. Lunch, petrol, medicines" value="${esc(spNote)}"></label><div><div class="lab">Date</div><button class="datebtn" id="spdbtn" type="button">${I('cal')}<span>${fmtDate(spDate)}</span></button></div></div>
 <div class="lbl2">Paid by</div><div class="seg" style="display:flex">${MODES.map(m=>`<button style="flex:1" data-mode="${m}" class="${spMode===m?'on':''}">${m}</button>`).join('')}</div>
 ${spMode==='Credit card'?`<div class="warn">${I('alert')} Credit-card spending adds to your debt. Avoid it until you’re debt-free.</div>`:''}
 <button class="btn" id="spadd">${I('plus')} Add expense</button></div>
 ${cats.length?`<div class="card fade"><h3>${HI('pie')}By category</h3>${cats.map(([n,v])=>{const c=catOf(n);return `<div class="debt" style="padding:6px 0"><div class="h"><span><i style="background:${c[2]}"></i>${esc(n)}</span><span class="num">${inr(v)} <span class="muted">· ${Math.round(v/total*100)}%</span></span></div><div class="b"><i style="width:${v/cats[0][1]*100}%;background:${c[2]}"></i></div></div>`}).join('')}</div>`:''}
 <div class="card fade"><h3>${HI('cash')}Spending list</h3>${items.length?grp:`<div class="muted" style="padding:6px 2px">Nothing logged for this period yet. Add your first expense above.</div>`}</div>`}

function plan(P){
 return startBanner()+`<div class="card fade" style="margin-top:0"><h3>${HI('cal')}Month-by-month plan</h3><div class="muted">Salary (15th) pays EMIs and ${inr(S.living)} for you; the rest goes to cards by the 5th, then loan prepayments. Open a month for its steps.</div></div>`+
 P.rows.map((r,idx)=>{const pr=rowProg(r,P),full=pr.n&&pr.d===pr.n,it=splitItems(r,P),tot=it.reduce((s,x)=>s+x.v,0);
  const cl=[...P.order.filter(c=>r.ck[c.n]==='close').map(c=>c.n),...Object.keys(r.preClose||{}),...r.ems.filter(e=>e.last).map(e=>e.n)];
  return `<details class="month" ${S._open===r.key?'open':''} data-open="${r.key}"><summary>
  <div class="mh"><div class="mring ${full?'full':''}">${ring(pr.n?pr.d/pr.n:0,38,4,full?'#1E7A4C':'#1E7A4C','#E2E7DF')}<span>${full?'✓':pr.d+'/'+pr.n}</span></div>
  <div class="mt" style="flex:1;min-width:0">${r.kind==='cash'?'Right now · cash':r.title+' salary'}<small>${cl.length?I('party')+' '+(cl.length>2?cl.length+' debts cleared':esc(cl.join(', '))+' done'):'Pay by '+r.payDate+(r.target?' · target '+esc(r.target):'')}</small></div>
  <div class="ma">${inr(r.toDebt)}<small>${r.cardsLeft>0.5?'cards left '+kfmt(r.cardsLeft):(r.loansLeft>0.5?'loans left '+kfmt(r.loansLeft):'debt-free ✓')}</small></div></div>
  <div class="sbar">${it.map(x=>`<i title="${esc(x.n)} ${inr(x.v)}" style="flex:${x.v};background:${x.c}"></i>`).join('')}</div>
  <div class="cf"><span><small>Cash in</small><b>${kfmt(cashOf(r,P).in)}</b></span><span><small>Spent</small><b>${kfmt(cashOf(r,P).out)}</b></span><span><small>Left</small><b>${kfmt(cashOf(r,P).left)}</b></span></div></summary>
  <div class="body">${ledger(r,P)}${stepList(r,P)}<button class="btn ghost" data-all="${r.key}" style="margin:6px 4px 0;width:calc(100% - 8px)">${full?'Undo all for this month':'✓ Mark whole month done'}</button></div></details>`}).join('')}

function cashFlow(P){
 const rows=P.rows.map(r=>({r,c:cashOf(r,P)}));
 const tot=rows.reduce((a,x)=>a+x.c.out,0);
 return `<div class="card fade"><h3>${HI('cash')}Monthly cash flow</h3><div class="muted">Cash in hand each month and what you spend.</div>
 <div class="cft"><div class="cfr h"><span>Month</span><span>Cash in</span><span>Spent</span><span>Daily</span></div>
 ${rows.map(({r,c})=>{const d=c.parts.find(p=>p[0]==='Daily needs');const a=actualFor(r.key);return `<div class="cfr"><span>${r.kind==='cash'?'Now':r.title.replace(/ 20(\d\d)/,' ’$1')}</span><span>${kfmt(c.in)}</span><span><b>${kfmt(c.out)}</b></span><span>${d?(a!==undefined&&a!==''?'<b style="color:'+(+a<=d[1]?'var(--violet)':'var(--coral)')+'">'+kfmt(+a)+'</b>':kfmt(d[1])):'–'}</span></div>`}).join('')}
 <div class="cfr t"><span>Total</span><span></span><span>${inr(tot)}</span><span></span></div></div>
 <div class="muted" style="margin-top:6px">“Daily” shows your plan; once you enter your actual spending it turns green (under) or red (over).</div></div>`}

function progress(P){
 const {paid,total}=paidStats(P);let steps=0,done=0;P.rows.forEach(r=>{const p=rowProg(r,P);steps+=p.n;done+=p.d});
 return `<div class="card fade" style="margin-top:0"><h3>${HI('rocket')}Your progress</h3><div class="stats"><div class="stat"><small>Paid so far</small><b>${cmp(paid)}</b></div><div class="stat"><small>Still to pay</small><b>${cmp(total-paid)}</b></div><div class="stat"><small>Steps done</small><b>${done}/${steps}</b></div></div>
 <div class="prog" style="height:12px"><i style="width:${total?paid/total*100:0}%"></i></div></div>`+chartCard(P)+cashFlow(P)+debtList(P)+
 `<div class="card fade"><h3>${HI('bulb')}Ways to finish sooner</h3><div class="muted" style="line-height:1.6">
 • <b>Convert big card balances</b> (SBI, Axis) to a card EMI or one personal loan at ~14–18% instead of ~45–50% a year — could save ₹25–30K. Only if cards stay frozen.<br>
 • <b>Any bonus or freelance money</b> → target card the same day.<br>
 • <b>Never use a card</b> for emergencies — cut that month’s debt payment instead.</div></div>`}

function curYM(){const d=new Date();return d.getFullYear()+'-'+pad2(d.getMonth()+1)}
const ixSum=c=>(c.ix||[]).reduce((a,q)=>a+(+q.a||0),0);
function trackerCard(P){
 const cards=S.cards.filter(c=>(+c.b>0)||ixSum(c)>0),cardsOwed=S.cards.reduce((a,c)=>a+(+c.b||0),0),loansOwed=S.emis.reduce((a,e)=>a+(+e.a||0)*(+e.m||0),0),ixAll=S.cards.reduce((a,c)=>a+ixSum(c),0);
 const rows=cards.map(c=>`<div class="trow"><span>${esc(c.n)}</span><span>${inr(c.b)}</span><b>${inr(ixSum(c))}</b></div>`).join('');
 return `<div class="card fade"><h3>${HI('bars')}What I owe &amp; extra interest</h3><div class="trk"><div><small>Total owed now</small><b>${inr(cardsOwed+loansOwed)}</b></div><div><small>Extra interest charged</small><b class="neg">${inr(ixAll)}</b></div></div>
 <div class="muted">Cards ${inr(cardsOwed)} · EMIs &amp; loans ${inr(loansOwed)}. Every interest amount you add is saved to your account.</div>
 ${rows?'<div class="thead"><span>Card</span><span>Owes</span><span>Interest</span></div>'+rows:''}
 <div class="muted" style="margin-top:8px">Still to come on current plan: <b>${inr(P.interest)}</b> card interest.</div></div>`}
function emiCard(){
 const ym=curYM(),done=S.emiPaidFor===ym,pm=ym.split('-').map(Number),lbl=FM[pm[1]-1]+' '+pm[0];
 return '<div class="card fade"><h3>'+HI('check')+'This month’s EMIs</h3><div class="muted">'+(done?'You marked '+lbl+' EMIs as paid — every EMI’s “months left” is already reduced by 1.':'Already paid '+lbl+' EMIs? Tap once: every EMI’s “months left” goes down by 1 and the whole plan re-calculates from your cash in hand.')+'</div><button class="btn'+(done?' ghost':'')+'" data-emipaid="1" '+(done?'disabled':'')+'>'+(done?'✓ Marked paid for '+lbl:(emiArmed?'Tap again to confirm':'Mark '+lbl+' EMIs as paid'))+'</button></div>'}
function autoMin(b){return Math.max(500,Math.round((+b||0)*.05/100)*100)}
function debts(P){
 const c=S.cards.map((x,i)=>`<div class="drow"><div class="dh"><span class="sw" style="background:${CARDC[i%CARDC.length]}"></span><input type="text" data-c="${i}" data-k="n" value="${esc(x.n)}" placeholder="Card name"><button class="x" data-delc="${i}" aria-label="Remove">×</button></div><div class="dg two"><label>Balance (₹)<input type="number" inputmode="numeric" data-c="${i}" data-k="b" value="${x.b}"><small class="mhint">${inr(x.b)}</small></label><label>Interest % / month<input type="number" inputmode="decimal" step="0.1" data-c="${i}" data-k="r" value="${x.r}"></label></div>
  <div class="dg two"><label>Minimum due (₹)<input type="number" inputmode="numeric" data-c="${i}" data-k="mn" value="${+x.mn>0?x.mn:''}" placeholder="Auto ${autoMin(x.b)}"><small class="mhint">${+x.mn>0?inr(x.mn)+' · fixed':'Auto · 5% of balance'}</small></label><label>Interest charged so far<div class="ixtot">${inr(ixSum(x))}</div></label></div>
  <div class="ixadd"><input type="number" inputmode="decimal" id="ia${i}" placeholder="Extra interest charged (₹)" aria-label="Extra interest charged"><button class="btn sm" data-addint="${i}" type="button">+ Add</button></div>
  ${(x.ix||[]).length?'<div class="ixlist">'+(x.ix||[]).slice().reverse().slice(0,6).map(q=>`<div class="ixr"><span>${q.d||''}</span><b>+${inr(q.a)}</b><button class="x" data-delint="${i}:${q.id}" aria-label="Remove">×</button></div>`).join('')+((x.ix||[]).length>6?`<div class="muted" style="margin-top:4px">+ ${(x.ix||[]).length-6} older entries (counted in the total)</div>`:'')+'</div>':''}
  </div>`).join('');
 const e=S.emis.map((x,i)=>`<div class="drow"><div class="dh"><span class="sw" style="background:${colorOf(x.n)}"></span><input type="text" data-e="${i}" data-k="n" value="${esc(x.n)}" placeholder="Loan / EMI name"><button class="x" data-dele="${i}" aria-label="Remove">×</button></div><div class="dg"><label>EMI (₹)<input type="number" inputmode="numeric" data-e="${i}" data-k="a" value="${x.a}"><small class="mhint">${inr(x.a)}</small></label><label>Months left<input type="number" inputmode="numeric" data-e="${i}" data-k="m" value="${x.m}"></label><label class="tgl">Prepay early<span class="tg"><input type="checkbox" data-e="${i}" data-k="p" ${x.p?'checked':''}><i></i></span></label></div></div>`).join('');
 return `<div class="card fade" style="margin-top:0"><h3>${HI('cash')}Income & cash</h3><div class="f">
 <label>Monthly salary<input type="number" inputmode="numeric" data-s="salary" value="${S.salary}"><small class="mhint">${inr(S.salary)}</small></label>
 <label>Daily needs / month<input type="number" inputmode="numeric" data-s="living" value="${S.living}"><small class="mhint">${inr(S.living)}</small></label>
 <label>Extra income / month<input type="number" inputmode="numeric" data-s="extra" value="${S.extra}"><small class="mhint">${inr(S.extra)}</small></label>
 <div><div class="lab">Plan starts</div><button class="datebtn" id="startbtn" type="button">${I('cal')}<span>${monthLbl(S.start)}</span></button></div>
 <label>Cash in hand now<input type="number" inputmode="numeric" data-s="cash" value="${S.cash}"><small class="mhint">${inr(S.cash)}</small></label>
 <label>Keep as buffer<input type="number" inputmode="numeric" data-s="buffer" value="${S.buffer}"><small class="mhint">${inr(S.buffer)}</small></label></div></div>
 <div class="card fade"><h3>${HI('card')}Credit cards</h3>${c}<button class="btn ghost" id="addc">+ Add card</button>
 <label class="muted tgrow"><span class="tg"><input type="checkbox" id="gst" ${S.gst?'checked':''}><i></i></span><span>Add 18% GST on card interest</span></label></div>
 <div class="card fade"><h3>${HI('repeat')}EMIs & loans</h3>${e}<button class="btn ghost" id="adde">+ Add EMI</button>
 <div class="muted" style="margin-top:8px">Tick “Prepay” to close loans early after the cards (in list order). Check foreclosure charges.</div></div>
 ${trackerCard(P)}
 ${emiCard()}
 ${cloudCard()}
 <div class="card fade"><h3>${HI('refresh')}Updating each month</h3><div class="muted">Enter real statement balances and months left, set “Plan starts” to this month and cash to 0 — the plan recalculates.</div>
 <button class="btn danger" id="reset">${resetArmed?'Tap again to reset everything':'Reset to original numbers'}</button></div>
 <div class="card fade about"><img src="${LOGO_WORD}" alt="Rizq"><div class="muted">Pay off debt step by step.</div></div>`}

const NAVI={spend:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></svg>',home: '<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg>', plan: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/></svg>', prog: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V5M16 20v-7M22 20H2"/><path d="m14 7 3-3 3 3"/></svg>', debts: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><path d="M16 14.5h2.5"/></svg>'};
function startup(){
 try{const l=document.createElement('link');l.rel='icon';l.type='image/png';l.href=LOGO_FAV;document.head.appendChild(l)}catch(e){}}
function showSplash(){
 try{if(sessionStorage.getItem('rizq_splash'))return;sessionStorage.setItem('rizq_splash','1')}catch(e){return}
 const d=document.createElement('div');d.id='splash';d.innerHTML='<img src="'+LOGO_WORD+'" alt="Rizq"><span>Pay off debt, step by step</span>';
 d.addEventListener('click',()=>{d.classList.add('out');setTimeout(()=>d.remove(),400)});document.body.appendChild(d);
 setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),500)},1400)}
const parseDue=str=>{const p=str.split(' ');return new Date(+p[2],MN.indexOf(p[1]),+p[0])};
function notes(P){
 const out=[];const now=new Date();now.setHours(0,0,0,0);
 const r=P.rows.find(r=>{const p=rowProg(r,P);return p.d<p.n});
 if(r){const due=parseDue(r.payDate),dd=Math.round((due-now)/864e5);
  const when=dd<0?'overdue by '+(-dd)+' day'+(dd<-1?'s':''):dd===0?'due today':'due in '+dd+' day'+(dd>1?'s':'');
  const cardAmt=P.order.reduce((a,c)=>a+(r.pays[c.n]||0),0);
  if(cardAmt>0)out.push({ic:'card',t:'Pay '+inr(cardAmt)+' to your cards',d:r.payDate+' · '+when,hot:dd<=7});
  const left=rowProg(r,P);out.push({ic:'check',t:(left.n-left.d)+' step'+(left.n-left.d>1?'s':'')+' left for '+(r.kind==='cash'?'now':r.title),d:'Tick them in the Plan tab',hot:false});
  if(r.ems.length)out.push({ic:'repeat',t:r.ems.length+' EMI'+(r.ems.length>1?'s':'')+' auto-debit on '+dLbl(15,r.sm),d:inr(r.emi)+' · keep balance ready',hot:false})}
 const cur=periodIdxOf(todayStr()),items=itemsIn(cur),tot=items.reduce((a,x)=>a+(+x.a||0),0),bud=cur<0?+S.buffer:+S.living;
 if(tot>bud)out.unshift({ic:'alert',t:'Over budget by '+inr(tot-bud),d:'Daily spending '+inr(tot)+' of '+inr(bud),hot:true});
 else if(items.length&&tot>bud*0.8)out.push({ic:'alert',t:'80% of daily budget used',d:inr(bud-tot)+' left this period',hot:true});
 const cc=items.filter(x=>x.m==='Credit card').length;
 if(cc)out.push({ic:'alert',t:cc+' credit-card expense'+(cc>1?'s':'')+' logged',d:'This adds to your debt',hot:true});
 return out}
function bellHtml(P){
 const n=notes(P),hot=n.filter(x=>x.hot).length;
 return `<div class="notifw"><button class="bell ${notifOpen?'on':''}" id="bell" aria-label="Notifications">${I('bell')}${hot?`<i class="ndot">${hot}</i>`:''}</button></div>`}
function notifLayer(P){
 if(!notifOpen)return '';
 const n=notes(P);
 return `<div class="nbk"></div><div class="notif fade"><div class="nh">Notifications</div>${n.length?n.map(x=>`<div class="ni ${x.hot?'hot':''}"><span class="nic">${I(x.ic)}</span><span class="tx"><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span></div>`).join(''):'<div class="muted" style="padding:6px 4px">All clear — nothing needs attention.</div>'}<div class="nf">${I('refresh')}<span id="saved">${esc(savedTxt||cloudMsg())}</span></div></div>`}
const UNAME=/^[a-z0-9._]{3,20}$/;
function authLoading(){return '<div class="auth"><div class="authbox"><img class="authlogo pulse" src="'+LOGO_WORD+'" alt="Rizq"></div></div>'}
function authScreen(){
 const su=authMode==='signup';
 return `<div class="auth"><div class="authbox fade">
  <img class="authlogo" src="${LOGO_WORD}" alt="Rizq">
  <h1>${su?'Create your account':'Welcome back'}</h1>
  <p class="authsub">${su?'Pick a username and a password. That’s all.':'Log in to see your plan on any device.'}</p>
  <div class="authtabs"><button data-auth="login" class="${!su?'on':''}">Log in</button><button data-auth="signup" class="${su?'on':''}">Sign up</button></div>
  <div class="afield"><span class="aic">${I('user')}</span><input id="au" type="text" autocapitalize="none" autocorrect="off" autocomplete="username" spellcheck="false" placeholder="Username" value="${esc(authU)}"></div>
  <div class="afield"><span class="aic">${I('lock')}</span><input id="ap" type="${authEye?'text':'password'}" autocomplete="${su?'new-password':'current-password'}" placeholder="Password" value="${esc(authP)}"><button type="button" class="aeye" data-auth="eye" aria-label="Show or hide password">${I(authEye?'eyeoff':'eye')}</button></div>
  ${su?'<div class="ahint">3–20 letters, numbers, dot or underscore · password 6+ characters</div>':''}
  ${(cloudOff||!cloud)?`<div class="autherr">${I('alert')} <span>Login isn’t available — Firebase isn’t set up for this site. Add your keys in .env.local (or Vercel environment variables).</span></div>`:(authErr?`<div class="autherr">${I('alert')} <span>${esc(authErr)}</span></div>`:'')}
  <button class="btn authgo" id="authgo" ${(authBusy||cloudOff||!cloud)?'disabled':''}>${authBusy?'Please wait…':(su?'Create account':'Log in')}</button>
  <div class="authfoot">${su?'No email needed, so there’s no password reset. Keep your password safe.':'Your data is private to your account.'}</div>
 </div></div>`}
async function doAuth(){
 if(!cloud)return;
 const eu=document.getElementById('au'),ep=document.getElementById('ap');
 if(eu)authU=eu.value;if(ep)authP=ep.value;
 const u=authU.trim().toLowerCase(),p=authP;authErr='';
 if(!UNAME.test(u)){authErr='Username must be 3–20 letters, numbers, dot or underscore.';render();return}
 if(p.length<6){authErr='Password must be at least 6 characters.';render();return}
 authBusy=true;render();
 const r=authMode==='signup'?await cloud.signUp(u,p):await cloud.logIn(u,p);
 authBusy=false;
 if(r&&r.error){authErr=r.error;render();return}
 authP='';authErr='';
}
function navHost(){let h=document.getElementById('navhost');if(!h){h=document.createElement('div');h.id='navhost';document.body.appendChild(h)}return h}
function render(){
 if(!cloudUser){const rt=document.getElementById('root');if(!cloudOff&&!authReady){rt.innerHTML=authLoading()}else{rt.innerHTML=authScreen()}return}
 if(uniqNames())persist();const P=simulate(S);if(migrate(P))persist();const scr=document.getElementById('root'),sy=scr.scrollTop;
 const body=tab==='home'?home(P):tab==='plan'?plan(P):tab==='spend'?spendTab(P):tab==='prog'?progress(P):debts(P);
 document.getElementById('root').innerHTML=`<div class="wrap"><div class="top"><div class="brand"><img class="bw" src="${LOGO_WORD}" alt="Rizq"></div>${bellHtml(P)}</div>${body}</div>`;
 navHost().innerHTML=`<nav class="nav"><div>${[['home','Home'],['plan','Plan'],['spend','Spend'],['prog','Progress'],['debts','Debts']].map(t=>`<button data-tab="${t[0]}" class="${tab===t[0]?'on':''}">${NAVI[t[0]]}${t[1]}</button>`).join('')}</div></nav>${notifLayer(P)}`;
 scr.scrollTop=sy;
 if(window.matchMedia&&matchMedia('(pointer:coarse)').matches&&innerWidth<=780)document.querySelectorAll('#root input[type=number]').forEach(i=>{i.setAttribute('data-num','1');i.setAttribute('inputmode','none');i.type='text';i.removeAttribute('step')});
 document.querySelectorAll('#root input:not([type=range]):not([type=checkbox])').forEach(i=>{i.setAttribute('autocomplete','off');i.setAttribute('autocorrect','off');if(!i.hasAttribute('enterkeyhint'))i.setAttribute('enterkeyhint','done');if(!i.getAttribute('aria-label')&&!i.closest('label'))i.setAttribute('aria-label',i.getAttribute('placeholder')||i.name||'field')});
 document.querySelectorAll('.nav').forEach(n=>n.setAttribute('aria-label','Main navigation'));
 {const rt2=document.getElementById('root');if(animNext){rt2.classList.remove('tabin');void rt2.offsetWidth;rt2.classList.add('tabin')}else rt2.classList.remove('tabin');animNext=false}
 if(firstPaint){firstPaint=false;document.querySelectorAll('[data-count]').forEach(el=>{const to=+el.dataset.count;let t0=null;const f=t=>{t0=t0||t;const k=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)})}
 justTicked=null;bindChart();
}
let renderLater=false;
function typing(){const a=document.activeElement;return !!(a&&a.matches&&a.matches('#root input:not([type=range]):not([type=checkbox]):not([type=button]):not([type=submit]),#root textarea,#root select'))}
function renderSafe(){if(typing()){renderLater=true;return}render()}
function bindChart(){const ch=document.getElementById('chart');if(!ch)return;const svg=ch.querySelector('svg');
 const pick=ev=>{const b=svg.getBoundingClientRect(),x=(ev.touches?ev.touches[0].clientX:ev.clientX)-b.left,W=+svg.dataset.w,pad=+svg.dataset.pad,n=+svg.dataset.n;
  const i=Math.round(((x/b.width*W)-pad)/(W-pad*2)*(n-1));const ni=Math.max(0,Math.min(n-1,i));if(ni!==chartIdx){chartIdx=ni;render()}};
 svg.addEventListener('pointermove',pick);svg.addEventListener('pointerdown',pick);svg.addEventListener('touchmove',pick,{passive:true})}

function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}
function confetti(){const cv=document.getElementById('confetti'),ctx=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;
 const cols=['#1E7A4C','#C9F06B','#FFB020','#C8443A','#2B8FC4','#0F2A1D'];const ps=Array.from({length:120},()=>({x:innerWidth/2+(Math.random()-.5)*120,y:innerHeight*.45,vx:(Math.random()-.5)*12,vy:-Math.random()*13-4,s:Math.random()*7+4,c:cols[Math.random()*6|0],r:Math.random()*6,vr:(Math.random()-.5)*.4}));
 let f=0;(function loop(){ctx.clearRect(0,0,cv.width,cv.height);ps.forEach(p=>{p.vy+=.35;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/3,p.s,p.s*.6);ctx.restore()});if(++f<110)requestAnimationFrame(loop);else ctx.clearRect(0,0,cv.width,cv.height)})()}

document.addEventListener('click',e=>{
 if(e.target.closest('#spdbtn')){openDatePicker();return}
 if(e.target.closest('#startbtn')){openDatePicker({month:true});return}
 if(e.target.closest('#bell')){notifOpen=!notifOpen;render();return}
 if(notifOpen&&!e.target.closest('.notif')){notifOpen=false;render()}
 try{if(e.target.closest('[data-tab],[data-step],[data-cat],[data-mode],#bell,.btn'))navigator.vibrate&&navigator.vibrate(8)}catch(_){}
 const t=e.target.closest('[data-addint],[data-delint],[data-emipaid],[data-fixstart],[data-auth],#authgo,[data-cloud],[data-cat],[data-mode],[data-delsp],[data-per],#spadd,[data-tab],[data-step],[data-all],[data-strat],[data-hot],[data-delc],[data-dele],#addc,#adde,#reset');
 if(!t){if(hot!=null&&!e.target.closest('.donut')){hot=null;render()}return}
 if(t.dataset.addint){const i=+t.dataset.addint,inp=document.getElementById('ia'+i),a=Math.round((+(inp&&inp.value)||0)*100)/100,c=S.cards[i];if(!c)return;if(!(a>0)){toast('Enter the interest amount first');return}c.ix=c.ix||[];c.ix.push({id:Date.now(),d:todayStr(),a});c.b=(+c.b||0)+a;persist();render();toast('Added '+inr(a)+' interest to '+c.n);return}
 if(t.dataset.delint){const [i,id]=t.dataset.delint.split(':'),c=S.cards[+i];if(!c)return;const q=(c.ix||[]).find(z=>String(z.id)===id);if(!q)return;c.ix=c.ix.filter(z=>z!==q);c.b=Math.max(0,(+c.b||0)-q.a);persist();render();toast('Removed '+inr(q.a)+' interest entry');return}
 if(t.dataset.emipaid){const ym=curYM();if(S.emiPaidFor===ym)return;if(!emiArmed){emiArmed=true;render();setTimeout(()=>{if(emiArmed){emiArmed=false;render()}},4000);return}emiArmed=false;S.emis.forEach(x=>{x.m=Math.max(0,(+x.m||0)-1)});S.emiPaidFor=ym;persist();render();toast('Done — every EMI now has 1 month less left');return}
 if(t.dataset.fixstart){const c=startCheck();S.start=c.y+'-'+pad2(c.m+1);persist();render();toast('Plan now starts '+FM[c.m]+' '+c.y);return}
 if(t.dataset.auth){const a=t.dataset.auth;if(a==='eye'){const eu=document.getElementById('au'),ep=document.getElementById('ap');if(eu)authU=eu.value;if(ep)authP=ep.value;authEye=!authEye;render()}else{const eu=document.getElementById('au');if(eu)authU=eu.value;authMode=a;authErr='';render()}return}
 if(t.id==='authgo'){doAuth();return}
 if(t.dataset.cloud){if(cloud){const a=t.dataset.cloud;if(a==='signin')cloud.signIn();else if(a==='push'){S.updated=Date.now();try{localStorage.setItem('debtplan',JSON.stringify(S))}catch(e){}setSaved('Uploading…');pushNow().then(()=>toast('All data uploaded to the cloud'))}else{S=JSON.parse(JSON.stringify(DEFAULT));try{localStorage.removeItem('debtplan')}catch(e){}tab='home';spIdx=null;notifOpen=false;authMode='login';authErr='';authU='';authP='';authEye=false;cloud.signOut()}}return}
 if(t.dataset.cat){spCat=t.dataset.cat;render();return}
 if(t.dataset.mode){spMode=t.dataset.mode;render();return}
 if(t.dataset.delsp){S.spend=S.spend.filter(x=>String(x.id)!==t.dataset.delsp);persist();render();return}
 if(t.dataset.per){const P=simulate(S),cur=periodIdxOf(todayStr());spIdx=(spIdx==null?cur:spIdx)+(+t.dataset.per);render();return}
 if(t.id==='spadd'){const a=+spAmt;if(!(a>0)){toast('Enter an amount first');return}S.spend.push({id:Date.now(),d:spDate||todayStr(),a,c:spCat,n:spNote.trim(),m:spMode});spAmt='';spNote='';spIdx=periodIdxOf(spDate||todayStr());persist();render();toast('Added '+inr(a)+' · '+spCat);return}
 if(t.dataset.tab){animNext=true;tab=t.dataset.tab;resetArmed=false;hot=null;chartIdx=null;render();document.getElementById('root').scrollTop=0;return}
 if(t.dataset.step){e.preventDefault();const k=t.dataset.step;if(S.ticks[k])delete S.ticks[k];else{S.ticks[k]=1;justTicked=k;
   if(/\|(card|pre):/.test(k)&&t.querySelector('.c-close')){confetti();toast(t.querySelector('.tt').textContent.replace(/Pay |Part-prepay |Closes.*$/g,'').trim()+' is cleared!')}
   else if(/\|emi:/.test(k)&&t.querySelector('.c-last')){toast('Last EMI done — one less bill!')}}
  persist();const P=simulate(S);const rk=k.split('|')[0],r=P.rows.find(x=>x.key===rk);if(r){const p=rowProg(r,P);if(p.n&&p.d===p.n&&S.ticks[k]){confetti();toast((r.kind==='cash'?'First payments':r.title)+' complete!')}}
  render();return}
 if(t.dataset.all){const P=simulate(S),r=P.rows.find(x=>x.key===t.dataset.all);const st=stepsFor(r,P).filter(s=>!s.info);const full=st.every(s=>tk(r,s));st.forEach(s=>{const k=r.key+'|'+s.id;if(full)delete S.ticks[k];else S.ticks[k]=1});if(!full){confetti();toast((r.kind==='cash'?'First payments':r.title)+' complete!')}persist();render();return}
 if(t.dataset.strat){S.strategy=t.dataset.strat;persist();render();return}
 if(t.dataset.hot!=null){const i=+t.dataset.hot;hot=hot===i?null:i;render();return}
 if(t.dataset.delc){S.cards.splice(+t.dataset.delc,1);persist();render();return}
 if(t.dataset.dele){S.emis.splice(+t.dataset.dele,1);persist();render();return}
 if(t.id==='addc'){S.cards.push({n:'New card',b:0,r:3.6});uniqNames();persist();render();return}
 if(t.id==='adde'){S.emis.push({n:'New EMI',a:0,m:1,p:false});uniqNames();persist();render();return}
 if(t.id==='reset'){if(!resetArmed){resetArmed=true;render();return}S=JSON.parse(JSON.stringify(DEFAULT));resetArmed=false;persist();render()}
});
document.addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.open){if(d.open)S._open=d.dataset.open;else if(S._open===d.dataset.open)S._open=null}},true);
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&(e.target.id==='au'||e.target.id==='ap')){e.preventDefault();doAuth()}});
document.addEventListener('input',e=>{const t=e.target;
 if(t.id==='au'){authU=t.value;return}if(t.id==='ap'){authP=t.value;return}
 if(t.id==='spa'){spAmt=t.value;return}if(t.id==='spn'){spNote=t.value;return}if(t.id==='spd'){spDate=t.value||todayStr();return}
 if(t.id==='living'){const v=+t.value;t.style.setProperty('--p',((v-8000)/(27000)*100)+'%');const a=document.getElementById('livv'),b=document.getElementById('livd');if(a)a.textContent=inr(v);if(b){const P=simulate({...S,living:v});b.textContent='≈ '+inr(v/30)+'/day · free '+P.freeDate.replace(/^\d+ /,'')}}});
document.addEventListener('change',e=>{
 const t=e.target,d=t.dataset;
 const num=v=>Math.max(0,+v||0);
 if(d.s){S[d.s]=d.s==='start'?(t.value||S.start):num(t.value)}
 else if(d.c!==undefined){const x=S.cards[+d.c];x[d.k]=d.k==='n'?t.value:d.k==='r'?Math.min(100,num(t.value)):num(t.value);if(d.k==='n')uniqNames()}
 else if(d.e!==undefined){const x=S.emis[+d.e];x[d.k]=d.k==='p'?t.checked:d.k==='n'?t.value:d.k==='m'?Math.round(num(t.value)):num(t.value);if(d.k==='n')uniqNames()}
 else if(d.actual){if(t.value==='')delete S.actual[d.actual];else S.actual[d.actual]=+t.value}
 else if(t.id==='gst'){S.gst=t.checked}
 else if(t.id==='living'){S.living=+t.value}
 else return;
 persist();render();
});

// ---- In-app number pad for amount fields (touch devices): no system keyboard, so no iOS prev/next/done bar ----
(function numberPad(){
 const coarse=()=>window.matchMedia&&matchMedia('(pointer:coarse)').matches&&innerWidth<=780;
 const root=document.documentElement;let pad=null,cur=null,fresh=false;
 const KEYS=['1','2','3','4','5','6','7','8','9','.','0','del'];
 const BS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="M17 9.5l-5 5M12 9.5l5 5"/></svg>';
 function build(){if(pad)return pad;pad=document.createElement('div');pad.id='kpad';pad.setAttribute('aria-label','Number pad');
  pad.innerHTML='<div class="kh"><b id="kpl"></b><button class="kd" type="button" data-k="done">Done</button></div><div class="kg">'+KEYS.map(k=>'<button type="button" data-k="'+k+'"'+(k==='del'?' class="kx" aria-label="Delete"':'')+'>'+(k==='del'?BS:k)+'</button>').join('')+'</div>';
  document.body.appendChild(pad);
  // pointerdown + preventDefault keeps the field focused (no blur flicker)
  pad.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();press(b.dataset.k)});
  ['mousedown','touchstart'].forEach(n=>pad.addEventListener(n,e=>{if(e.target.closest('button'))e.preventDefault()},{passive:false}));
  pad.addEventListener('contextmenu',e=>e.preventDefault());return pad}
 function label(el){const l=el.closest('label'),t=(l&&l.childNodes[0]&&l.childNodes[0].textContent||'').trim();if(el.id==='spa')return 'Amount spent';const a=el.getAttribute('aria-label');return t||(a&&isNaN(+a)?a:'Amount')}
 function setVal(v){if(!cur)return;cur.value=v;cur.dispatchEvent(new Event('input',{bubbles:true}))}
 function press(k){if(k==='done'){cur&&cur.blur();return}if(!cur)return;let v=fresh?'':String(cur.value||'');
  if(k==='del'){v=fresh?'':v.slice(0,-1)}
  else if(k==='.'){if(v.includes('.'))return;v=(v===''?'0':v)+'.'}
  else{if(v==='0')v='';if(v.replace('.','').length>11)return;if(v.includes('.')&&v.split('.')[1].length>=2)return;v+=k}
  fresh=false;setVal(v);try{navigator.vibrate&&navigator.vibrate(4)}catch(_){}}
 function open(el){cur=el;fresh=true;build();document.getElementById('kpl').textContent=label(el);root.classList.add('kp');pad.classList.add('on');
  const h=pad.offsetHeight;root.style.setProperty('--kph',h+'px');
  [60,260].forEach(ms=>setTimeout(()=>{if(cur!==el)return;const sc=document.getElementById('root');if(!sc)return;const r=el.getBoundingClientRect(),vh=innerHeight-(pad.offsetHeight||0);if(r.top<90||r.bottom>vh-12)sc.scrollTo({top:sc.scrollTop+(r.top+r.bottom)/2-vh/2+30,behavior:'smooth'})},ms))}
 function close(){cur=null;if(!pad)return;pad.classList.remove('on');root.classList.remove('kp');root.style.removeProperty('--kph')}
 document.addEventListener('focusin',e=>{const t=e.target;if(t&&t.matches&&t.matches('input[data-num]')&&coarse())open(t);else if(cur&&!(t&&t.closest&&t.closest('#kpad')))close()});
 document.addEventListener('focusout',e=>{const t=e.target;if(t!==cur)return;const el=cur;setTimeout(()=>{if(document.activeElement&&document.activeElement.matches&&document.activeElement.matches('input[data-num]'))return;close()},60);
  // commit exactly like a native 'change' (keypad edits are programmatic, so the browser doesn't fire it)
  if(el.dataset.dirty){delete el.dataset.dirty;el.dispatchEvent(new Event('change',{bubbles:true}))}});
 document.addEventListener('input',e=>{const t=e.target;if(t&&t===cur)t.dataset.dirty='1'},true);
 window.addEventListener('resize',()=>{if(cur&&pad)root.style.setProperty('--kph',pad.offsetHeight+'px')});
})();
// ---- Keyboard handling (iOS shifts fixed/sticky bars when the keyboard opens) ----
(function keyboardGuard(){
 const root=document.documentElement;let t,lastW=innerWidth,dog=null;
 const isField=e=>!!(e&&e.matches&&e.matches('input:not([type=range]):not([type=checkbox]):not([type=button]):not([type=submit]),textarea,select'));
 const vv=window.visualViewport;
 const kbOn=()=>root.classList.contains('kb');
 // while a keyboard is up the shell tracks the visible area; otherwise it simply fills the screen (no stale sizes -> no blank bar)
 const sync=()=>{const zoomed=vv&&vv.scale>1.02;
  if(kbOn()&&vv&&!zoomed){root.style.setProperty('--vvh',Math.round(vv.height)+'px');root.style.setProperty('--vvt',Math.round(vv.offsetTop)+'px')}
  else{root.style.removeProperty('--vvh');root.style.removeProperty('--vvt')}
  if(window.scrollX||window.scrollY)window.scrollTo(0,0)};
 const set=on=>{if(on===kbOn()){sync();return}root.classList.toggle('kb',on);sync();if(on)watch()};
 // safety net: if the keyboard class is on but no field is focused (iOS sometimes skips events), restore the normal layout
 const watch=()=>{if(dog)return;dog=setInterval(()=>{if(!kbOn()){clearInterval(dog);dog=null;return}if(!isField(document.activeElement)){set(false);if(renderLater){renderLater=false;render()}}},350)};
 const reveal=el=>{try{const sc=document.getElementById('root');if(!sc||!el||!sc.contains(el))return;const r=el.getBoundingClientRect(),vh=(vv?vv.height:innerHeight);
  if(r.top<80||r.bottom>vh-16){sc.scrollTo({top:sc.scrollTop+(r.top+r.bottom)/2-vh/2+20,behavior:'smooth'})}}catch(_){}};
 const release=()=>{clearTimeout(t);t=setTimeout(()=>{if(!isField(document.activeElement)){set(false);if(renderLater){renderLater=false;render()}}},120);[400,900,1600].forEach(ms=>setTimeout(()=>{if(!isField(document.activeElement))set(false)},ms))};
 sync();
 if(vv){vv.addEventListener('resize',()=>{if(isField(document.activeElement)&&innerWidth<=780)set(true);else sync();if(isField(document.activeElement))setTimeout(()=>reveal(document.activeElement),60);if(!isField(document.activeElement)&&kbOn())release()});vv.addEventListener('scroll',sync)}
 window.addEventListener('scroll',()=>{if(window.scrollX||window.scrollY)window.scrollTo(0,0)},{passive:true});
 document.addEventListener('focusin',e=>{if(!isField(e.target)||innerWidth>780)return;clearTimeout(t);set(true);[120,350,600].forEach(ms=>setTimeout(()=>{sync();if(document.activeElement===e.target)reveal(e.target)},ms))});
 document.addEventListener('focusout',e=>{if(!isField(e.target))return;release()});
 document.addEventListener('pointerdown',e=>{if(kbOn()&&!isField(e.target)&&!isField(document.activeElement))release()},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)release()});window.addEventListener('pageshow',release);
 // only rebuild the screen when the *width* changes (rotation / desktop resize) and never while typing
 window.addEventListener('resize',()=>{sync();clearTimeout(rzT);rzT=setTimeout(()=>{if(innerWidth===lastW)return;lastW=innerWidth;if(cloudUser||cloudOff)renderSafe()},200)});
 window.addEventListener('orientationchange',()=>setTimeout(()=>{set(false)},250));
})();
render();
startup();

}
