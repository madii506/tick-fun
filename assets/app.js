(function(){
'use strict';
// CA and X are filled in the moment $TICK exists; until then the page says it doesn't.
const CFG={ca:'',x:'',launchSol:0.03,engine:false,split:50};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isMint=s=>/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test((s||'').trim());
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function usd(v){if(v==null||!isFinite(v))return '—';const a=Math.abs(v);if(a>=1e9)return '$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return '$'+(v/1e6).toFixed(a>=1e7?1:2)+'M';if(a>=1e3)return '$'+(v/1e3).toFixed(a>=1e4?1:2)+'K';return '$'+v.toFixed(0)}
const say=t=>{$('#live').textContent=t};
const DS='https://api.dexscreener.com';
async function getj(u,ms=9000){const r=await fetch(u,{signal:AbortSignal.timeout(ms)});if(!r.ok)throw new Error(r.status);return r.json()}

/* ---------- sprites ---------- */
const MC={l:'#2f161b',o:'#120709',h:'#3a1b21',e:'#fff4ea',r:'#d3263d',d:'#9b172d',L:'#ff5a6e',w:'#ffd9de'};
const MA=[".l...........l.","..l...ooo...l..","ll.l.ohhho.l.ll","..lloheheholl..","lllohhhhhhholll","..orrhhhhhrro..",".loLrrrrrrrrol.","l.oLwrrrrrrdo.l","..oLrrrrrrddo..",".lorrrrrrdddol.","...orrrrddddo..","....orddddo....",".....ooooo....."];
const MB=["l.............l",".l....ooo....l.","..ll.ohhho.ll..","l.lloheheholl.l",".llohhhhhhholl.","l.orrhhhhhrro.l","..oLrrrrrrrro..",".loLwrrrrrrdol.","l.oLrrrrrrddo.l","..orrrrrrdddo..","...orrrrddddo..","....orddddo....",".....ooooo....."];
function sprite(map){const c=document.createElement('canvas');c.width=15;c.height=13;const g=c.getContext('2d');map.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='.'){g.fillStyle=MC[ch];g.fillRect(x,y,1,1)}}));return c}
const SA=sprite(MA),SB=sprite(MB);
const tick=new Image();tick.src='/assets/tick.png';
const PAL=[['#ffe7a3','#f2b134','#9a6418'],['#e3ebf3','#a9b6c4','#5c6876'],['#9dfbc4','#4fcf8c','#20784a'],['#cdb6ff','#9a72ff','#5532b5'],['#ffc08f','#ff8a3d','#a3471a']];
function coin(g,cx,cy,R,p){for(let y=-R;y<=R;y++)for(let x=-R;x<=R;x++){const d=Math.hypot(x+.5,y+.5);if(d>R)continue;let c=p[1];if(d>R-1.2)c=p[2];else if(d>R-2.2)c=p[0];else if(-x-y>R*.5)c=p[0];else if(x+y>R*.6)c=p[2];g.fillStyle=c;g.fillRect(cx+x,cy+y,1,1)}}

/* ---------- loader: the tick, a bar, no words ---------- */
(function(){const t0=performance.now(),span=RM?200:1300,bar=$('#loadbar');let done=false;
 const fin=()=>{if(done)return;done=true;$('#load').classList.add('gone');document.documentElement.classList.remove('loading');setTimeout(()=>$('#load').remove(),500)};
 (function f(){const k=Math.min(1,(performance.now()-t0)/span);bar.style.width=(k*100)+'%';if(k<1&&!done)requestAnimationFrame(f);else setTimeout(fin,120)})();
 setTimeout(fin,span+1000)})();

