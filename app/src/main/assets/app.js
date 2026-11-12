
const VER=(window.AndroidBridge&&AndroidBridge.appVersion)?AndroidBridge.appVersion():'1.0.0';
//JAL-START
const div=(a,b)=>~~(a/b),mod=(a,b)=>a-~~(a/b)*b;
const BRK=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
function jalCal(jy){let bl=BRK.length,gy=jy+621,leapJ=-14,jp=BRK[0],jm,jump,leap,leapG,march,n,i;
 for(i=1;i<bl;i++){jm=BRK[i];jump=jm-jp;if(jy<jm)break;leapJ+=div(jump,33)*8+div(mod(jump,33),4);jp=jm}
 n=jy-jp;leapJ+=div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ++;
 leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150;march=20+leapJ-leapG;
 if(jump-n<6)n=n-jump+div(jump+4,33)*33;
 leap=mod(mod(n+1,33)-1,4);if(leap===-1)leap=4;return{leap,gy,march}}
function g2d(gy,gm,gd){let d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*mod(gm+9,12)+2,5)+gd-34840408;return d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752}
function d2g(jdn){let j=4*jdn+139361631;j+=div(div(4*jdn+183187720,146097)*3,4)*4-3908;const i=div(mod(j,1461),4)*5+308;const gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy,gm,gd}}
function j2d(jy,jm,jd){const r=jalCal(jy);return g2d(r.gy,3,r.march)+(jm-1)*31-div(jm,7)*(jm-7)+jd-1}
function d2j(jdn){const gy=d2g(jdn).gy;let jy=gy-621;const r=jalCal(jy),f=g2d(gy,3,r.march);let k=jdn-f,jm,jd;
 if(k>=0){if(k<=185){return{jy,jm:1+div(k,31),jd:mod(k,31)+1}}k-=186}else{jy--;k+=179;if(r.leap===1)k++}
 return{jy,jm:7+div(k,30),jd:mod(k,30)+1}}
const mlen=(y,m)=>m<=6?31:m<=11?30:(jalCal(y).leap===0?30:29);
//JAL-END
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fa=s=>String(s).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const p2=n=>String(n).padStart(2,'0');
const MN=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const WD=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'],WS=['ش','ی','د','س','چ','پ','ج'];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dk=(y,m,d)=>`${y}-${p2(m)}-${p2(d)}`;
const pk=k=>{const a=k.split('-').map(Number);return{y:a[0],m:a[1],d:a[2]}};
const fd=k=>{const o=pk(k);return fa(`${o.y}/${p2(o.m)}/${p2(o.d)}`)};
const wdx=(y,m,d)=>{const g=d2g(j2d(y,m,d));return(new Date(Date.UTC(g.gy,g.gm-1,g.gd)).getUTCDay()+1)%7};
const fdl=k=>{const o=pk(k);return `${WD[wdx(o.y,o.m,o.d)]} ${fa(o.d)} ${MN[o.m-1]} ${fa(o.y)}`};
const today=()=>{const g=new Date(),j=d2j(g2d(g.getFullYear(),g.getMonth()+1,g.getDate()));return{y:j.jy,m:j.jm,d:j.jd}};
const tmin=t=>{const a=t.split(':');return +a[0]*60+ +a[1]};
const fdur=m=>`${fa(Math.floor(m/60))}:${fa(p2(m%60))}`;

const DEFC=[{id:'c1',n:'کار اداری',c:'#1b6ca8'},{id:'c2',n:'پروژه',c:'#1e8e4e'},{id:'c3',n:'جلسه',c:'#e08a1e'},{id:'c4',n:'میدانی',c:'#8e44ad'},{id:'c5',n:'آموزش',c:'#16a0b5'},{id:'c6',n:'سایر',c:'#c0392b'}];
const LS='timesheet_v1';let S={};
try{S=JSON.parse(localStorage.getItem(LS))||{}}catch(e){}
S=Object.assign({entries:[],cats:DEFC,name:'',company:'',role:'',extra:'',sign:true,lastBackup:0,firstUse:Date.now(),theme:'auto'},S);
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){toast('ذخیره‌سازی در این دستگاه ممکن نیست')}};
const catOf=id=>S.cats.find(c=>c.id==id)||{id:'',n:'بدون دسته',c:'#9aa8b6'};
const T0=today();
let view='cal',cur={y:T0.y,m:T0.m},sel=dk(T0.y,T0.m,T0.d),rep={f:{y:T0.y,m:T0.m,d:1},t:{...T0},cat:''};

function applyTheme(){document.documentElement.dataset.theme=S.theme}
let tt;function toast(msg,lbl,fn){const t=$('#toast');t.innerHTML=`<span>${msg}</span>${lbl?`<button>${lbl}</button>`:''}`;t.classList.add('on');if(lbl)$('button',t).onclick=()=>{t.classList.remove('on');fn()};clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),lbl?5000:2600)}
const dayMin=k=>S.entries.filter(e=>e.d==k).reduce((a,e)=>a+tmin(e.e)-tmin(e.s),0);

