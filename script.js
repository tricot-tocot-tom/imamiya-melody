</script>
<script>
const KEY='imamiya_melody_henshubu_v2';
const APP_VERSION='v4.4 復旧版';
const cameras=['Smartphone','Kodak','HOLGA','3COINS','CHARMERA'];
const defaultTheme=`Cocco\nolive\nSUGINAMI MELODY\n大宮サンセット\nホンマタカシ\n半径1km\n説明しない\n歩く速度\n暮らしそのもの\nごっこは、本気で。`;
const lines=['写真は、歩いた分だけ。','暮らしは、ちゃんと作品になる。','今日は、帰り道だけ。','余白は、ケチらない。','いい写真は、帰り道にある。','ごっこは、本気で。','Poco a poco。少しずつ。','今日は、何に立ち止まりましたか。','編集長。机を空けてあります。','また、歩いてきて。'];
let state={photos:[],sequence:[],letters:[],driveUrl:'https://drive.google.com/drive/folders/1swhtNttW-Y_aCxG65hQ5Z89QhNC7MESk',theme:defaultTheme,author:'tricot',credit:'IMAMIYA_MELODY\nphotographs\n© tricot',receipts:{}};
let editingId=null,pageIndex=0,pickupMin=1;
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function load(){try{const raw=localStorage.getItem(KEY); if(raw){state={...state,...JSON.parse(raw)};}}catch(e){} cameras.forEach(c=>{if(!state.receipts[c])state.receipts[c]={status:'準備中',count:0,last:''};});}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function stars(n){n=+n;return n? '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n):'未評価'}
function guessCamera(name){const s=name.toLowerCase();if(s.includes('charmera'))return 'CHARMERA';if(s.includes('holga'))return 'HOLGA';if(s.includes('kodak'))return 'Kodak';if(s.includes('3coins')||s.includes('300')||s.includes('suri')||s.includes('three'))return '3COINS';return 'Smartphone'}
function setSelectedFile(name,camera){const cam=camera||guessCamera(name); const box=$('selectedFileBox'); if(box){box.classList.add('show'); box.innerHTML=`<div>選択しました。</div><b>${escapeHtml(name||'')}</b><div>${escapeHtml(cam)} として受領します。</div>`;} setDepositMessage(`${name}\n${cam} として受領します。\n　　　　Poco`);}
function selectCameraByName(name){const cam=guessCamera(name); const r=document.querySelector(`input[name="camUpload"][value="${cam}"]`); if(r) r.checked=true; return cam;}
function currentCameraFallback(){const checked=document.querySelector('input[name="camUpload"]:checked'); return checked?checked.value:null;}

function setTab(id){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===id)); if(id==='pager')renderPager(); if(id==='submit')renderSubmit();}
function renderAll(){renderCover();renderReceipts();renderFilters();renderPhotos();renderPickup();renderSelection();renderSequence();renderLetters();renderThemeProfile();renderKpi();renderCameraChecks();renderPager();renderUploadList();renderSubmit();}
function renderCameraChecks(){const box=$('cameraChecks');box.innerHTML=cameras.map(c=>`<label><input type="radio" name="camUpload" value="${c}" ${c==='Smartphone'?'checked':''}> ${c}</label>`).join('');}
function renderFilters(){const f=$('filterCamera'), e=$('editCamera'); const opts='<option value="all">全カメラ</option>'+cameras.map(c=>`<option>${c}</option>`).join(''); f.innerHTML=opts; e.innerHTML=cameras.map(c=>`<option>${c}</option>`).join('');}
function renderKpi(){$('totalPhotos').textContent=state.photos.length;$('selectedCount').textContent=state.sequence.filter(x=>x.type==='photo').length;$('ratedCount').textContent=state.photos.filter(p=>+p.rating>0).length;}
function renderReceipts(){const box=$('receiptList');box.innerHTML=cameras.map(c=>{const count=state.photos.filter(p=>p.camera===c).length;const r=state.receipts[c]||{};const st=count?'受領済':(r.status||'準備中');return `<div class="receipt"><div><b>${c}</b><br><small>${count}枚 ${r.last? ' / '+r.last:''}</small></div><span class="status">${st}</span></div>`}).join('')}
function filterList(list=state.photos){let q=($('searchInput')?.value||'').toLowerCase();let r=$('filterRating')?.value||'all';let c=$('filterCamera')?.value||'all';return list.filter(p=>(r==='all'||String(p.rating)===r)&&(c==='all'||p.camera===c)&&(!q||[p.name,p.reason,p.instruction,p.placement,p.camera,p.sticky].join(' ').toLowerCase().includes(q)))}
function thumb(p){return `<div class="thumb" data-id="${p.id}"><span class="tag">${p.camera||''}</span>${p.sticky?`<span class="sticky">${p.sticky}</span>`:''}<img src="${p.src}" loading="lazy" alt="${p.name}"><div class="meta"><div class="stars">${stars(p.rating)}</div><div class="muted">${p.name}</div></div></div>`}
function renderPhotos(){const grid=$('photoGrid'); if(!grid)return; const list=filterList(); grid.innerHTML=list.length?list.map(thumb).join(''):'<div class="card muted">まだ写真がありません。</div>'; grid.querySelectorAll('.thumb').forEach(el=>el.onclick=()=>openEdit(el.dataset.id));}
function renderPickup(){const grid=$('pickupGrid'); if(!grid)return; const list=state.photos.filter(p=>+p.rating>=pickupMin); $('pickupCount').textContent=list.length; $('pickupMessage').textContent=list.length?`★${pickupMin}以上を表示しています。\n${list.length}枚\n　　　　Poco`:'★を付けた写真は、ここに集まります。　* Poco'; grid.innerHTML=list.length?list.map(thumb).join(''):'<div class="card muted">まだピックアップはありません。ベタ焼きで★を付けると、ここに出ます。</div>'; grid.querySelectorAll('.thumb').forEach(el=>el.onclick=()=>openEdit(el.dataset.id));}
function renderSelection(){const grid=$('selectionGrid'); const list=state.photos.filter(p=>+p.rating>=4);grid.innerHTML=list.length?list.map(thumb).join(''):'<div class="card muted">採用候補はまだありません。</div>';grid.querySelectorAll('.thumb').forEach(el=>el.onclick=()=>openEdit(el.dataset.id));}
function renderSequence(){const box=$('sequenceList'); const items=state.sequence; if(!items.length){box.innerHTML='<div class="card muted">まだページがありません。写真の編集メモで「ページ順に入れる」を選びます。</div>';return;} box.innerHTML=items.map((it,i)=>{if(it.type==='blank')return `<div class="seqItem blank"><div>P${i+1}</div><div>よはく</div><button data-del="${i}">またこんど</button></div>`; const p=state.photos.find(x=>x.id===it.id); if(!p)return ''; return `<div class="seqItem"><img src="${p.src}"><div><b>P${i+1}</b> ${p.name}<br><small>${p.placement||''} / ${p.reason||''}</small></div><div><button data-up="${i}">↑</button><button data-down="${i}">↓</button><button data-del="${i}">×</button></div></div>`}).join(''); box.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>moveSeq(+b.dataset.up,-1));box.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>moveSeq(+b.dataset.down,1));box.querySelectorAll('[data-del]').forEach(b=>{b.onclick=()=>{state.sequence.splice(+b.dataset.del,1);save();renderAll();}})}
function moveSeq(i,d){const j=i+d;if(j<0||j>=state.sequence.length)return;[state.sequence[i],state.sequence[j]]=[state.sequence[j],state.sequence[i]];save();renderAll()}
function renderPager(){const frame=$('pageFrame'); if(!frame)return; const items=state.sequence; if(pageIndex>=items.length)pageIndex=Math.max(0,items.length-1); $('pageNo').textContent=items.length?`P${pageIndex+1} / ${items.length}`:'P0'; if(!items.length){frame.textContent='まだページがありません。';$('pageMemo').textContent='';return;} const it=items[pageIndex]; if(it.type==='blank'){frame.innerHTML='<div class="noteLine">よはく</div>';$('pageMemo').textContent='ここで呼吸。';return;} const p=state.photos.find(x=>x.id===it.id); if(!p)return; frame.innerHTML=`<img src="${p.src}" alt="${p.name}">`; $('pageMemo').textContent=[p.name,p.reason,p.instruction,p.placement].filter(Boolean).join('\n');}
function renderLetters(){const box=$('letterList');box.innerHTML=state.letters.length?state.letters.slice().reverse().map(l=>`<div class="letter"><small>${l.date}</small>\n\n${l.text}\n\n　　　　Poco</div>`).join(''):'<div class="card muted">だよりはまだありません。</div>'}
function renderThemeProfile(){$('driveUrl').value=state.driveUrl||'';$('themeText').value=state.theme||defaultTheme;$('authorName').value=state.author||'tricot';$('creditText').value=state.credit||''}
function openEdit(id){editingId=id;const p=state.photos.find(x=>x.id===id);if(!p)return;$('editTitle').textContent=p.name;$('editImg').src=p.src;$('editRating').value=p.rating||0;$('editCamera').value=p.camera||'Smartphone';$('editSticky').value=p.sticky||'';$('editReason').value=p.reason||'';$('editInstruction').value=p.instruction||'';$('editPlacement').value=p.placement||'未定';$('editSelected').checked=state.sequence.some(x=>x.type==='photo'&&x.id===id);$('editDialog').showModal();}
function safeId(){return crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random())}
async function fileToThumbDataURL(file,max=520){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const blob=new Blob([r.result],{type:file.type||'image/jpeg'});const img=new Image();img.onload=()=>{const scale=Math.min(1,max/Math.max(img.width,img.height));const w=Math.max(1,Math.round(img.width*scale));const h=Math.max(1,Math.round(img.height*scale));const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);res(canvas.toDataURL('image/jpeg',0.78));URL.revokeObjectURL(img.src)};img.onerror=rej;img.src=URL.createObjectURL(blob)};r.onerror=rej;r.readAsArrayBuffer(file)})}
function setDepositMessage(text){const el=$('depositMessage'); if(el) el.textContent=text;}
function setImportProgress(done,total,label='読み込み中'){
  const bar=$('importProgressBar'), text=$('importProgressText');
  const pct=total?Math.round(done/total*100):0;
  if(bar) bar.style.width=pct+'%';
  if(!text) return;
  if(!total && !done && (label==='待機中' || label==='読み込み中')){
    text.textContent='受領をお待ちしています。\n　　　Poco';
    return;
  }
  if(label==='準備中'){
    text.textContent=`受領準備中です。\n0 / ${total}（0%）`;
    return;
  }
  if(label.includes('ZIPを開いています')){
    text.textContent='ZIPを開いています。\n　　　Poco';
    return;
  }
  if(label.includes('ベタ焼き')){
    text.textContent=`ベタ焼きを作っています。\n${done} / ${total}（${pct}%）`;
    return;
  }
  if(label==='完了'){
    text.textContent=`受領しました。\n${done}枚\nベタ焼きへ →`;
    return;
  }
  text.textContent=`受領中...\n${done} / ${total}（${pct}%）`;
}
function renderUploadList(){
  const box=$('uploadList'); if(!box) return;
  const items=state.photos.slice(-80).reverse();
  if(!items.length){box.innerHTML='<div class="muted">まだありません。</div>';return;}
  box.innerHTML=items.map(p=>`<div class="uploadItem"><b title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</b><small>${escapeHtml(p.camera||'未分類')} / ${p.created?new Date(p.created).toLocaleString('ja-JP'):''}</small></div>`).join('');
}
async function addFiles(files){const list=[...files]; if(list[0]){const cam=guessCamera(list[0].webkitRelativePath||list[0].name); setSelectedFile(list.length===1?list[0].name:`${list.length}枚の写真`,cam);} const checked=document.querySelector('input[name="camUpload"]:checked'); const forced=checked?checked.value:null; const imgs=list.filter(file=>file && (file.type?.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i.test(file.name))); if(!imgs.length){toast('読み込める画像がありません。');return;} let added=0; setImportProgress(0,imgs.length,'準備中'); setDepositMessage(`受領準備中です。\n0 / ${imgs.length}\n　　　　Poco`); for(const file of imgs){try{const src=await fileToThumbDataURL(file); const cam=forced||guessCamera(file.name); state.photos.push({id:safeId(),name:file.webkitRelativePath||file.name,src,camera:cam,rating:0,reason:'',instruction:'',placement:'未定',sticky:'',created:new Date().toISOString()}); state.receipts[cam]={status:'受領済',count:(state.receipts[cam]?.count||0)+1,last:new Date().toLocaleDateString('ja-JP')}; added++; if(added%5===0||added===imgs.length){setDepositMessage(`ベタ焼きを作っています。\n${added} / ${imgs.length}\n　　　　Poco`); setImportProgress(added,imgs.length,'ベタ焼きを作っています'); renderKpi(); renderUploadList(); await new Promise(r=>setTimeout(r,0));}}catch(e){console.warn('skip',file.name,e)}} save(); renderAll(); setImportProgress(added,imgs.length,'完了'); setDepositMessage(`受領しました。\n${added}枚\nベタ焼きへどうぞ。\n　　　　Poco`); toast(`写真を受領しました。\n${added}枚\n　　　　Poco`);}
async function addZip(file){
  if(!file)return;
  const fileCam=selectCameraByName(file.name);
  setSelectedFile(file.name,fileCam);
  setImportProgress(0,0,'ZIPを開いています');
  setDepositMessage(`${file.name}\n選択済みです。\nZIPを開いています…\n　　　　Poco`);
  toast(`ZIPを受け取りました。\n${file.name}\n　　　　Poco`);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  if(!window.JSZip){toast('ZIP読込の準備ができませんでした。通信状態を確認してください。');return;}
  try{
    const zip=await JSZip.loadAsync(file);
    const entries=Object.values(zip.files).filter(f=>!f.dir && /\.(jpe?g|png|gif|webp|bmp)$/i.test(f.name));
    if(!entries.length){toast('ZIP内に読み込める画像がありません。');return;}
    setImportProgress(0,entries.length,'ZIPから読み込み');
    setDepositMessage(`${file.name}\n${fileCam} として受領します。\n0 / ${entries.length}\n　　　　Poco`);
    let added=0;
    for(const entry of entries){
      try{
        const blob=await entry.async('blob');
        const imgFile=new File([blob],entry.name,{type:blob.type||'image/jpeg'});
        const src=await fileToThumbDataURL(imgFile);
        const cam=fileCam||guessCamera(entry.name||file.name);
        state.photos.push({id:safeId(),name:entry.name,src,camera:cam,rating:0,reason:'',instruction:'',placement:'未定',sticky:'',created:new Date().toISOString()});
        state.receipts[cam]={status:'受領済',count:(state.receipts[cam]?.count||0)+1,last:new Date().toLocaleDateString('ja-JP')};
        added++;
        if(added%5===0||added===entries.length){
          setDepositMessage(`ZIPからベタ焼きを作っています…\n${added} / ${entries.length}\n　　　　Poco`);
          setImportProgress(added,entries.length,'ZIPからベタ焼きを作っています');
          renderKpi();
          renderUploadList();
          await new Promise(r=>setTimeout(r,0));
        }
      }catch(inner){console.warn('skip zip entry', entry.name, inner)}
    }
    save();
    renderAll();
    setImportProgress(added,entries.length,'完了');
    setDepositMessage(`ZIPを受領しました。\n${added}枚\nベタ焼きへどうぞ。\n　　　　Poco`);
    toast(`写真を受領しました。\n${added}枚\n　　　　Poco`);
  }catch(e){
    console.error(e);
    setDepositMessage(`${file.name}\n読み込めませんでした。\nZIPを作り直すか、小さく分けてください。\n　　　　Poco`);
    toast('ZIPを読み込めませんでした。');
  }
}