/* ---------- the living background: coins drifting, ticks crawling to them and drinking ---------- */
(function(){const cv=$('#bg'),g=cv.getContext('2d');let W,H,coins=[],ticks=[],specks=[],drips=[],on=true,f=0;
 function size(){W=Math.ceil(innerWidth/3);H=Math.ceil(innerHeight/3);cv.width=W;cv.height=H;
  coins=Array.from({length:Math.max(4,Math.round(W/70))},(_,i)=>({x:Math.random()*W,y:Math.random()*H,r:4+Math.random()*4|0,p:PAL[i%PAL.length],vx:(Math.random()-.5)*.08,vy:-(.03+Math.random()*.08),ph:Math.random()*6}));
  ticks=[];
  specks=Array.from({length:Math.round(W*H/900)},()=>({x:Math.random()*W|0,y:Math.random()*H|0,k:Math.random()}))}
 size();addEventListener('resize',size);document.addEventListener('visibilitychange',()=>{on=!document.hidden});
 function step(){f++;g.clearRect(0,0,W,H);
  for(const s of specks){if(Math.random()<.02)s.k=Math.random();g.fillStyle=s.k>.93?'rgba(244,230,218,.55)':s.k>.7?'rgba(255,77,99,.22)':'rgba(255,77,99,.07)';g.fillRect(s.x,s.y,1,1)}
  for(const c of coins){c.x+=c.vx+Math.sin(f/90+c.ph)*.05;c.y+=c.vy;if(c.y<-12){c.y=H+12;c.x=Math.random()*W}if(c.x<-12)c.x=W+12;if(c.x>W+12)c.x=-12;coin(g,Math.round(c.x),Math.round(c.y),c.r,c.p)}
  for(const t of ticks){
   if(t.st==='seek'){if(!t.c||Math.random()<.002)t.c=coins[Math.random()*coins.length|0];const dx=t.c.x-t.x,dy=t.c.y-t.c.r-3-t.y,d=Math.hypot(dx,dy);if(d<2){t.st='latch';t.t=120+Math.random()*260;t.a=-Math.PI/2+(Math.random()-.5)*1.6}else{t.x+=dx/d*t.s;t.y+=dy/d*t.s}}
   else if(t.st==='latch'){t.x=t.c.x+Math.cos(t.a)*(t.c.r+2);t.y=t.c.y+Math.sin(t.a)*(t.c.r+2)-4;if(f%22===0)drips.push({x:t.x+7,y:t.y+12,l:40});if(--t.t<=0){t.st='seek';t.c=coins[Math.random()*coins.length|0]}}
   const fr=(t.st==='seek'&&(f>>3)%2)?SB:SA;g.drawImage(fr,Math.round(t.x),Math.round(t.y))}
  for(let i=drips.length-1;i>=0;i--){const d=drips[i];d.y+=.35;d.l--;g.fillStyle=`rgba(224,40,63,${d.l/40})`;g.fillRect(Math.round(d.x),Math.round(d.y),1,2);if(d.l<=0)drips.splice(i,1)}}
 if(RM){step();return}
 let last=0;(function loop(ts){requestAnimationFrame(loop);if(!on||ts-last<42)return;last=ts;step()})(0)})();

/* ---------- hero: the wordmark, its i dotted by a live tick ---------- */
const G={T:["########","########","...##...","...##...","...##...","...##...","...##...","...##...","...##..."],I:["..","..","..","##","##","##","##","##","##"],
C:["..#####",".######","##.....","##.....","##.....","##.....","##.....",".######","..#####"],K:["##...##","##..##.","##.##..","####...","###....","####...","##.##..","##..##.","##...##"]};
(function(){const cv=$('#word'),g=cv.getContext('2d');const c=6,x0=7,y0=32;const face=new Set(),pos={};let xx=x0;
 for(const L of 'TICK'){pos[L]=xx;G[L].forEach((row,r)=>[...row].forEach((ch,k)=>{if(ch==='#')for(let a=0;a<c;a++)for(let b=0;b<c;b++)face.add((xx+k*c+a)+','+(y0+r*c+b))}));xx+=(G[L][0].length+2)*c}
 const has=(x,y)=>face.has(x+','+y);const body=new Set(face);for(const k of face){const[x,y]=k.split(',').map(Number);for(const o of[1,2,3])body.add((x+o)+','+(y+o))}
 function base(){g.clearRect(0,0,cv.width,cv.height);g.fillStyle='#0b0405';for(const k of body){const[x,y]=k.split(',').map(Number);g.fillRect(x-1,y-1,3,3)}
  [[3,'#3d0a13'],[2,'#5e0f1d'],[1,'#861528']].forEach(([o,col])=>{g.fillStyle=col;for(const k of face){const[x,y]=k.split(',').map(Number);if(!has(x+o,y+o))g.fillRect(x+o,y+o,1,1)}});
  for(const k of face){const[x,y]=k.split(',').map(Number);g.fillStyle=!has(x,y-1)?'#fffbf5':!has(x,y+1)?'#d8c3b3':!has(x-1,y)?'#fbefe4':'#f4e6da';g.fillRect(x,y,1,1)}}
 const stem=pos.I+c;let n=0;
 function draw(){base();const bob=(n>>1)%2,blink=n%17===0;g.drawImage(tick,stem-22,y0+3*c-46+4-bob);if(blink){g.fillStyle='#3a1b21';g.fillRect(stem-22+17,y0+3*c-46+4-bob+12,10,3)}n++}
 function fit(){const k=Math.max(1,Math.floor(Math.min(innerWidth*.82,600)/200*2)/2);cv.style.width=200*k+'px';cv.style.height=96*k+'px'}
 cv.height=96;fit();addEventListener('resize',fit);
 const go=()=>{draw();if(!RM)setInterval(()=>{if(!document.hidden)draw()},260)};tick.complete?go():tick.onload=go;
 cv.addEventListener('click',()=>{$('#hosts').scrollIntoView()})})();

