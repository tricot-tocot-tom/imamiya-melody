const DB_NAME='imamiya_melody_2go_db';
const DB_VERSION=3;
const STORE='photos';
let db; let photos=[]; let currentId=null; let sequence=[]; let letters=[]; let meetingIds=[];
const sayings=[
  '写真は、\n歩いた分だけ。',
  'いい写真は、\n帰り道にある。',
  '余白は、\nケチらない。',
  '今日は、\nスーパーまで。',
  '空よりも、\n影を見よう。',
  '電車は、\n一駅だけ乗る。',
  '撮りすぎた日は、\nえらばない。',
  '買い物も、\n撮影です。',
  '今日は、\n曇りを待とう。',
  '説明しない。\n並べる。',
  'いい写真は、\nすぐ撮らない。',
  'また、\n歩いてきて。',
  '今日は、\n十枚だけ。',
  '生活は、\nちゃんと作品になる。',
  'メインストリートも、\nメロい。'
];
const defaultTheme=`IMAMIYA_MELODY
へんしゅうぶ
* 2号

Theme

Cocco の写真世界
olive の生活感と余白
スピッツ / SUGINAMI MELODY
スピッツ / 大宮サンセット
市川実日子の気分

Direction

説明しない
感想を固定しない
生活そのもの
半径1km
歩く速度
旧市街地
飯田線
空気
光
余白
メロいメインストリート

編集部の約束

写真を撮るために歩くのではなく、
歩いたから写真がある。

うまい写真より、この一冊に必要な写真。
人物は風景の一部なら残す。
顔やナンバーが主役化する場合は、ぼかす・切る・別カットへ。
一冊目は48ページ前後、写真30〜40枚を目安。
`; 
const defaultCredit=`IMAMIYA_MELODY

へんしゅうぶ
* 2号

編集長　鳥子
編集　　2号
写真　　tricot

© tricot`;
function openDB(){return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=e=>{const d=e.target.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'});};r.onsuccess=e=>res(e.target.result);r.onerror=()=>rej(r.error);});}
function tx(mode='readonly'){return db.transaction(STORE,mode).objectStore(STORE)}
function getAll(){return new Promise((res,rej)=>{const r=tx().getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error);});}
function putPhoto(p){return new Promise((res,rej)=>{const r=tx('readwrite').put(p);r.onsuccess=()=>res();r.onerror=()=>rej(r.error);});}
function clearPhotos(){return new Promise((res,rej)=>{const r=tx('readwrite').clear();r.onsuccess=()=>res();r.onerror=()=>rej(r.error);});}
function loadMeta(){sequence=JSON.parse(localStorage.getItem('im_seq')||'[]');letters=JSON.parse(localStorage.getItem('im_letters')||'[]');document.getElementById('themeText').value=localStorage.getItem('im_theme')||defaultTheme;document.getElementById('authorName').value=localStorage.getItem('im_author')||'tricot';document.getElementById('creditText').value=localStorage.getItem('im_credit')||defaultCredit;const line=sayings[Math.floor(Math.random()*sayings.length)];todayNote.textContent=line;coverNote.textContent=line;}
function saveSeq(){localStorage.setItem('im_seq',JSON.stringify(sequence));}
function saveLetters(){localStorage.setItem('im_letters',JSON.stringify(letters));}
function stars(n){n=Number(n||0);return n? '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n):'未評価'}
function fileToDataURL(file,max=1600,q=.86){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{let w=img.width,h=img.height;const scale=Math.min(1,max/Math.max(w,h));w=Math.round(w*scale);h=Math.round(h*scale);const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);res(c.toDataURL('image/jpeg',q));};img.onerror=rej;img.src=fr.result;};fr.onerror=rej;fr.readAsDataURL(file);});}
function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
async function refresh(){photos=await getAll();photos.sort((a,b)=>a.added-b.added);renderGrid();renderSelection();renderSequence();renderMeeting();renderLetters();}
function renderGrid(){const q=document.getElementById('searchInput').value.toLowerCase();const f=document.getElementById('filterRating').value;let list=photos.filter(p=>{const hit=(p.name+' '+(p.reason||'')+' '+(p.instruction||'')).toLowerCase().includes(q);const rate=f==='all'||String(p.rating||0)===f;return hit&&rate;});document.getElementById('photoGrid').innerHTML=list.map(card).join('')||'<p class="muted">まだ写真がありません。</p>';bindCards();}
function renderSelection(){const list=photos.filter(p=>Number(p.rating)>=4);document.getElementById('selectionGrid').innerHTML=list.map(card).join('')||'<p>★★★★☆以上の写真がここに集まります。</p>';bindCards();}
function renderMeeting(){const list=(meetingIds.length?meetingIds:photos.filter(p=>!p.rating).slice(0,10).map(p=>p.id)).map(mid=>photos.find(p=>p.id===mid)).filter(Boolean);document.getElementById('meetingGrid').innerHTML=list.map(card).join('')||'<p>写真を預けたら、ここで10枚ずつ見ます。</p>';bindCards();}
function card(p){return `<article class="thumb" data-id="${p.id}"><img src="${p.data}" alt="${esc(p.name)}"><div class="thumbBody"><div class="name">${esc(p.name)}</div><div class="stars">${stars(p.rating)}</div><div class="note">${esc(p.reason||'')}</div><span class="pill">${esc(p.placement||'未定')}</span></div></article>`}
function bindCards(){document.querySelectorAll('.thumb').forEach(el=>el.onclick=()=>openEdit(el.dataset.id));}
function renderSequence(){const box=document.getElementById('sequenceList'); const items=sequence.map((it,idx)=>{if(it.type==='blank')return `<div class="seqItem" draggable="true" data-i="${idx}"><div class="pageNo">P${idx+1}</div><div class="blank">よはく</div><div><b>よはく</b><br><span class="note">${esc(it.memo||'呼吸を入れる')}</span></div><button data-del="${idx}">またこんど</button></div>`;const p=photos.find(x=>x.id===it.id);if(!p)return '';return `<div class="seqItem" draggable="true" data-i="${idx}"><div class="pageNo">P${idx+1}</div><img src="${p.data}" alt=""><div><b>${esc(p.name)}</b><br><span class="stars">${stars(p.rating)}</span><br><span class="note">${esc(p.instruction||p.reason||'')}</span></div><button data-del="${idx}">またこんど</button></div>`}).join('');box.innerHTML=items||'<p>写真の編集画面で「ページ順に入れる」にチェックするとここに入ります。</p>';bindSeq();}
function bindSeq(){let drag=null;document.querySelectorAll('.seqItem').forEach(el=>{el.ondragstart=()=>drag=Number(el.dataset.i);el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();const to=Number(el.dataset.i);if(drag===null||drag===to)return;const [m]=sequence.splice(drag,1);sequence.splice(to,0,m);saveSeq();renderSequence();};});document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{sequence.splice(Number(b.dataset.del),1);saveSeq();renderSequence();});}
function renderLetters(){const box=document.getElementById('letterList');box.innerHTML=letters.map((l,i)=>`<article class="letterItem"><div class="letterDate">${esc(l.date)}　* 2号</div>${esc(l.text)}<br><button data-letter-del="${i}">またこんど</button></article>`).join('')||'<p>編集部だよりは、ここに積もります。</p>';document.querySelectorAll('[data-letter-del]').forEach(b=>b.onclick=()=>{letters.splice(Number(b.dataset.letterDel),1);saveLetters();renderLetters();});}
function openEdit(pid){const p=photos.find(x=>x.id===pid);if(!p)return;currentId=pid;editTitle.textContent=p.name;editImg.src=p.data;editRating.value=p.rating||0;editReason.value=p.reason||'';editInstruction.value=p.instruction||'';editPlacement.value=p.placement||'未定';editSelected.checked=sequence.some(x=>x.id===pid);editDialog.showModal();}
function esc(s){return String(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
async function addFiles(files){let count=0;for(const file of files){if(!file.type.startsWith('image/'))continue;const data=await fileToDataURL(file);await putPhoto({id:id(),name:file.name,data,added:Date.now()+count,rating:0,reason:'',instruction:'',placement:'未定'});count++;}depositMessage.textContent=count?`あずかりました。${count}枚、ゆっくり見ます。　* 2号`:'画像が見つかりませんでした。';await refresh();}
function exportText(){let lines=['IMAMIYA_MELODY へんしゅうぶ * 2号','編集プラン',''];sequence.forEach((it,i)=>{if(it.type==='blank'){lines.push(`P${i+1} / よはく / ${it.memo||'呼吸'}`);return;}const p=photos.find(x=>x.id===it.id);if(!p)return;lines.push(`P${i+1} / ${p.name}`);lines.push(`評価: ${stars(p.rating)}`);lines.push(`配置: ${p.placement||'未定'}`);lines.push(`2号より: ${p.reason||''}`);lines.push(`編集指示: ${p.instruction||''}`);lines.push('');});lines.push('\n編集部だより\n');letters.forEach(l=>{lines.push(`${l.date} * 2号`);lines.push(l.text);lines.push('');});download('imamiya_melody_henshubu_plan.txt',lines.join('\n'),'text/plain');}
function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function switchTab(name){document.querySelectorAll('.tab,.panel').forEach(x=>x.classList.remove('active'));document.querySelector(`.tab[data-tab="${name}"]`)?.classList.add('active');document.getElementById(name)?.classList.add('active');}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>switchTab(b.dataset.go));
fileInput.onchange=e=>addFiles([...e.target.files]);
searchInput.oninput=renderGrid;filterRating.onchange=renderGrid;
saveEdit.onclick=async e=>{e.preventDefault();const p=photos.find(x=>x.id===currentId);if(!p)return;p.rating=Number(editRating.value);p.reason=editReason.value;p.instruction=editInstruction.value;p.placement=editPlacement.value;await putPhoto(p);const inSeq=sequence.some(x=>x.id===p.id);if(editSelected.checked&&!inSeq)sequence.push({type:'photo',id:p.id});if(!editSelected.checked&&inSeq)sequence=sequence.filter(x=>x.id!==p.id);saveSeq();editDialog.close();await refresh();};
addBlank.onclick=()=>{sequence.push({type:'blank',memo:'よはく / 呼吸'});saveSeq();renderSequence();};
exportPlan.onclick=exportText;
startMeeting.onclick=()=>{const unrated=photos.filter(p=>!p.rating);const source=unrated.length?unrated:photos;meetingIds=source.sort(()=>Math.random()-.5).slice(0,10).map(p=>p.id);meetingLine.textContent='今日は、この10枚だけ。';renderMeeting();};
meetingNoteBtn.onclick=()=>{switchTab('letter');letterInput.focus();};
saveLetter.onclick=()=>{const text=letterInput.value.trim();if(!text)return;letters.unshift({date:new Date().toLocaleDateString('ja-JP'),text});letterInput.value='';saveLetters();renderLetters();};
saveTheme.onclick=()=>{localStorage.setItem('im_theme',themeText.value);alert('テーマをとっておきました');};
saveProfile.onclick=()=>{localStorage.setItem('im_author',authorName.value||'tricot');localStorage.setItem('im_credit',creditText.value||defaultCredit);alert('プロフィールをとっておきました');};
downloadJson.onclick=()=>{const backup={version:3,exported:new Date().toISOString(),theme:themeText.value,author:authorName.value,credit:creditText.value,letters,sequence,photos:photos.map(({data,...meta})=>meta)};download('imamiya_melody_henshubu_backup.json',JSON.stringify(backup,null,2),'application/json');};
importJson.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const b=JSON.parse(r.result);if(b.theme){themeText.value=b.theme;localStorage.setItem('im_theme',b.theme)}if(b.author){authorName.value=b.author;localStorage.setItem('im_author',b.author)}if(b.credit){creditText.value=b.credit;localStorage.setItem('im_credit',b.credit)}if(b.letters){letters=b.letters;saveLetters()}if(b.sequence){sequence=b.sequence;saveSeq()}backupLog.textContent='読み込みました。画像本体は元写真から再追加してください。';renderSequence();renderLetters();}catch(err){backupLog.textContent='読み込み失敗: '+err.message;}};r.readAsText(f);};
clearAll.onclick=async()=>{if(!confirm('写真と編集メモを全削除します。よろしいですか？'))return;await clearPhotos();sequence=[];letters=[];saveSeq();saveLetters();await refresh();};
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
(async()=>{db=await openDB();loadMeta();await refresh();})();