function getSubmitPhotos(){
  const mode=(document.querySelector('input[name="submitMode"]:checked')||{}).value||'rated';
  const todayKey=new Date().toISOString().slice(0,10);
  if(mode==='rated') return state.photos.filter(p=>+p.rating>0);
  if(mode==='recent80') return state.photos.slice(-80);
  if(mode==='recent200' || mode==='recent') return state.photos.slice(-200);
  if(mode==='today') return state.photos.filter(p=>(p.created||'').slice(0,10)===todayKey);
  return state.photos.slice();
}
function submitModeLabel(mode){
  return mode==='rated'?'★付きだけ':mode==='recent80'?'直近80枚':(mode==='recent200'||mode==='recent')?'直近200枚':mode==='today'?'今日':'全部';
}
function setSubmitProgress(done,total,label='提出待ち'){
  const bar=$('submitProgressBar'), text=$('submitProgressText');
  const pct=total?Math.round(done/total*100):0;
  if(bar) bar.style.width=pct+'%';
  if(!text) return;
  if(!total && !done){ text.textContent='提出内容を確認できます。'; return; }
  if(label==='完了') text.textContent=`提出パックを作成しました。\n${done} / ${total}（100%）\n保存リンクを確認してください。`;
  else text.textContent=`${label}\n${done} / ${total}（${pct}%）`;
}
function addSubmitLog(line){
  const box=$('submitLog'); if(!box) return;
  const t=new Date().toLocaleTimeString('ja-JP',{hour:'2-digit',minute:'2-digit'});
  const current=box.textContent==='まだありません。'?'':box.textContent;
  box.textContent=`${t} ${line}`+(current?'\n'+current:'');
}
function renderSubmit(){
  const list=getSubmitPhotos();
  const msg=$('submitMessage');
  const mode=(document.querySelector('input[name="submitMode"]:checked')||{}).value||'rated';
  const label=submitModeLabel(mode);
  if(msg) msg.textContent=`${label}を提出します。\n${list.length}枚\n　　　　Poco`;
  const box=$('submitPreview');
  if(!box)return;
  const preview=list.slice(0,120);
  box.innerHTML=preview.length?preview.map(p=>`<img src="${p.src}" alt="${escapeHtml(p.name)}" title="${escapeHtml(p.name)} / ${stars(p.rating)}">`).join(''):'<div class="card muted">提出する写真はまだありません。</div>';
  setSubmitProgress(0,0,'提出内容を確認できます');
}
function escapeAttr(s){return String(s||'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}

function setSubmitStatus(text, linkUrl, filename){
  const box=$('submitStatus');
  if(!box) return;
  box.innerHTML=escapeHtml(text||'');
  if(linkUrl){
    const a=document.createElement('a');
    a.href=linkUrl;
    a.download=filename||'IMAMIYA_MELODY_submit.html';
    a.textContent='保存';
    box.appendChild(document.createElement('br'));
    box.appendChild(a);
  }
}
async function saveBlobVisible(blob, filename){
  const url=URL.createObjectURL(blob);
  setSubmitStatus(`提出パックを作成しました。\n保存ボタンが出ない場合は、下の「提出パックを保存」を押してください。\n\n${filename}\n　　　　Poco`, url, filename);
  try{
    if(navigator.canShare && navigator.share){
      const file=new File([blob], filename, {type: blob.type || 'text/html'});
      if(navigator.canShare({files:[file]})){
        await navigator.share({files:[file], title:'IMAMIYA_MELODY 提出パック'});
        return;
      }
    }
  }catch(e){ console.warn('share cancelled or failed', e); }
  try{ download(blob, filename); }catch(e){ console.warn('download failed', e); }
}

async function exportSubmitPack(){
  const list=getSubmitPhotos();
  const mode=(document.querySelector('input[name="submitMode"]:checked')||{}).value||'rated';
  const label=submitModeLabel(mode);
  setSubmitStatus(`提出パックを作っています。\n${label}\n${list.length}枚\n　　　　Poco`);
  setSubmitProgress(0,Math.max(list.length,1),'サムネイル生成中');
  addSubmitLog(`提出準備 ${label} ${list.length}枚`);
  await new Promise(r=>setTimeout(r,40));
  if(!list.length){
    setSubmitStatus('提出する写真がありません。\n★付き・今日・直近分を選んでください。\n　　　　Poco');
    setSubmitProgress(0,0,'提出内容を確認できます');
    toast('提出する写真がありません。');
    return;
  }
  const memo=$('submitMemo')?.value||'';
  const now=new Date();
  const cameraCounts={};
  list.forEach(p=>{cameraCounts[p.camera||'未分類']=(cameraCounts[p.camera||'未分類']||0)+1});
  const stats=Object.entries(cameraCounts).map(([k,v])=>`<li>${escapeHtml(k)}：${v}枚</li>`).join('');
  const cardParts=[];
  for(let i=0;i<list.length;i++){
    const p=list[i];
    cardParts.push(`<article class="photo"><img src="${p.src}" alt="${escapeAttr(p.name)}"><div class="meta"><b>No.${i+1}</b><span>${escapeHtml(stars(p.rating))}</span><span>${escapeHtml(p.camera||'')}</span><small>${escapeHtml(p.name)}</small>${p.reason?`<p>2号より：${escapeHtml(p.reason)}</p>`:''}${p.instruction?`<p>編集指示：${escapeHtml(p.instruction)}</p>`:''}${p.sticky?`<p>付箋：${escapeHtml(p.sticky)}</p>`:''}</div></article>`);
    if(i%10===0||i===list.length-1){
      setSubmitProgress(i+1,list.length,'サムネイルを書き出しています');
      await new Promise(r=>setTimeout(r,0));
    }
  }
  addSubmitLog('HTML作成');
  const cards=cardParts.join('\n');
  const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IMAMIYA_MELODY 2号提出パック</title><style>body{margin:0;background:#f7f1e8;color:#25211d;font-family:-apple-system,BlinkMacSystemFont,'Hiragino Sans','Yu Gothic',Meiryo,sans-serif;line-height:1.7}main{max-width:980px;margin:auto;padding:24px}h1{font-family:Georgia,serif;letter-spacing:.12em;font-weight:400}.sub{font-family:'Hiragino Mincho ProN','Yu Mincho',serif;color:#7c7165;white-space:pre-line}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}@media(min-width:720px){.grid{grid-template-columns:repeat(4,1fr)}}.photo{background:#fffaf2;border:1px solid #d8cbbb;border-radius:18px;overflow:hidden}.photo img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}.meta{padding:10px;font-size:13px}.meta span{display:inline-block;margin-right:.5em}.meta small{display:block;color:#7c7165;overflow-wrap:anywhere}.memo{background:#fffaf2;border:1px solid #d8cbbb;border-radius:18px;padding:14px;white-space:pre-wrap}.foot{text-align:center;color:#7c7165;margin:40px 0}
/* v4.4: v4.0復旧ベース。預ける・ベタ焼き優先 */
.versionPill{position:fixed;right:.8rem;top:.75rem;z-index:10;border-color:var(--line);background:rgba(255,250,242,.82);font-size:.78rem;padding:.28rem .62rem}
.heroDesk{display:grid;grid-template-columns:74px minmax(0,1fr);gap:1rem;align-items:center;max-width:640px;margin-top:2rem}
.pocoFace{width:74px;height:74px;border-radius:50%;object-fit:cover;border:1px solid var(--line);filter:grayscale(1);background:var(--soft)}
.greetingBox{border-left:1px solid var(--line);padding-left:1rem}
.greetingBox .greeting{font-family:"Hiragino Mincho ProN","Yu Mincho",serif;font-size:1.12rem;white-space:pre-line}
.coverPhoto{margin:1.4rem 0 1.8rem;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--paper)}
.coverPhoto img{width:100%;display:block;aspect-ratio:4/3;object-fit:cover;filter:saturate(.92)}
.coverPhoto figcaption{padding:.55rem .8rem;color:var(--muted);font-size:.8rem;background:#fffdf8}
.coverTools{display:grid;gap:.7rem;margin-top:1rem}.coverTools button{text-align:left}
.libraryList{display:grid;gap:.65rem}.libraryItem{border:1px solid var(--line);border-radius:18px;background:#fffdf8;padding:.85rem}.lectureTitle{font-family:"Hiragino Mincho ProN","Yu Mincho",serif;font-size:1.05rem}.softMotion{animation:floatIn .42s ease both}@keyframes floatIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:480px){.heroDesk{grid-template-columns:58px minmax(0,1fr)}.pocoFace{width:58px;height:58px}.greetingBox .greeting{font-size:1rem}}
</style></head><body><main><h1>IMAMIYA_MELODY</h1><p class="sub">2号提出パック\n${escapeHtml(label)} / ${list.length}枚\n${now.toLocaleString('ja-JP')}</p><section class="memo"><b>編集長メモ</b>\n${escapeHtml(memo||'（メモなし）')}</section><h2>受領内訳</h2><ul>${stats}</ul><h2>ベタ焼き</h2><div class="grid">${cards}</div><p class="foot">提出パック / IMAMIYA_Melody* 編集部 Poco</p></main></body></html>`;
  const y=now.getFullYear(); const m=String(now.getMonth()+1).padStart(2,'0'); const d=String(now.getDate()).padStart(2,'0');
  const filename=`IMAMIYA_MELODY_submit_${y}${m}${d}_${mode}.html`;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  setSubmitProgress(list.length,list.length,'完了');
  addSubmitLog(`提出完了 ${filename}`);
  await saveBlobVisible(blob, filename);
  toast(`提出パックを作りました。\n${list.length}枚\n　　　　Poco`);
}

function timeGreeting(){
  const h=new Date().getHours();
  if(h<5)return 'こんばんは、編集長。\n静かな時間ですね。';
  if(h<11)return 'おはようございます、編集長。\n今日はどんな景色に出会えそうですか。';
  if(h<17)return 'こんにちは、編集長。\n机を空けて待っています。';
  if(h<22)return 'おかえりなさい、編集長。\n今日の一枚を見せてください。';
  return 'こんばんは、編集長。\n本日はここまででも大丈夫です。';
}
function renderCover(){
  const g=$('pocoGreeting'); if(g) g.textContent=timeGreeting();
  const img=$('coverPhotoImg'), meta=$('coverPhotoMeta');
  if(!img||!meta)return;
  const pool=state.photos||[];
  if(pool.length){
    const today=new Date().toISOString().slice(0,10);
    const todays=pool.filter(p=>(p.created||'').slice(0,10)===today);
    const source=todays.length?todays:pool;
    const p=source[Math.floor(Math.random()*source.length)];
    img.src=p.src;
    meta.textContent=`今日の一枚 / ${p.camera||''} / ${p.name||''}`;
  }else{
    img.src='poco-editor.png';
    meta.textContent='Poco / 編集部の机';
  }
}
function exportPlan(){const lines=['写真は、歩いた分だけ。','暮らしは、ちゃんと作品になる。','今日は、帰り道だけ。','余白は、ケチらない。','いい写真は、帰り道にある。','ごっこは、本気で。','Poco a poco。少しずつ。','今日は、何に立ち止まりましたか。','編集長。机を空けてあります。','また、歩いてきて。']; const blob=new Blob([lines.join('\n')],{type:'text/plain'});download(blob,'IMAMIYA_MELODY_edit_plan.txt')}
function download(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},30000)}

let rescueFound=[];
function normalizeImportedState(obj){
  const base={photos:[],sequence:[],letters:[],driveUrl:'https://drive.google.com/drive/folders/1swhtNttW-Y_aCxG65hQ5Z89QhNC7MESk',theme:defaultTheme,author:'tricot',credit:'IMAMIYA_Melody*\nphotographs\n© tricot',receipts:{}};
  if(!obj || typeof obj!=='object') return base;
  const next={...base,...obj};
  if(!Array.isArray(next.photos)) next.photos=[];
  if(!Array.isArray(next.sequence)) next.sequence=[];
  if(!Array.isArray(next.letters)) next.letters=[];
  if(!next.receipts || typeof next.receipts!=='object') next.receipts={};
  next.photos=next.photos.map(p=>({id:p.id||safeId(),name:p.name||'photo',src:p.src||p.thumb||p.dataUrl||'',camera:p.camera||guessCamera(p.name||''),rating:+(p.rating||0),reason:p.reason||'',instruction:p.instruction||'',placement:p.placement||'未定',sticky:p.sticky||'',created:p.created||new Date().toISOString(),seen:!!p.seen})).filter(p=>p.src);
  cameras.forEach(c=>{if(!next.receipts[c]) next.receipts[c]={status:'準備中',count:0,last:''};});
  return next;
}
function scanRescueData(){
  rescueFound=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);
    try{
      const obj=JSON.parse(localStorage.getItem(key)||'');
      const n=normalizeImportedState(obj);
      if(n.photos && n.photos.length){rescueFound.push({key,count:n.photos.length,state:n});}
    }catch(e){}
  }
  const st=$('rescueStatus'), list=$('rescueList');
  if(!rescueFound.length){st.textContent='旧データ候補は見つかりませんでした。バックアップJSONがある場合は「JSONを読む」から読み込んでください。'; list.innerHTML='<div class="muted">候補なし</div>'; return;}
  const total=rescueFound.reduce((a,x)=>a+x.count,0);
  st.textContent=`${rescueFound.length}件 / ${total}枚の候補を見つけました。`;
  list.innerHTML=rescueFound.map(x=>`<div class="uploadItem"><b>${escapeHtml(x.key)}</b><small>${x.count}枚</small></div>`).join('');
}
function mergePhotosFrom(imported){
  const before=state.photos.length;
  const seen=new Set(state.photos.map(p=>(p.name||'')+'|'+(p.src||'').slice(0,80)));
  for(const p of imported.photos||[]){
    const k=(p.name||'')+'|'+(p.src||'').slice(0,80);
    if(!seen.has(k)){state.photos.push(p); seen.add(k);}
  }
  state.sequence=imported.sequence&&imported.sequence.length?imported.sequence:state.sequence;
  state.letters=[...(state.letters||[]),...((imported.letters||[]).filter(l=>!(state.letters||[]).some(x=>x.date===l.date&&x.text===l.text)))];
  state.receipts={...(state.receipts||{}),...(imported.receipts||{})};
  save(); renderAll();
  return state.photos.length-before;
}
function restoreRescueData(){
  if(!rescueFound.length){scanRescueData(); if(!rescueFound.length) return;}
  let added=0;
  rescueFound.forEach(x=>{added+=mergePhotosFrom(x.state);});
  $('rescueStatus').textContent=`復活しました。追加 ${added}枚 / 現在 ${state.photos.length}枚。`;
  toast(`救出しました。\n${added}枚追加\n　　　　Poco`);
}
function importJsonFile(file){
  const r=new FileReader();
  r.onload=()=>{try{const imported=normalizeImportedState(JSON.parse(r.result)); const added=mergePhotosFrom(imported); $('rescueStatus').textContent=`JSONを読み込みました。追加 ${added}枚 / 現在 ${state.photos.length}枚。`; toast(`JSONを読み込みました。\n${added}枚追加`);}catch(err){toast('JSONを読み込めませんでした。'); $('rescueStatus').textContent='JSONを読み込めませんでした。別のバックアップを試してください。';}};
  r.readAsText(file);
}

function init(){load();document.title='IMAMIYA_Melody* 編集部 Poco '+APP_VERSION;const vb=$('versionBtn'); if(vb) vb.textContent=APP_VERSION; const cv=$('closeVersion'); if(cv) cv.onclick=()=>$('versionDialog').close(); if(vb) vb.onclick=()=>$('versionDialog').showModal();$('todayNote').textContent=lines[Math.floor(Math.random()*lines.length)];$('coverNote').textContent=lines[Math.floor(Math.random()*lines.length)];renderCover();document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>setTab(b.dataset.go));document.querySelectorAll('#pickupFilters button').forEach(b=>b.onclick=()=>{pickupMin=+b.dataset.min;document.querySelectorAll('#pickupFilters button').forEach(x=>x.classList.toggle('active',x===b));renderPickup();});document.querySelectorAll('input[name="submitMode"]').forEach(r=>r.onchange=renderSubmit);$('choosePhotosBtn').onclick=()=>{$('fileInput').click();};$('chooseFolderBtn').onclick=()=>{$('folderInput').click();};$('chooseZipBtn').onclick=()=>{$('zipInput').click();}; if($('scanRescue')) $('scanRescue').onclick=scanRescueData; if($('restoreRescue')) $('restoreRescue').onclick=restoreRescueData; if($('openBackupImport')) $('openBackupImport').onclick=()=>$('rescueJsonInput').click(); if($('rescueJsonInput')) $('rescueJsonInput').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0]; if(f) importJsonFile(f); e.target.value='';});$('fileInput').addEventListener('change',e=>{const files=[...e.target.files]; if(files.length){setSelectedFile(files.length===1?files[0].name:`${files.length}枚の写真`, guessCamera(files[0].webkitRelativePath||files[0].name)); addFiles(files);} e.target.value='';});$('folderInput').addEventListener('change',e=>{const files=[...e.target.files]; if(files.length){setSelectedFile(`${files.length}枚の写真`, guessCamera(files[0].webkitRelativePath||files[0].name)); addFiles(files);} e.target.value='';});$('zipInput').addEventListener('change',e=>{const file=e.target.files && e.target.files[0]; if(file){setSelectedFile(file.name, guessCamera(file.name)); addZip(file);} e.target.value='';});['searchInput','filterRating','filterCamera'].forEach(id=>$(id).addEventListener('input',renderPhotos));$('saveDrive').onclick=()=>{state.driveUrl=$('driveUrl').value.trim();save();toast('Driveリンクをとっておきました。')};$('openDrive').onclick=()=>{const u=$('driveUrl').value.trim()||state.driveUrl;if(u)window.open(u,'_blank');else toast('Driveリンクがまだありません。')};$('copyDrive').onclick=async()=>{const u=$('driveUrl').value.trim()||state.driveUrl;if(!u)return toast('Driveリンクがまだありません。');await navigator.clipboard?.writeText(u);toast('コピーしました。')};$('makeContact').onclick=()=>{renderPhotos(); setTab('contact'); toast(`ベタ焼きを整えました。\n${state.photos.length}枚\n　　　　Poco`);};$('startMeeting').onclick=()=>{const pool=state.photos.filter(p=>+p.rating===0).slice(0,10);$('meetingGrid').innerHTML=pool.length?pool.map(thumb).join(''):'<div class="card muted">未評価の写真はありません。</div>';$('meetingGrid').querySelectorAll('.thumb').forEach(el=>el.onclick=()=>openEdit(el.dataset.id));};$('notifyBtn').onclick=()=>toast('編集長。\nベタ焼きができています。\n時間のあるときに。\n　　　　Poco');$('meetingNoteBtn').onclick=()=>setTab('letter');$('saveEdit').onclick=e=>{e.preventDefault();const p=state.photos.find(x=>x.id===editingId);if(!p)return;p.rating=+$('editRating').value;p.camera=$('editCamera').value;p.sticky=$('editSticky').value;p.reason=$('editReason').value;p.instruction=$('editInstruction').value;p.placement=$('editPlacement').value;const want=$('editSelected').checked;const has=state.sequence.some(x=>x.type==='photo'&&x.id===p.id);if(want&&!has)state.sequence.push({type:'photo',id:p.id});if(!want&&has)state.sequence=state.sequence.filter(x=>!(x.type==='photo'&&x.id===p.id));save();$('editDialog').close();renderAll();};$('addBlank').onclick=()=>{state.sequence.push({type:'blank',id:'blank-'+Date.now()});save();renderAll()};$('exportPlan').onclick=exportPlan;$('prevPage').onclick=()=>{pageIndex=Math.max(0,pageIndex-1);renderPager()};$('nextPage').onclick=()=>{pageIndex=Math.min(state.sequence.length-1,pageIndex+1);renderPager()};$('saveLetter').onclick=()=>{const text=$('letterInput').value.trim();if(!text)return;state.letters.push({date:new Date().toLocaleString('ja-JP'),text});$('letterInput').value='';save();renderLetters();toast('編集部だよりをとっておきました。')};$('saveTheme').onclick=()=>{state.theme=$('themeText').value;save();toast('テーマをとっておきました。')};$('saveProfile').onclick=()=>{state.author=$('authorName').value;state.credit=$('creditText').value;save();toast('奥付をとっておきました。')};$('refreshSubmit').onclick=renderSubmit;$('exportSubmitPack').onclick=exportSubmitPack;$('downloadJson').onclick=()=>download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'IMAMIYA_MELODY_henshubu_backup.json');$('importJson').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const imported=normalizeImportedState(JSON.parse(r.result)); mergePhotosFrom(imported); toast('読み込みました。')}catch(err){toast('読み込めませんでした。')}};r.readAsText(f)};$('clearAll').onclick=()=>{if(confirm('全部またこんどにしますか？')){localStorage.removeItem(KEY);state={photos:[],sequence:[],letters:[],driveUrl:'https://drive.google.com/drive/folders/1swhtNttW-Y_aCxG65hQ5Z89QhNC7MESk',theme:defaultTheme,author:'tricot',credit:'IMAMIYA_MELODY\nphotographs\n© tricot',receipts:{}};load();renderAll();}};renderAll();setImportProgress(0,0,'待機中');}
init();
if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});}