/* ---------- hosts: live from Dexscreener, pump.fun coins only ---------- */
const H={list:[],mode:'top',shown:12,byMint:{}};
function pickPair(pairs,mint){const own=(pairs||[]).filter(p=>p.baseToken&&p.baseToken.address===mint);
 const pump=own.filter(p=>/^pump(fun|swap)$/i.test(p.dexId||''));const sol=pump.filter(p=>/^(W?SOL|USDC)$/i.test((p.quoteToken&&p.quoteToken.symbol)||''));
 const best=a=>a.sort((x,y)=>(y.liquidity&&y.liquidity.usd||0)-(x.liquidity&&x.liquidity.usd||0)||(y.marketCap||0)-(x.marketCap||0))[0];
 return {any:own.length>0,pump:pump.length>0,pair:best(sol)||null,other:best(pump)||null}}
function hostOf(mint,pp){const p=pp.pair;return {mint,symbol:p.baseToken.symbol,name:p.baseToken.name,image:(p.info&&p.info.imageUrl)||'',mcap:p.marketCap||p.fdv||0,vol:p.volume&&p.volume.h24||0,chg:p.priceChange&&p.priceChange.h24,status:/pumpswap/i.test(p.dexId)?'POOL':'CURVE',created:p.pairCreatedAt||0,url:p.url,quote:p.quoteToken.symbol}}
async function tokens(mints){const out={};for(let i=0;i<mints.length;i+=30){const j=await getj(`${DS}/tokens/v1/solana/${mints.slice(i,i+30).join(',')}`);for(const m of mints.slice(i,i+30))out[m]=pickPair(j,m)}return out}
async function loadHosts(){const st=$('#hstate');st.className='state';st.innerHTML='<i></i>READING PUMP.FUN…';
 try{const [top,latest]=await Promise.allSettled([getj(`${DS}/token-boosts/top/v1`),getj(`${DS}/token-profiles/latest/v1`)]);
  const pick=r=>(r.status==='fulfilled'&&Array.isArray(r.value)?r.value:[]).filter(t=>t.chainId==='solana'&&/pump$/.test(t.tokenAddress||'')).map(t=>t.tokenAddress);
  const mints=[...new Set([...pick(top),...pick(latest)])].slice(0,90);if(!mints.length)throw new Error('none');
  const pp=await tokens(mints);H.list=mints.filter(m=>pp[m]&&pp[m].pair).map(m=>hostOf(m,pp[m]));H.list.forEach(h=>H.byMint[h.mint]=h);
  if(!H.list.length)throw new Error('none');st.innerHTML='<i></i>LIVE FROM PUMP.FUN';paintHosts();heroCards();paintBody()}
 catch(e){st.className='state bad';st.innerHTML='<i></i>FEED OFFLINE';$('#hboard').innerHTML=`<div class="offline"><span class="chip">● FEED OFFLINE</span><span>Couldn't reach the market data. Paste an address above to check one coin.</span><button class="btn ghost sm" id="hretry">RETRY CONNECTION ↻</button></div>`;$('#hretry').onclick=loadHosts;$('#bodyfield').innerHTML=''}}