function render(){
  $$('.bn button').forEach(b=>b.classList.toggle('on',b.dataset.v==view));
  $('#fab').style.display=view=='cal'?'block':'none';
  ({cal:vCal,rep:vRep,set:vSet})[view]();
}
function vCal(){
  const {y,m}=cur,len=mlen(y,m),first=wdx(y,m,1),pre=dk(y,m,0).slice(0,8);
  const list=S.entries.filter(e=>e.d.startsWith(pre));
  const per={};list.forEach(e=>{(per[e.d]=per[e.d]||[]).push(e)});
  const mins=d=>(per[d]||[]).reduce((a,e)=>a+tmin(e.e)-tmin(e.s),0);
  const tot=list.reduce((a,e)=>a+tmin(e.e)-tmin(e.s),0),days=Object.keys(per).length,mx=Math.max(0,...Object.keys(per).map(mins));
  $('#top').innerHTML=`<h1>⏱ تایم‌شیت من</h1><div class="sub">${esc([S.name,S.company].filter(Boolean).join(' · ')||'ثبت ساعت کار و شرح فعالیت')}</div>
  <div class="mn"><button data-act="mv" data-n="-1">›</button><b data-act="now">${MN[m-1]} ${fa(y)}</b><button data-act="mv" data-n="1">‹</button></div>`;
  let g=WS.map((w,i)=>`<div class="wh ${i==6?'f':''}">${w}</div>`).join('')+'<button class="e"></button>'.repeat(first);
  for(let d=1;d<=len;d++){const k=dk(y,m,d),ms=mins(k),cs=[...new Set((per[k]||[]).map(e=>catOf(e.c).c))].slice(0,4);
    g+=`<button data-act="day" data-d="${k}" class="${(first+d-1)%7==6?'f':''} ${k==dk(T0.y,T0.m,T0.d)?'td':''} ${k==sel?'sl':''}"><span class="n">${fa(d)}</span>${ms?`<span class="h">${fdur(ms)}</span>`:'<span></span>'}<span class="dots">${cs.map(c=>`<i style="background:${c}"></i>`).join('')}</span></button>`}
  $('#main').innerHTML=`<div class="stats"><div class="st"><b>${fdur(tot)}</b><span>جمع ماه</span></div><div class="st"><b>${fa(days)}</b><span>روز کاری</span></div><div class="st"><b>${fdur(days?Math.round(tot/days):0)}</b><span>میانگین روز</span></div><div class="st"><b>${fdur(mx)}</b><span>بیشترین روز</span></div></div>
  <div class="card"><div class="cal">${g}</div></div><div id="day"></div>`;
  vDay();
}
function vDay(){
  const es=S.entries.filter(e=>e.d==sel).sort((a,b)=>a.s.localeCompare(b.s));
  $('#day').innerHTML=`<div class="dh"><b>${fdl(sel)}</b><span>${es.length?'جمع: '+fdur(dayMin(sel)):''}</span></div>`+(es.length?es.map(e=>{const c=catOf(e.c);return `<div class="it" style="--c:${c.c}"><div class="tm">${fa(e.s)} تا ${fa(e.e)}<b>${fdur(tmin(e.e)-tmin(e.s))}</b></div><div class="ac"><button class="ib" data-act="edit" data-id="${e.id}">✎</button><button class="ib" data-act="del" data-id="${e.id}">🗑</button></div><div class="ds">${esc(e.t)||'<span style="color:var(--mut)">بدون شرح</span>'}<div class="ct">${esc(c.n)}</div></div></div>`}).join(''):'<div class="empty">برای این روز کاری ثبت نشده.<br>با دکمه ＋ شروع کنید.</div>');
}
function dsel(id,v){const ty=T0.y;let ys='';for(let y=1400;y<=ty+1;y++)ys+=`<option value="${y}" ${y==v.y?'selected':''}>${fa(y)}</option>`;
  const ms=MN.map((n,i)=>`<option value="${i+1}" ${i+1==v.m?'selected':''}>${n}</option>`).join(''),ds=Array.from({length:31},(_,i)=>`<option value="${i+1}" ${i+1==v.d?'selected':''}>${fa(i+1)}</option>`).join('');
  return `<div class="dsel" id="${id}"><select data-k="d">${ds}</select><select data-k="m">${ms}</select><select data-k="y">${ys}</select></div>`}
function rdsel(id){const e=$('#'+id),y=+$('[data-k=y]',e).value,m=+$('[data-k=m]',e).value,d=Math.min(+$('[data-k=d]',e).value,mlen(y,m));return{y,m,d}}

