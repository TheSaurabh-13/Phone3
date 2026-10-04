document.addEventListener('DOMContentLoaded',()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const nav=$('#nav'), navButtons=$$('.nav-btn'), activePill=$('#active-pill'), glare=$('#glare');
const home=$('#home-screen'), keypad=$('#dialer-screen'), theme=$('#theme-btn');
const display=$('#number-display'), del=$('#delete-btn'), call=$('#call-btn'), dialBtns=$$('.dial-btn');
const context=$('#dialer-context'), suggestedPanel=$('#suggested-panel'), suggestedList=$('#suggested-list'), actions=$('#number-actions');
const favList=$('#favourites-list'), recentList=$('#recent-list');
const contactsSheet=$('#contacts-sheet'), createSheet=$('#create-sheet'), detailSheet=$('#detail-sheet'), callScreen=$('#call-screen');
const contactList=$('#contacts-list'), contactSearch=$('#contact-search-input'), homeSearch=$('#home-search-input'), clearSearch=$('#clear-home-search');
const haptic=()=>{try{navigator.vibrate?.(8)}catch(e){}};
const createName=$('#create-name'), createNumber=$('#create-number'), createTitle=$('#create-title');
const avatarPicker=$('#avatar-picker');let selectedAvatar='purple';
const detailAvatar=$('#detail-avatar'), detailName=$('#detail-name'), detailNumber=$('#detail-number'), detailFav=$('#detail-favourite');
const toastEl=$('#toast');
let number='', detail={name:'Unknown',number:''}, editingNumber=null, activeFilter='All', toastTimer=null, callTimer=null;
const defaults=[
{name:'DAD',number:'9876543210',avatar:'photo',favorite:true},
{name:'Devraj',number:'9123456789',avatar:'pink',favorite:false},
{name:'Rinku Buaa',number:'9987654321',avatar:'magenta',favorite:false},
{name:'Raghunath Bhaiya',number:'9090909090',avatar:'purple',favorite:false}
];
function esc(v){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function contacts(){try{const x=JSON.parse(localStorage.getItem('phone3.contacts'));return Array.isArray(x)?x:defaults.map(c=>({...c}));}catch{return defaults.map(c=>({...c}))}}
function saveContacts(x){localStorage.setItem('phone3.contacts',JSON.stringify(x))}
function recents(){try{const x=JSON.parse(localStorage.getItem('phone3.recents'));return Array.isArray(x)?x:[];}catch{return []}}
function saveRecents(x){localStorage.setItem('phone3.recents',JSON.stringify(x))}
function fav(c){return !!c.favorite}
function fmt(n){const s=String(n||''); if(s.length===10)return s.slice(0,5)+' '+s.slice(5); return s}
function contactFor(n){return contacts().find(c=>c.number===n)}
function avatar(c,cls=''){const ini=esc((c.name||'?')[0].toUpperCase());return `<div class="avatar ${c.avatar||'purple'} ${cls}">${c.avatar==='photo'?'':ini}</div>`}
function activateNav(page,move=true){navButtons.forEach(b=>b.classList.toggle('active',b.dataset.page===page));if(move)updatePill($('.nav-btn.active'),true)}
function updatePill(btn,animate=false){if(!btn||!activePill)return;const navItems=$('.nav-items'),r=btn.getBoundingClientRect(),p=navItems.getBoundingClientRect();activePill.style.width=r.width+'px';activePill.style.transform=`translateX(${r.left-p.left}px)`;if(!animate)activePill.style.transition='none';else activePill.style.transition='transform .5s cubic-bezier(.34,1.2,.64,1),width .5s cubic-bezier(.34,1.2,.64,1)';if(!animate)requestAnimationFrame(()=>activePill.style.transition='')}
function show(page){home.style.display=page==='home'?'block':'none';keypad.style.display=page==='keypad'?'flex':'none';activateNav(page,true);if(page==='keypad')setTimeout(()=>context.scrollTop=0,0)}
navButtons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.page)));
function renderSuggested(){const cs=contacts().slice(0,8);suggestedList.innerHTML=cs.length?cs.map(c=>`<button class="suggested-row" data-number="${esc(c.number)}" data-name="${esc(c.name)}">${avatar(c)}<div class="suggested-info"><strong>${esc(c.name)}</strong><span>Mobile • ${fmt(c.number)}</span></div><span class="suggested-call">↗</span></button>`).join(''):`<div class="empty-state">No contacts yet</div>`}
function renderActions(){const has=number.length>0;suggestedPanel.hidden=has;actions.hidden=!has;context.classList.toggle('has-number',has)}
function updateNumber(){display.textContent=fmt(number);renderActions();renderSuggested()}
function setNumber(n){number=String(n||'').replace(/[^0-9*#+]/g,'').slice(0,15);updateNumber()}
dialBtns.forEach(b=>b.addEventListener('click',()=>{if(number.length<15){number+=b.dataset.number;updateNumber()}}));
let pressTimer;del.addEventListener('click',()=>{number=number.slice(0,-1);updateNumber()});del.addEventListener('pointerdown',()=>{pressTimer=setTimeout(()=>{number='';updateNumber()},650)});['pointerup','pointerleave','pointercancel'].forEach(e=>del.addEventListener(e,()=>clearTimeout(pressTimer)));
function renderFavourites(){const list=contacts().filter(fav);favList.innerHTML=list.length?list.map(c=>`<button class="favourite" data-number="${esc(c.number)}">${avatar(c)}<span>${esc(c.name)}</span></button>`).join(''):`<div class="empty-state favourite-empty">No favourites yet</div>`}
function renderRecents(){let list=recents();if(activeFilter==='Missed')list=list.filter(x=>x.type==='Missed');if(activeFilter==='Contacts')list=list.filter(x=>!!contactFor(x.number));if(activeFilter==='Non-spam')list=list.filter(x=>x.type!=='Spam');const q=homeSearch.value.trim().toLowerCase();if(q)list=list.filter(x=>(x.name+' '+x.number).toLowerCase().includes(q));recentList.innerHTML=list.length?list.map(x=>{const c=contactFor(x.number),name=c?.name||x.name||'Unknown';const a=c?.avatar||'purple';return `<div class="call-card ${x.type==='Missed'?'missed':''}" data-number="${esc(x.number)}" data-name="${esc(name)}">${avatar({name,avatar:a},'card-avatar')}<div class="call-details"><strong>${esc(name)}</strong><span>${x.type==='Missed'?'↙':'↗'} ${x.type} • ${fmt(x.number)} • ${esc(x.time)}</span></div><button class="call-again" data-call-number="${esc(x.number)}" aria-label="Call"><svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.16 21 3 13.84 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.24 1.02z"/></svg></button></div>`}).join(''):`<div class="empty-state">No ${activeFilter==='All'?'recent calls':activeFilter.toLowerCase()+' calls'} yet</div>`}
function addRecent(n,name,type='Outgoing'){const x=recents();x.unshift({number:n,name,type,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});saveRecents(x.slice(0,40));renderRecents()}
function openOverlay(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}
function closeOverlay(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}
function openDetail(n){const c=contactFor(n)||{name:'Unknown',number:n,avatar:'purple'};detail={name:c.name,number:n};detailAvatar.className='detail-avatar '+(c.avatar||'purple');detailAvatar.textContent=c.avatar==='photo'?'':(c.name||'?')[0].toUpperCase();detailName.textContent=c.name;detailNumber.textContent='Mobile • '+fmt(n);detailFav.textContent=c.favorite?'★ Remove from favourites':'☆ Add to favourites';openOverlay(detailSheet)}
function openCreate(n='',edit=false){editingNumber=edit?n:null;createTitle.textContent=edit?'Edit contact':'Create new contact';const c=edit?contactFor(n):null;createName.value=c?.name||'';createNumber.value=edit?c.number:(n||number);selectedAvatar=c?.avatar||'purple';if(avatarPicker)$$('.avatar-choice').forEach(b=>b.classList.toggle('selected',b.dataset.avatar===selectedAvatar));openOverlay(createSheet);setTimeout(()=>createName.focus(),180)}
function upsert(name,n,av='purple'){const cs=contacts();const i=cs.findIndex(c=>c.number===n);if(i>=0){cs[i].name=name;cs[i].avatar=av}else cs.push({name,number:n,avatar:av,favorite:false});saveContacts(cs);renderAll()}
function renderContacts(){const q=contactSearch.value.trim().toLowerCase();const cs=contacts().filter(c=>!q||(c.name+' '+c.number).toLowerCase().includes(q));contactList.innerHTML=cs.length?cs.map(c=>`<button class="contact-row" data-number="${esc(c.number)}">${avatar(c)}<div><strong>${esc(c.name)}</strong><span>${fmt(c.number)}${c.favorite?' • ★':''}</span></div></button>`).join(''):`<div class="empty-state">No contacts found</div>`}
function renderAll(){renderContacts();renderFavourites();renderRecents();renderSuggested()}
function callContact(n){const c=contactFor(n)||{name:'Unknown',number:n,avatar:'purple'};setNumber(n);startCall(c.name,n,c.avatar||'purple');}
function startCall(name,n,av='purple'){closeOverlay(detailSheet);callingAvatar.className='calling-avatar '+av;callingAvatar.textContent=av==='photo'?'':(name||'?')[0].toUpperCase();callingName.textContent=name;callingNumber.textContent='Mobile • '+fmt(n);callingStatusText.textContent='Calling…';openOverlay(callScreen);addRecent(n,name,'Outgoing');clearTimeout(callTimer);callTimer=setTimeout(()=>{if(callScreen.classList.contains('open'))callingStatusText.textContent='Connected • Demo'},2200)}
const callingAvatar=$('#calling-avatar'),callingName=$('#calling-name'),callingNumber=$('#calling-number'),callingStatusText=$('#calling-status-text');
function closeCall(){closeOverlay(callScreen);clearTimeout(callTimer);callingStatusText.textContent='Calling…'}
const inCallPad=$('#in-call-pad'),inCallDisplay=$('#in-call-display');function openInCallPad(){if(inCallPad){inCallPad.classList.add('open');inCallPad.setAttribute('aria-hidden','false');}}function closeInCallPad(){if(inCallPad){inCallPad.classList.remove('open');inCallPad.setAttribute('aria-hidden','true')}}$('#end-call').addEventListener('click',()=>{closeInCallPad();closeCall()});$('#call-back').addEventListener('click',()=>{closeInCallPad();closeCall()});$('#mute-demo').addEventListener('click',e=>{e.currentTarget.classList.toggle('active');showToast(e.currentTarget.classList.contains('active')?'Muted':'Unmuted')});$('#keypad-demo').addEventListener('click',openInCallPad);$('#close-in-call-pad')?.addEventListener('click',closeInCallPad);$$('[data-in-call]').forEach(b=>b.addEventListener('click',()=>{inCallDisplay.textContent+=b.dataset.inCall}));
call.addEventListener('click',()=>{if(!number)return showToast('Enter a number first');const c=contactFor(number);startCall(c?.name||'Unknown',number,c?.avatar||'purple')});
const viewContactsBtn=$('#view-contacts-btn');$('#clear-recents-btn').addEventListener('click',()=>{if(!recents().length)return showToast('No recent calls');saveRecents([]);renderRecents();showToast('Recent calls cleared')});
viewContactsBtn.addEventListener('click',()=>{renderContacts();openOverlay(contactsSheet)});$('#new-contact-from-list').addEventListener('click',()=>openCreate());
$$('[data-close-contacts]').forEach(x=>x.addEventListener('click',()=>closeOverlay(contactsSheet)));$$('[data-close-create]').forEach(x=>x.addEventListener('click',()=>closeOverlay(createSheet)));$$('[data-close-detail]').forEach(x=>x.addEventListener('click',()=>closeOverlay(detailSheet)));
contactSearch.addEventListener('input',renderContacts);homeSearch.addEventListener('input',()=>{clearSearch.hidden=!homeSearch.value;renderRecents()});
const voiceBtn=$('#voice-search-btn');
voiceBtn?.addEventListener('click',()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return showToast('Voice search not supported');
  const r=new SR();r.lang='en-IN';r.interimResults=false;r.maxAlternatives=1;
  voiceBtn.classList.add('listening');showToast('Listening…');
  r.onresult=e=>{homeSearch.value=e.results[0][0].transcript;clearSearch.hidden=false;renderRecents()};
  r.onerror=()=>showToast('Could not hear that');
  r.onend=()=>voiceBtn.classList.remove('listening');r.start();
});clearSearch.addEventListener('click',()=>{homeSearch.value='';clearSearch.hidden=true;renderRecents();homeSearch.focus()});
const createSave=$('#create-save');createSave.addEventListener('click',()=>{const name=createName.value.trim(),n=createNumber.value.replace(/[^0-9*#+]/g,'');if(!name||n.length<3)return showToast('Enter name and valid number');upsert(name,n,selectedAvatar);number=n;updateNumber();closeOverlay(createSheet);showToast(editingNumber?'Contact updated':'Contact saved');editingNumber=null});
if(avatarPicker)$$('.avatar-choice').forEach(b=>b.addEventListener('click',()=>{selectedAvatar=b.dataset.avatar;$$('.avatar-choice').forEach(x=>x.classList.toggle('selected',x===b))}));$('#create-cancel').addEventListener('click',()=>closeOverlay(createSheet));
$('#detail-call').addEventListener('click',()=>callContact(detail.number));$('#detail-video').addEventListener('click',()=>showToast('Video call • Android integration later'));$('#detail-message').addEventListener('click',()=>{window.location.href='sms:'+detail.number;});detailFav.addEventListener('click',()=>{const cs=contacts(),i=cs.findIndex(c=>c.number===detail.number);if(i<0)return;cs[i].favorite=!cs[i].favorite;saveContacts(cs);detailFav.textContent=cs[i].favorite?'★ Remove from favourites':'☆ Add to favourites';renderFavourites();showToast(cs[i].favorite?'Added to favourites':'Removed from favourites')});$('#detail-edit').addEventListener('click',()=>{closeOverlay(detailSheet);openCreate(detail.number,true)});$('#detail-delete').addEventListener('click',()=>{const cs=contacts().filter(c=>c.number!==detail.number);saveContacts(cs);closeOverlay(detailSheet);renderAll();showToast('Contact deleted')});
$$('.filter').forEach(b=>b.addEventListener('click',()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeFilter=b.dataset.filter;renderRecents()}));
const numberActionButtons=$$('.number-action');numberActionButtons.forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.action;if(a==='create')openCreate();else if(a==='add'){renderContacts();openOverlay(contactsSheet)}else if(a==='video')showToast('Video call • Android integration later');else window.location.href='sms:'+number}));
document.addEventListener('click',e=>{const s=e.target.closest('.suggested-row');if(s){setNumber(s.dataset.number);openDetail(s.dataset.number);return}const f=e.target.closest('.favourite');if(f){openDetail(f.dataset.number);return}const cr=e.target.closest('.contact-row');if(cr){setNumber(cr.dataset.number);closeOverlay(contactsSheet);show('keypad');return}const again=e.target.closest('.call-again');if(again){setNumber(again.dataset.callNumber);show('keypad');return}const card=e.target.closest('.call-card');if(card&&!e.target.closest('button'))openDetail(card.dataset.number)});
document.addEventListener('keydown',e=>{if(/^[0-9*#]$/.test(e.key)&&number.length<15){number+=e.key;updateNumber()}else if(e.key==='Backspace'){number=number.slice(0,-1);updateNumber()}else if(e.key==='Escape'){[contactsSheet,createSheet,detailSheet,callScreen].forEach(closeOverlay);closeInCallPad()}});
theme.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('phone3-theme',next)});const savedTheme=localStorage.getItem('phone3-theme');if(savedTheme)document.documentElement.dataset.theme=savedTheme;
nav.addEventListener('pointermove',e=>{const r=nav.getBoundingClientRect();glare.style.setProperty('--x',e.clientX-r.left+'px');glare.style.setProperty('--y',e.clientY-r.top+'px')});window.addEventListener('resize',()=>updatePill($('.nav-btn.active'),false));
function showToast(msg){clearTimeout(toastTimer);toastEl.textContent=msg;toastEl.classList.add('show');toastTimer=setTimeout(()=>toastEl.classList.remove('show'),1700)}
const settingsSheet=$('#settings-sheet'),settingsBtn=$('#settings-btn'),exportBtn=$('#export-data'),importBtn=$('#import-data'),importFile=$('#import-file'),clearDataBtn=$('#clear-data');
settingsBtn?.addEventListener('click',()=>openOverlay(settingsSheet));
$$('[data-close-settings]').forEach(x=>x.addEventListener('click',()=>closeOverlay(settingsSheet)));
exportBtn?.addEventListener('click',()=>{const data={version:1,contacts:contacts(),recents:recents(),theme:document.documentElement.dataset.theme||'dark',exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='phone3-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast('Backup exported')});
importBtn?.addEventListener('click',()=>importFile?.click());
importFile?.addEventListener('change',async()=>{const f=importFile.files?.[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!Array.isArray(d.contacts)||!Array.isArray(d.recents))throw Error();saveContacts(d.contacts);saveRecents(d.recents);if(d.theme)document.documentElement.dataset.theme=d.theme;renderAll();updateNumber();closeOverlay(settingsSheet);showToast('Backup imported')}catch{showToast('Invalid backup file')}importFile.value=''});
clearDataBtn?.addEventListener('click',()=>{if(!confirm('Reset contacts and call history?'))return;localStorage.removeItem('phone3.contacts');localStorage.removeItem('phone3.recents');renderAll();closeOverlay(settingsSheet);showToast('Phone3 data reset')});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.phone3InstallPrompt=e});
renderAll();updateNumber();show('home');setTimeout(()=>updatePill($('.nav-btn.active'),false),80);
});
  