function sorted(){const l=H.list.slice();if(H.mode==='new')return l.sort((a,b)=>b.created-a.created);if(H.mode==='bitten')return [];return l.sort((a,b)=>b.mcap-a.mcap)}
function paintHosts(){const b=$('#hboard'),l=sorted();
 if(H.mode==='bitten'){b.innerHTML=`<div class="empty">No host has a tick yet. The first bite could be yours.</div>`;$('#hmore').hidden=true;return}
 b.innerHTML=`<div class="row h"><span>#</span><span>HOST</span><span class="r">MARKET CAP</span><span class="r c4">24H VOLUME</span><span class="c5">WHERE</span><span></span></div>`+
  l.slice(0,H.shown).map((h,i)=>`<div class="row" style="--i:${i}"><span class="n">${i+1}</span><span class="who">${h.image?`<img src="${esc(h.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'<span class="chipimg"></span>'}<span style="min-width:0"><div class="nm">$${esc(h.symbol)}</div><div class="sub">${esc(h.name)}</div></span></span><span class="r num c3">${usd(h.mcap)}</span><span class="r num c4">${usd(h.vol)}</span><span class="c5"><span class="tag ${h.status==='POOL'?'pool':'curve'}">${h.status==='POOL'?'PUMPSWAP':'ON CURVE'}</span></span><span class="r"><button class="btn sm" data-latch="${esc(h.mint)}">LATCH</button></span></div>`).join('');
 $('#hmore').hidden=l.length<=H.shown}
$('#htabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#htabs button').forEach(x=>x.classList.toggle('on',x===b));H.mode=b.dataset.v;H.shown=12;if(H.list.length)paintHosts()});
$('#hmore').onclick=()=>{H.shown+=12;paintHosts()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-latch]');if(!b)return;e.preventDefault();useHost(b.dataset.latch)});

/* checking one address */
async function check(mint){mint=(mint||'').trim();if(!isMint(mint))return {ok:false,msg:'That is not a Solana address.'};
 if(H.byMint[mint])return {ok:true,h:H.byMint[mint]};
 try{const pp=(await tokens([mint]))[mint];
  if(!pp.any)return {ok:false,msg:'No market found for this address yet.'};
  if(!pp.pump)return {ok:false,msg:'Not a pump.fun coin. Only pump.fun coins can host.'};
  if(!pp.pair){const o=pp.other;return {ok:false,msg:`$${esc(o.baseToken.symbol)} trades against $${esc(o.quoteToken.symbol)}. A tick can't host a tick: hosts trade against SOL or USDC.`}}
  const h=hostOf(mint,pp);H.byMint[mint]=h;return {ok:true,h}}catch{return {ok:false,msg:'The market data didn’t answer. Try again in a moment.'}}}
$('#hcheck').addEventListener('submit',async e=>{e.preventDefault();const v=$('#hq').value,out=$('#verdict');out.innerHTML=`<div class="v"><span class="msg">Checking…</span></div>`;const r=await check(v);
 out.innerHTML=r.ok?`<div class="v">${r.h.image?`<img class="img" src="${esc(r.h.image)}" alt="" referrerpolicy="no-referrer">`:''}<span class="msg"><b>$${esc(r.h.symbol)}</b> can host. ${usd(r.h.mcap)} market cap, ${r.h.status==='POOL'?'trading in its PumpSwap pool':'still on its bonding curve'}.</span><button class="btn sm" data-latch="${esc(r.h.mint)}">LATCH</button></div>`:`<div class="v"><span class="msg dn">${r.msg}</span></div>`;say(out.textContent)});