function openEntry(id){
  const ex=id&&S.entries.find(e=>e.id==id);
  const last=S.entries.filter(e=>e.d==sel).sort((a,b)=>b.e.localeCompare(a.e))[0];
  const st=ex?ex.s:(last?last.e:'08:00'),en=ex?ex.e:fdur2(Math.min(tmin(st)+120,1439));
  const v=ex?pk(ex.d):pk(sel);let cat=ex?ex.c:((S.cats[0]||{}).id||'');
  $('#modal').innerHTML=`<div class="sheet"><h2>${ex?'ویرایش':'ثبت'} کار</h2>
  <label class="f"><span>تاریخ</span>${dsel('ed',v)}</label>
  <div class="row"><label class="f"><span>از ساعت</span><input type="time" id="es" value="${st}"></label><label class="f"><span>تا ساعت</span><input type="time" id="ee" value="${en}"></label></div>
  <div id="edur" style="margin:-4px 0 10px;color:var(--pri);font-weight:700"></div>
  <label class="f"><span>دسته</span></label><div class="chips" id="ec" style="margin:-6px 0 6px"></div>
  <div class="row" id="ncr" style="display:none;margin:0 0 10px;flex-wrap:nowrap"><input type="color" id="ncc" value="#1b6ca8" style="flex:none"><input id="ncn" placeholder="نام دسته جدید"><button type="button" class="btn ok" id="nca" style="flex:none">افزودن</button></div>
  <label class="f"><span>شرح کار</span><textarea id="et" placeholder="چه کاری انجام دادید؟">${ex?esc(ex.t):''}</textarea></label>
  <div class="row"><button class="btn ok" id="esv">ذخیره</button><button class="btn" id="ecn">انصراف</button></div></div>`;
  $('#modal').classList.add('open');
  const upd=()=>{const a=tmin($('#es').value||'0:0'),b=tmin($('#ee').value||'0:0');$('#edur').textContent=b>a?'مدت: '+fdur(b-a)+' ساعت':'ساعت پایان باید بعد از شروع باشد'};
  $('#es').oninput=$('#ee').oninput=upd;upd();
  const chips=()=>{$('#ec').innerHTML=S.cats.map(c=>`<button type="button" data-cid="${c.id}" style="--c:${c.c}" class="${c.id==cat?'on':''}">${esc(c.n)}</button>`).join('')+'<button type="button" data-cid="__new" style="--c:#6b7a8a">＋ دسته جدید</button>'};chips();
  $('#ec').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.cid=='__new'){const r=$('#ncr');r.style.display=r.style.display=='none'?'flex':'none';return}cat=b.dataset.cid;chips()};
  $('#nca').onclick=()=>{const n=$('#ncn').value.trim();if(!n){toast('نام دسته را بنویسید');return}const c={id:'c'+Date.now(),n,c:$('#ncc').value};S.cats.push(c);save();cat=c.id;$('#ncn').value='';$('#ncr').style.display='none';chips()};
  $('#ecn').onclick=closeM;
  $('#esv').onclick=()=>{const s=$('#es').value,e=$('#ee').value;if(!s||!e||tmin(e)<=tmin(s)){toast('ساعت شروع و پایان را درست وارد کنید');return}
    const o=rdsel('ed'),k=dk(o.y,o.m,o.d),rec={id:ex?ex.id:'e'+Date.now()+Math.random().toString(36).slice(2,5),d:k,s,e,t:$('#et').value.trim(),c:cat};
    const ov=S.entries.some(x=>x.d==k&&x.id!=rec.id&&tmin(x.s)<tmin(e)&&tmin(x.e)>tmin(s));
    if(ex)S.entries[S.entries.indexOf(ex)]=rec;else S.entries.push(rec);
    save();sel=k;cur={y:o.y,m:o.m};closeM();render();toast(ov?'ذخیره شد؛ با کار دیگری هم‌پوشانی دارد':'ذخیره شد ✓')};
}
const fdur2=m=>`${p2(Math.floor(m/60))}:${p2(m%60)}`;
const closeM=()=>$('#modal').classList.remove('open');

/* ---------- report ---------- */
function repData(){
  const f=dk(rep.f.y,rep.f.m,rep.f.d),t=dk(rep.t.y,rep.t.m,rep.t.d);
  const list=S.entries.filter(e=>e.d>=f&&e.d<=t&&(!rep.cat||e.c==rep.cat)).sort((a,b)=>a.d.localeCompare(b.d)||a.s.localeCompare(b.s));
  const byDay={},byCat={};let total=0;
  list.forEach(e=>{const m=tmin(e.e)-tmin(e.s);total+=m;(byDay[e.d]=byDay[e.d]||[]).push(e);byCat[e.c]=(byCat[e.c]||0)+m});
  return{f,t,list,byDay,byCat,total,days:Object.keys(byDay).length}}