/* the rotating live card in the hero */
let hcI=0,hcT=0,hcPause=false;
function heroCards(){const l=H.list.slice().sort((a,b)=>b.mcap-a.mcap).slice(0,8);if(!l.length)return;$('#herolive').hidden=false;
 $('#ldots').innerHTML=l.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('');
 const card=$('#lcard');const paint=()=>{const h=l[hcI%l.length];card.innerHTML=`${h.image?`<img class="img" src="${esc(h.image)}" alt="" referrerpolicy="no-referrer">`:'<span class="img"></span>'}<span style="min-width:0"><div class="t">$${esc(h.symbol)}</div><div class="s">${esc(h.name)}</div></span><span class="r">MARKET CAP<b>${usd(h.mcap)}</b>${h.status==='POOL'?'PUMPSWAP':'ON CURVE'}</span>`;card.dataset.mint=h.mint;$$('#ldots i').forEach((d,i)=>d.classList.toggle('on',i===hcI%l.length))};
 paint();clearInterval(hcT);hcT=setInterval(async()=>{if(hcPause||document.hidden)return;card.classList.add('fade');await sleep(420);hcI++;paint();card.classList.remove('fade')},4600);
 card.onmouseenter=()=>hcPause=true;card.onmouseleave=()=>hcPause=false;card.onclick=e=>{e.preventDefault();useHost(card.dataset.mint)}}

/* ---------- the body: every host as a coin, waiting for its first tick ---------- */
function paintBody(){const f=$('#bodyfield'),l=H.list.slice().sort((a,b)=>b.mcap-a.mcap).slice(0,innerWidth<640?6:11);if(!l.length){f.innerHTML='';return}
 const W=f.clientWidth,Hh=f.clientHeight,mx=Math.log10(Math.max(...l.map(h=>h.mcap||1))),mn=Math.log10(Math.max(1,Math.min(...l.map(h=>h.mcap||1))));
 const placed=[];let html='';
 l.forEach((h,i)=>{const t=(Math.log10(Math.max(1,h.mcap))-mn)/((mx-mn)||1),r=Math.round((innerWidth<640?26:34)+t*(innerWidth<640?30:52));let x,y,k=0;
  do{x=r+12+Math.random()*(W-2*r-24);y=r+10+Math.random()*(Hh-2*r-60);k++}while(k<200&&placed.some(p=>Math.hypot(p.x-x,p.y-y)<p.r+r+26));placed.push({x,y,r});
  html+=`<div class="blob" data-latch="${esc(h.mint)}" title="Latch onto $${esc(h.symbol)}" style="left:${x-r}px;top:${y-r}px;width:${2*r}px;height:${2*r}px;--d:${(i*.37).toFixed(2)}s;${h.image?`background-image:url('${esc(h.image)}')`:''}"><span class="lbl">$${esc(h.symbol)} <span>· 0 ticks</span></span></div>`});
 f.innerHTML=html+'<canvas class="pix" id="wander" width="15" height="13" style="position:absolute;width:45px;height:39px;left:0;top:0;pointer-events:none"></canvas>';
 $('#bstate').innerHTML='<i></i>NO TICKS YET';
 // one tick wanders from host to host, looking for a way in
 const w=$('#wander'),wg=w.getContext('2d');let cur={x:W/2,y:Hh/2},tgt=0,fr=0;
 clearInterval(paintBody.t);paintBody.t=setInterval(()=>{if(document.hidden)return;const p=placed[tgt%placed.length],ty=p.y-p.r-30,tx=p.x-22,dx=tx-cur.x,dy=ty-cur.y,d=Math.hypot(dx,dy);
  if(d<4){if(++fr>40){tgt=(tgt+1+Math.random()*(placed.length-1)|0)%placed.length;fr=0}}else{cur.x+=dx/d*Math.min(d,3.2);cur.y+=dy/d*Math.min(d,3.2)}
  wg.clearRect(0,0,15,13);wg.drawImage(d<4?SA:((Date.now()>>7)%2?SA:SB),0,0);w.style.transform=`translate(${cur.x}px,${cur.y}px)`},40)}
let rT=0;addEventListener('resize',()=>{clearTimeout(rT);rT=setTimeout(()=>{if(H.list.length)paintBody()},300)});

/* ---------- ticks: the board (empty until the first launch) ---------- */
function paintTicks(){$('#tboard').innerHTML=`<div class="empty">No ticks yet. The first one on the board could be yours.<div style="margin-top:18px"><a class="btn" href="#launch">LAUNCH ONE</a></div></div>`}
$('#ttabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#ttabs button').forEach(x=>x.classList.toggle('on',x===b));paintTicks()});

/* ---------- launch ---------- */
const F={host:null,img:null};
function useHost(mint){check(mint).then(r=>{if(!r.ok){$('#lnote').className='note err';$('#lnote').textContent=r.msg.replace(/<[^>]+>/g,'');$('#launch').scrollIntoView();return}
 F.host=r.h;$('#hostfield').hidden=true;const p=$('#hostpicked');p.hidden=false;
 p.innerHTML=`<div class="hostpick">${r.h.image?`<img src="${esc(r.h.image)}" alt="" referrerpolicy="no-referrer">`:''}<span><div class="t">$${esc(r.h.symbol)}</div><div class="s">${usd(r.h.mcap)} · ${r.h.status==='POOL'?'PumpSwap':'on curve'}</div></span><button class="btn ghost sm x" type="button" id="unhost">CHANGE</button></div>`;
 $('#unhost').onclick=()=>{F.host=null;p.hidden=true;$('#hostfield').hidden=false;$('#fhost').value='';preview()};
 $('#lnote').textContent='';preview();$('#launch').scrollIntoView();say('Host set: $'+r.h.symbol)})}
$('#fhost').addEventListener('change',e=>{if(isMint(e.target.value))useHost(e.target.value)});
$('#fhost').addEventListener('paste',e=>setTimeout(()=>{if(isMint(e.target.value))useHost(e.target.value)},10));
function preview(){const n=$('#fname').value.trim(),s=$('#fsym').value.replace(/[^a-z0-9]/gi,'').toUpperCase();if($('#fsym').value!==s)$('#fsym').value=s;
 $('#pn').textContent=n||'Your tick';$('#pt').textContent=`$${s||'TICKER'} / $${F.host?F.host.symbol:'HOST'}`;$('#pd').textContent=$('#fdesc').value.trim();
 $('#lgh').textContent=F.host?'$'+F.host.symbol:'the host';
 const hb=$('#phb');if(F.host&&F.host.image){hb.hidden=false;hb.style.backgroundImage=`url('${F.host.image}')`}else hb.hidden=true;
 const dev=Math.max(0,parseFloat($('#fdev').value)||0);$('#cl').textContent=CFG.launchSol+' SOL';$('#cd').textContent=(+dev.toFixed(4))+' SOL';$('#ct').textContent=(+(CFG.launchSol+dev).toFixed(4))+' SOL'}
['fname','fsym','fdesc','fdev'].forEach(id=>$('#'+id).addEventListener('input',preview));
function setImg(file){if(!file)return;if(!/^image\//.test(file.type)){note('That file is not an image.',1);return}if(file.size>4e6){note('Use an image under 4 MB.',1);return}
 const u=URL.createObjectURL(file);F.img=file;$('#drop').innerHTML=`<img src="${u}" alt=""><span>${esc(file.name.slice(0,28))}</span>`;$('#pimg').style.backgroundImage=`url('${u}')`;note('')}
$('#fimg').addEventListener('change',e=>setImg(e.target.files[0]));
const drop=$('#drop');['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('over')}));['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('over')}));
drop.addEventListener('drop',e=>setImg(e.dataTransfer.files[0]));
function note(t,err){const n=$('#lnote');n.className='note'+(err?' err':'');n.textContent=t;if(t)say(t)}

/* wallet */
const wallets=()=>[{id:'phantom',p:(window.phantom&&window.phantom.solana)||(window.solana&&window.solana.isPhantom?window.solana:null)},{id:'solflare',p:window.solflare&&window.solflare.isSolflare?window.solflare:null},{id:'backpack',p:window.backpack&&(window.backpack.solana||window.backpack)}].filter(w=>w.p);
let WAL=null;
async function connect(){const ws=wallets();if(!ws.length){note('No Solana wallet in this browser. Open TICK in Phantom, Solflare or Backpack.',1);return null}
 try{const r=await ws[0].p.connect();const pk=(r&&r.publicKey)||ws[0].p.publicKey;WAL={...ws[0],pk:pk.toString()};$('#wbtn').textContent=WAL.pk.slice(0,4)+'…'+WAL.pk.slice(-4);return WAL}catch{note('Wallet connection was cancelled.',1);return null}}