function vRep(){
  $('#top').innerHTML=`<h1>📊 گزارش</h1><div class="sub">بازه دلخواه شمسی · خروجی PDF و چاپ</div>`;
  $('#main').innerHTML=`<div class="card noprint"><h2>بازه گزارش</h2>
  <label class="f"><span>از تاریخ</span>${dsel('rf',rep.f)}</label><label class="f"><span>تا تاریخ</span>${dsel('rt',rep.t)}</label>
  <label class="f"><span>دسته</span><select id="rc"><option value="">همه دسته‌ها</option>${S.cats.map(c=>`<option value="${c.id}" ${rep.cat==c.id?'selected':''}>${esc(c.n)}</option>`).join('')}</select></label>
  <div class="chips" style="--c:var(--act);margin-bottom:10px"><button data-act="pre" data-p="m0">این ماه</button><button data-act="pre" data-p="m1">ماه قبل</button><button data-act="pre" data-p="w">۷ روز اخیر</button><button data-act="pre" data-p="y">امسال</button></div>
  <div class="row"><button class="btn pri" data-act="pdf">⬇ PDF</button><button class="btn warn" data-act="spdf">↗ اشتراک</button>${window.AndroidBridge?'':'<button class="btn" data-act="print">🖨 چاپ</button>'}</div></div><div id="prev"></div>`;
  prev();
}
function prev(){
  const r=repData(),mx=Math.max(1,...Object.values(r.byCat));
  let h=`<div class="card"><h2>گزارش تایم‌شیت</h2><div style="margin-bottom:8px;line-height:1.9">${S.name?'<b>'+esc(S.name)+'</b>':''}${S.role?' · '+esc(S.role):''}${S.extra?' · '+esc(S.extra):''}${S.company?'<br>'+esc(S.company):''}<div style="color:var(--mut)">از ${fd(r.f)} تا ${fd(r.t)}</div></div>
  <div class="stats" style="grid-template-columns:repeat(3,1fr)"><div class="st"><b>${fdur(r.total)}</b><span>جمع ساعت</span></div><div class="st"><b>${fa(r.days)}</b><span>روز کاری</span></div><div class="st"><b>${fdur(r.days?Math.round(r.total/r.days):0)}</b><span>میانگین روز</span></div></div>`;
  if(!r.list.length)return $('#prev').innerHTML=h+'<div class="empty">در این بازه کاری ثبت نشده.</div></div>';
  h+=Object.keys(r.byCat).map(id=>{const c=catOf(id);return `<div class="bar"><span class="nm">${esc(c.n)}</span><span class="tr"><i style="width:${r.byCat[id]/mx*100}%;background:${c.c}"></i></span><span class="v">${fdur(r.byCat[id])}</span></div>`}).join('');
  h+=`<div style="overflow-x:auto;margin-top:10px"><table><tr><th>تاریخ</th><th>ساعت</th><th>مدت</th><th>شرح</th></tr>`;
  Object.keys(r.byDay).forEach(k=>{r.byDay[k].forEach((e,i)=>{const c=catOf(e.c);h+=`<tr><td class="c">${i?'':fd(k)+'<br><small style="color:var(--mut)">'+WD[wdx(...Object.values(pk(k)))]+'</small>'}</td><td class="c">${fa(e.s)}–${fa(e.e)}</td><td class="c">${fdur(tmin(e.e)-tmin(e.s))}</td><td style="border-right:4px solid ${c.c}">${esc(e.t)}</td></tr>`});h+=`<tr class="sum"><td colspan="2">جمع ${fd(k)}</td><td class="c">${fdur(dayMin(k))}</td><td></td></tr>`});
  $('#prev').innerHTML=h+'</table></div></div>';
}
function preset(p){const t=T0;let f,e;
  if(p=='m0'){f={y:t.y,m:t.m,d:1};e={...t}}
  else if(p=='m1'){let y=t.y,m=t.m-1;if(!m){m=12;y--}f={y,m,d:1};e={y,m,d:mlen(y,m)}}
  else if(p=='w'){const j=d2j(j2d(t.y,t.m,t.d)-6);f={y:j.jy,m:j.jm,d:j.jd};e={...t}}
  else{f={y:t.y,m:1,d:1};e={...t}}
  rep.f=f;rep.t=e;vRep()}