$('#wbtn').onclick=connect;
$('#golaunch').addEventListener('click',async()=>{
 const n=$('#fname').value.trim(),s=$('#fsym').value.trim();
 if(!F.host){note('Pick a host first: paste its address above, or press LATCH on any host in 01.',1);return}
 if(!n){note('Give your tick a name.',1);$('#fname').focus();return}
 if(!s){note('Give your tick a ticker.',1);$('#fsym').focus();return}
 if(!F.img){note('Add an image for your tick.',1);return}
 if(!WAL&&!(await connect()))return;
 if(!CFG.engine){note(`Launching opens when the TICK engine is live. Your tick on $${F.host.symbol} is ready to go; nothing was sent.`);return}
});

/* hero equation */
$('#eq').addEventListener('submit',async e=>{e.preventDefault();const t=$('#eqt').value.replace(/[^a-z0-9]/gi,'').toUpperCase(),h=$('#eqh').value.trim(),m=$('#eqmsg');
 if(t){$('#fsym').value=t;preview()}
 if(!h){m.textContent='Pick a host below, or paste a pump.fun coin address.';$('#hosts').scrollIntoView();return}
 m.textContent='Checking the host…';const r=await check(h);if(!r.ok){m.innerHTML=`<span class="dn">${r.msg}</span>`;return}m.textContent='';useHost(r.h.mint)});
$('#eqt').addEventListener('input',e=>{const v=e.target.value.replace(/[^a-z0-9]/gi,'').toUpperCase();if(v!==e.target.value)e.target.value=v});

/* ---------- rules: the route as a picture ---------- */
(function(){const nodes=[['SOL','the buyer pays',g=>coin(g,9,9,8,['#d7c8ff','#9945ff','#4b1fa8'])],['HOST','bought first',g=>coin(g,9,9,8,PAL[0])],['TICK','bought with the host',g=>g.drawImage(SA,1,2)],['FEES','paid in the host',g=>{coin(g,6,11,5,PAL[0]);coin(g,12,7,5,PAL[0])}],['50 / 50','you · $TICK burn',g=>{coin(g,5,9,4,PAL[0]);g.fillStyle='#e0283f';g.fillRect(11,5,5,8)}]];
 $('#flow').innerHTML=nodes.map((n,i)=>`${i?'<span class="arr">→</span>':''}<div class="node"><canvas width="18" height="18" style="width:54px;height:54px" data-n="${i}"></canvas><b>${n[0]}</b><span>${n[1]}</span></div>`).join('');
 $$('#flow canvas').forEach(c=>{const g=c.getContext('2d');const go=()=>nodes[+c.dataset.n][2](g);go()})})();

/* ---------- the scam line, nav state, reveals ---------- */
if(CFG.ca&&$('#scamin')){$('#scamin').innerHTML=`<span><b>OFFICIAL $TICK</b></span><code>${esc(CFG.ca)}</code><button id="cacopy">COPY</button><span>ANYTHING ELSE IS NOT OURS</span>`;$('#cacopy').onclick=()=>navigator.clipboard&&navigator.clipboard.writeText(CFG.ca).then(()=>{$('#cacopy').textContent='COPIED'})}
const secs=['hosts','launch','ticks','body','rules','faq'];
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$$('#links a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
secs.forEach(id=>{const el=$('#'+id);if(el)io.observe(el)});
const rv=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');rv.unobserve(e.target)}}),{threshold:.08});
$$('.rv').forEach(el=>rv.observe(el));
const sweep=()=>$$('.rv:not(.vis)').forEach(el=>{const b=el.getBoundingClientRect();if(b.top<innerHeight&&b.bottom>0)el.classList.add('vis')});
addEventListener('hashchange',()=>setTimeout(sweep,400));addEventListener('scroll',()=>{clearTimeout(sweep.t);sweep.t=setTimeout(sweep,120)},{passive:true});

preview();paintTicks();loadHosts();
})();