/* ---------- PDF (canvas -> jpeg -> pdf, no libraries, Persian-safe) ---------- */
async function drawPDF(r){
  await document.fonts.load('700 20px IRANYekanWebFn');await document.fonts.load('400 20px IRANYekanWebFn');
  const W=1240,H=1754,M=50,R=W-M,CW=W-2*M,pages=[];let x,y;
  const F=(s,w)=>`${w||400} ${s}px IRANYekanWebFn,Tahoma,sans-serif`;
  const T=(t,px,py,s,w,col,al)=>{x.font=F(s||26,w);x.fillStyle=col||'#1c2733';x.textAlign=al||'right';x.fillText(t,px,py)};
  const rr=(a,b,w,h,rad,fill,stroke)=>{x.beginPath();x.moveTo(a+rad,b);x.arcTo(a+w,b,a+w,b+h,rad);x.arcTo(a+w,b+h,a,b+h,rad);x.arcTo(a,b+h,a,b,rad);x.arcTo(a,b,a+w,b,rad);x.closePath();if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.strokeStyle=stroke;x.lineWidth=2;x.stroke()}};
  const np=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;x=c.getContext('2d');x.direction='rtl';x.textBaseline='alphabetic';x.fillStyle='#fff';x.fillRect(0,0,W,H);pages.push(c)};
  const sx=document.createElement('canvas').getContext('2d');
  const meas=(s,fs,w)=>{sx.font=F(fs,w);return sx.measureText(s).width};
  const wrapAt=(str,mw,fs)=>{sx.font=F(fs);const out=[];(str||'').split('\n').forEach(p=>{let ln='';p.split(/\s+/).forEach(w=>{const t=ln?ln+' '+w:w;if(sx.measureText(t).width>mw&&ln){out.push(ln);ln=w}else ln=t});out.push(ln)});return out};
  const fitFs=(s,mw,fs,w)=>{while(fs>15&&meas(s,fs,w)>mw)fs--;return fs};
  const multi=r.f.slice(0,7)!==r.t.slice(0,7),sign=S.sign!==false;
  /* سربرگ */
  np();
  const g=x.createLinearGradient(0,0,W,170);g.addColorStop(0,'#12406e');g.addColorStop(.55,'#1b6ca8');g.addColorStop(1,'#2a8fd0');x.fillStyle=g;x.fillRect(0,0,W,172);
  x.fillStyle='rgba(255,255,255,.08)';x.beginPath();x.arc(110,20,150,0,7);x.fill();
  T('گزارش تایم‌شیت',R,70,50,700,'#fff');
  const l1=[S.name&&'نام: '+S.name,S.role&&'سمت: '+S.role,S.extra].filter(Boolean).join('   |   '),l2=S.company?'شرکت: '+S.company:'';
  let ly=114;if(l1){T(l1,R,ly,fitFs(l1,780,27),400,'#fff');ly+=38}if(l2)T(l2,R,ly,fitFs(l2,780,27,700),700,'#fff');
  const n0=today();T(`از ${fd(r.f)} تا ${fd(r.t)}`,M,70,28,700,'#fff','left');T('تاریخ تهیه: '+fd(dk(n0.y,n0.m,n0.d)),M,114,22,400,'#dcecf8','left');
  /* خلاصه */
  const bw=(CW-42)/4,bs=[['جمع ساعت',fdur(r.total),'#1b6ca8'],['روز کاری',fa(r.days),'#1e8e4e'],['میانگین روزانه',fdur(r.days?Math.round(r.total/r.days):0),'#e08a1e'],['تعداد ثبت',fa(r.list.length),'#8e44ad']];
  bs.forEach((b,i)=>{const bx=R-bw-i*(bw+14);rr(bx,192,bw,84,18,b[2]);T(b[1],bx+bw/2,238,38,700,'#fff','center');T(b[0],bx+bw/2,265,21,400,'#fff','center')});
  /* دسته‌ها */
  let cx=R,cy=320;
  Object.keys(r.byCat).forEach(id=>{const c=catOf(id),txt=`${c.n}: ${fdur(r.byCat[id])}`,w=meas(txt,22,700)+50;if(cx-w<M&&cx!=R){cx=R;cy+=42}rr(cx-w,cy-26,w,36,18,'#eef3f8');x.fillStyle=c.c;x.beginPath();x.arc(cx-20,cy-8,9,0,7);x.fill();T(txt,cx-38,cy,22,700,'#1c2733');cx-=w+10});
  const y0=cy+28,headH=44,totH=64,botRes=sign?200:110;
  const avail=H-botRes-(y0+headH+8)-totH;
  /* چیدمان با کوچک‌شدن خودکار تا در یک صفحه جا شود */
  const build=fs=>{const lh=Math.round(fs*1.5),pad=Math.round(fs*.38),dateW=Math.round(fs*(multi?9.4:6.8)),totW=Math.round(fs*4.4)+16,detW=CW-dateW-totW,tw=Math.ceil(meas('۲۳:۵۹–۲۳:۵۹',fs,700))+16,full=detW-24;let tot=0;
    const rows=Object.keys(r.byDay).map(k=>{let line=0,off=0,mx=1;const pl=[];
      r.byDay[k].forEach(e=>{const w1=meas(e.t||' ',fs)+tw+30+26;
        if(w1<=full){if(off>0&&off+w1>full){line++;off=0}pl.push({e,line,off,ls:[e.t||'']});off+=w1;mx=Math.max(mx,line+1)}
        else{if(off>0){line++;off=0}const ls=wrapAt(e.t,full-tw-44,fs);pl.push({e,line,off:0,ls});line+=ls.length;off=0;mx=Math.max(mx,line)}});
      const h=mx*lh+pad*2;tot+=h;return{k,pl,h}});
    return{rows,tot,lh,pad,dateW,totW,detW,tw,fs}};
  let fs=26,L=build(fs);while(L.tot>avail&&fs>15){fs--;L=build(fs)}
  if(L.tot>avail){fs=19;L=build(fs)}
  const detR=R-L.dateW;
  const head=()=>{rr(M,y,CW,headH,12,'#1b6ca8');T('تاریخ',R-12,y+30,22,700,'#fff');T('ساعت و شرح کار',detR-12,y+30,22,700,'#fff');T('جمع روز',M+L.totW/2,y+30,22,700,'#fff','center');y+=headH+8};
  y=y0;head();
  L.rows.forEach((row,ri)=>{
    if(y+row.h>H-110){np();y=M;head()}
    const o=pk(row.k),wi=wdx(o.y,o.m,o.d);
    x.fillStyle=wi==6?'#fdecea':(ri%2?'#f5f8fb':'#fff');x.fillRect(M,y,CW,row.h);
    const base=Math.round(L.fs*1.05),first=y+L.pad+base;
    T(multi?`${fa(p2(o.m))}/${fa(p2(o.d))} ${WD[wi]}`:`${WD[wi]} ${fa(o.d)}`,R-10,first,L.fs,700,wi==6?'#c0392b':'#12406e');
    row.pl.forEach(it=>{const c=catOf(it.e.c),cr=detR-it.off,by=y+L.pad+it.line*L.lh+base;x.fillStyle=c.c;x.beginPath();x.arc(cr-16,by-L.fs*.35,Math.max(4,L.fs*.2),0,7);x.fill();
      T(`${fa(it.e.s)}–${fa(it.e.e)}`,cr-32,by,L.fs,700,c.c);
      it.ls.forEach((ln,j)=>T(ln,cr-32-L.tw,by+j*L.lh,L.fs,400,'#1c2733'))});
    T(fdur(dayMin(row.k)),M+L.totW/2,first,L.fs,700,'#1b6ca8','center');
    x.fillStyle='#e3e9ef';x.fillRect(M,y+row.h-1,CW,2);y+=row.h;
  });
  if(y+totH+6>H-(sign?190:100)){np();y=M}
  rr(M,y+6,CW,totH-6,16,'#12406e');T('جمع کل ساعات کار',R-22,y+6+(totH-6)/2+10,28,700,'#fff');T(fdur(r.total)+' ساعت',M+22,y+6+(totH-6)/2+11,30,700,'#f0b04a','left');
  if(sign){const sw=(CW-30)/2,sy=H-178;[['امضای کارمند',R-sw,S.name],['تأیید مدیر / سرپرست',M,'']].forEach(b=>{rr(b[1],sy,sw,92,14,null,'#9aa8b6');T(b[0],b[1]+sw-16,sy+30,22,700,'#6b7a8a');if(b[2])T(b[2],b[1]+sw-16,sy+76,22,400,'#1c2733')})}
  pages.forEach((c,i)=>{const z=c.getContext('2d');z.direction='rtl';z.font=F(22);z.fillStyle='#6b7a8a';z.textAlign='center';z.fillText(`صفحه ${fa(i+1)} از ${fa(pages.length)}`,W/2,H-34);z.textAlign='right';z.fillText(S.company||'تایم‌شیت من',R,H-34);z.fillStyle='#d9e0e8';z.fillRect(M,H-78,CW,2)});
  return pages;
}
function buildPDF(pages){
  const enc=new TextEncoder(),ch=[],off=[];let len=0;const add=b=>{if(typeof b=='string')b=enc.encode(b);ch.push(b);len+=b.length};
  const obj=(i,body)=>{off[i]=len;add(i+' 0 obj\n');body.forEach(b=>add(b));add('\nendobj\n')};
  const n=pages.length;add('%PDF-1.4\n');
  obj(1,['<</Type/Catalog/Pages 2 0 R>>']);obj(2,['<</Type/Pages/Count '+n+'/Kids ['+pages.map((_,i)=>(3+i*3)+' 0 R').join(' ')+']>>']);
  pages.forEach((c,i)=>{const bin=atob(c.toDataURL('image/jpeg',.92).split(',')[1]),jp=new Uint8Array(bin.length);for(let q=0;q<bin.length;q++)jp[q]=bin.charCodeAt(q);
    const pg=3+i*3,cs='q 595 0 0 842 0 0 cm /Im0 Do Q';
    obj(pg,['<</Type/Page/Parent 2 0 R/MediaBox [0 0 595 842]/Resources<</XObject<</Im0 '+(pg+2)+' 0 R>>>>/Contents '+(pg+1)+' 0 R>>']);
    obj(pg+1,['<</Length '+cs.length+'>>\nstream\n',cs,'\nendstream']);
    obj(pg+2,['<</Type/XObject/Subtype/Image/Width '+c.width+'/Height '+c.height+'/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length '+jp.length+'>>\nstream\n',jp,'\nendstream'])});
  const xr=len,tot=3+n*3;let xs='xref\n0 '+tot+'\n0000000000 65535 f \n';for(let i=1;i<tot;i++)xs+=String(off[i]).padStart(10,'0')+' 00000 n \n';
  add(xs+'trailer\n<</Size '+tot+'/Root 1 0 R>>\nstartxref\n'+xr+'\n%%EOF');
  return new Blob(ch,{type:'application/pdf'});
}
function dl(blob,name){
  if(window.AndroidBridge){const r=new FileReader();r.onload=()=>{try{AndroidBridge.saveFile(String(r.result).split(',')[1],name,blob.type||'application/octet-stream')}catch(e){toast('ذخیره فایل انجام نشد')}};r.readAsDataURL(blob);return}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},5000)}
async function shareFile(blob,name){
  if(window.AndroidBridge){const r=new FileReader();r.onload=()=>{try{AndroidBridge.shareFile(String(r.result).split(',')[1],name,blob.type||'application/octet-stream')}catch(e){toast('اشتراک‌گذاری انجام نشد')}};r.readAsDataURL(blob);return}
  const f=new File([blob],name,{type:blob.type});if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:name})}catch(e){}}else{toast('اشتراک‌گذاری پشتیبانی نمی‌شود؛ دکمه دانلود را بزنید')}}
async function doPDF(mode){const r=repData();if(!r.list.length){toast('در این بازه کاری ثبت نشده');return}
  toast('در حال ساخت PDF…');try{const blob=buildPDF(await drawPDF(r)),name=`timesheet-${r.f}_${r.t}.pdf`;if(mode=='share')await shareFile(blob,name);else{dl(blob,name);toast('PDF آماده شد ✓')}}catch(e){toast('خطا در ساخت PDF')}}

/* ---------- settings ---------- */
function vSet(){
  $('#top').innerHTML=`<h1>⚙️ تنظیمات</h1><div class="sub">مشخصات، دسته‌ها، پشتیبان‌گیری</div>`;
  const inp=(id,l,v)=>`<label class="f"><span>${l}</span><input id="${id}" value="${esc(v||'')}"></label>`;
  $('#main').innerHTML=`<div class="card"><h2>مشخصات من (بالای گزارش و PDF)</h2>
  ${inp('sn','نام و نام خانوادگی',S.name)}${inp('sc','شرکت / سازمان محل کار',S.company)}
  <div class="row">${inp('sr','سمت / واحد',S.role)}${inp('sx','کد پرسنلی یا توضیح دیگر',S.extra)}</div>
  <label class="f" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="ssg" ${S.sign!==false?'checked':''} style="width:20px;min-height:0;flex:none"><span style="font-size:14px;color:var(--tx)">جای امضا (کارمند / مدیر) پایین PDF</span></label>
  <label class="f"><span>ظاهر</span><select id="sth"><option value="auto" ${S.theme=='auto'?'selected':''}>خودکار</option><option value="light" ${S.theme=='light'?'selected':''}>روشن</option><option value="dark" ${S.theme=='dark'?'selected':''}>تیره</option></select></label></div>
  <div class="card"><h2>دسته‌ها و رنگ‌ها</h2><p style="margin:0 0 10px;color:var(--mut);font-size:12px">نام و رنگ هر دسته را مستقیم ویرایش کنید؛ با 🗑 حذف و با دکمه‌ی پایین دسته‌ی تازه اضافه کنید.</p>${S.cats.map(c=>`<div class="row" style="margin-bottom:8px;flex-wrap:nowrap"><input type="color" data-cc="${c.id}" value="${c.c}" style="flex:none"><input data-cn="${c.id}" value="${esc(c.n)}"><button class="ib" data-act="dcat" data-id="${c.id}" style="flex:none">🗑</button></div>`).join('')||'<div class="empty">هیچ دسته‌ای نیست.</div>'}<button class="btn pri" data-act="acat" style="width:100%">＋ دسته جدید</button></div>
  <div class="card"><h2>پشتیبان‌گیری</h2><div class="row"><button class="btn pri" data-act="exp">⬇ پشتیبان‌گیری</button><button class="btn" data-act="imp">⬆ بازیابی</button></div><input type="file" id="fi" accept=".json,application/json" style="display:none">${bkLine()}<p style="color:var(--mut);font-size:12px">اطلاعات روی همین گوشی ذخیره می‌شود. قبل از پاک‌کردن اپ یا تعویض گوشی پشتیبان بگیرید.</p></div>
  <div class="ver">تایم‌شیت من · نسخه ${VER}</div>`;
  [['sn','name'],['sc','company'],['sr','role'],['sx','extra']].forEach(a=>{$('#'+a[0]).oninput=e=>{S[a[1]]=e.target.value;save()}});
  $('#ssg').onchange=e=>{S.sign=e.target.checked;save()};
  $('#sth').onchange=e=>{S.theme=e.target.value;save();applyTheme()};
  $$('[data-cc]').forEach(i=>i.oninput=()=>{catOf(i.dataset.cc).c=i.value;save()});$$('[data-cn]').forEach(i=>i.oninput=()=>{catOf(i.dataset.cn).n=i.value;save()});
  $('#fi').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);if(!Array.isArray(o.entries))throw 0;S=Object.assign({entries:[],cats:DEFC,name:'',company:'',role:'',extra:'',sign:true,lastBackup:0,firstUse:Date.now(),theme:'auto'},o);save();applyTheme();render();toast('بازیابی شد ✓')}catch(x){toast('فایل پشتیبان معتبر نیست')}};rd.readAsText(f)};
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.id;
  if(a=='view'){view=b.dataset.v;render()}
  else if(a=='mv'){let m=cur.m+ +b.dataset.n,y=cur.y;if(m>12){m=1;y++}if(m<1){m=12;y--}cur={y,m};sel=dk(y,m,1);render()}
  else if(a=='now'){cur={y:T0.y,m:T0.m};sel=dk(T0.y,T0.m,T0.d);render()}
  else if(a=='day'){sel=b.dataset.d;$$('.cal button').forEach(x=>x.classList.toggle('sl',x.dataset.d==sel));vDay()}
  else if(a=='add')openEntry();else if(a=='edit')openEntry(id);
  else if(a=='del'){const i=S.entries.findIndex(x=>x.id==id),it=S.entries[i];S.entries.splice(i,1);save();render();toast('حذف شد','برگردان',()=>{S.entries.push(it);save();render()})}
  else if(a=='pre')preset(b.dataset.p);
  else if(a=='pdf')doPDF('dl');else if(a=='spdf')doPDF('share');else if(a=='print')window.print();
  else if(a=='acat'){S.cats.push({id:'c'+Date.now(),n:'دسته جدید',c:'#1b6ca8'});save();vSet();setTimeout(()=>{const l=$$('[data-cn]').pop();if(l){l.focus();l.select()}},50)}
  else if(a=='dcat'){const i=S.cats.findIndex(c=>c.id==id),c=S.cats[i];S.cats.splice(i,1);save();vSet();toast('دسته حذف شد','برگردان',()=>{S.cats.splice(i,0,c);save();if(view=='set')vSet()})}
  else if(a=='exp')backupNow();
  else if(a=='imp')$('#fi').click();
});
document.addEventListener('change',e=>{if(e.target.closest('#rf,#rt')||e.target.id=='rc'){rep.f=rdsel('rf');rep.t=rdsel('rt');rep.cat=$('#rc').value;prev()}});
$('#modal').addEventListener('click',e=>{if(e.target.id=='modal')closeM()});
window.__back=()=>{if($('#modal').classList.contains('open')){closeM();return true}if(view!='cal'){view='cal';render();return true}return false};

/* ---------- یادآوری پشتیبان‌گیری ---------- */
function backupNow(){S.lastBackup=Date.now();save();dl(new Blob([JSON.stringify(S)],{type:'application/json'}),`timesheet-backup-${dk(T0.y,T0.m,T0.d)}.json`)}
const bkLine=()=>`<p style="margin:8px 0 0;font-size:12px;color:var(--mut)">آخرین پشتیبان: ${S.lastBackup?fa(Math.floor((Date.now()-S.lastBackup)/864e5))+' روز پیش':'هنوز پشتیبان نگرفته‌اید'}</p>`;
function backupNag(){if(!S.entries.length)return;if(Date.now()-(S.lastBackup||S.firstUse||Date.now())>30*864e5)toast('بیش از ۳۰ روز از آخرین پشتیبان‌گیری گذشته','پشتیبان بگیر',backupNow)}
(()=>{let t;$('#main').addEventListener('scroll',()=>{const f=$('#fab');f.classList.add('hide');clearTimeout(t);t=setTimeout(()=>f.classList.remove('hide'),700)},{passive:true})})();
applyTheme();render();setTimeout(backupNag,1500);
