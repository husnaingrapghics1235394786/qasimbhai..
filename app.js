/* ============================================================
   KONTENT SQUAD — SPA + ANIMATIONS
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- DATA ---------- */
const SKILLS = [
  ['🤖','AI Thumbnail Design','Use cutting-edge AI tools to create click-worthy thumbnails in minutes, not hours.'],
  ['🎨','Photoshop Mastery','Learn the Photoshop skills that professional thumbnail designers use every day.'],
  ['🎬','Video Editing','Edit videos that retain viewers, grow your channel, and look cinematic quality.'],
  ['⚡','After Effects & Motion','Add professional motion graphics and animations to your content and thumbnails.'],
  ['🛠️','AI Tools & Workflows','Master the AI tools that save creators hours every week on content production.'],
  ['📈','AI Ads & Creatives','Create scroll-stopping ad creatives and marketing visuals using AI workflows.'],
];

const LIVE = [
  ['🖼️','Thumbnail Reviews','Get your thumbnails reviewed live with actionable feedback.'],
  ['🎬','Video Editing Feedback','Submit your edits and get professional critique.'],
  ['📈','YouTube Growth Strategies','Proven tactics that work right now on YouTube.'],
  ['💰','Brand Deals & Freelancing','Learn how to land clients and brand partnerships.'],
  ['❓','Creator Q&A','Ask anything — get answers live from the community.'],
  ['🤝','Editors × Creators','Match talented editors with creators who need them.'],
];

const MARQUEE = ['AI Thumbnail Design','Video Editing','Photoshop Mastery','After Effects','Motion Graphics','AI Tools','Content Creation','YouTube Growth'];

const ORBIT_ITEMS = [
  { full:'https://picsum.photos/id/1015/1200/800', label:'THUMB 01' },
  { full:'https://picsum.photos/id/1025/1200/800', label:'THUMB 02' },
  { full:'https://picsum.photos/id/1035/1200/800', label:'THUMB 03' },
  { full:'https://picsum.photos/id/1043/1200/800', label:'THUMB 04' },
  { full:'https://picsum.photos/id/1050/1200/800', label:'THUMB 05' },
  { full:'https://picsum.photos/id/1060/1200/800', label:'THUMB 06' },
  { full:'https://picsum.photos/id/1074/1200/800', label:'THUMB 07' },
  { full:'https://picsum.photos/id/1084/1200/800', label:'THUMB 08' },
];

/* ---------- CARD BUILDERS ---------- */
function skillCard([ico, title, desc]){
  return `<article class="fcard" data-reveal>
    <span class="fcard__ico">${ico}</span>
    <h3>${title}</h3><p>${desc}</p></article>`;
}
function fill(id, arr){ const el = document.getElementById(id); if(el) el.innerHTML = arr.map(skillCard).join(''); }
fill('masterGrid', SKILLS);
fill('masterGrid2', SKILLS);
fill('liveGrid', LIVE);

/* marquee (doubled for seamless loop) */
(function(){
  const track = document.getElementById('marqueeTrack');
  if(!track) return;
  const one = MARQUEE.map(t => `<span class="marquee__item">${t} <i>✦</i></span>`).join('');
  track.innerHTML = one + one;
})();

/* ============================================================
   PRELOADER
   ============================================================ */
(function(){
  const pre = document.getElementById('preloader');
  const fill = document.getElementById('plFill');
  const count = document.getElementById('plCount');
  let v = 0;

  if(reduce){ finish(); return; }

  const iv = setInterval(() => {
    v += Math.random() * 12 + 4;
    if(v >= 100){ v = 100; clearInterval(iv); setTimeout(finish, 320); }
    fill.style.width = v + '%';
    count.textContent = String(Math.floor(v)).padStart(2,'0');
  }, 130);

  function finish(){
    const tl = gsap.timeline({ onComplete: () => {
      document.body.classList.add('is-loaded');
      initPage('home', true);
    }});
    tl.to(pre.querySelector('.preloader__inner'), { y:-20, opacity:0, duration:.5, ease:'power2.in' })
      .to(pre, { yPercent:-100, duration:.7, ease:'power4.inOut' }, '-=.1');
  }
})();

/* ============================================================
   GLOW BALL PARALLAX (mouse + scroll)
   ============================================================ */
(function(){
  if(reduce) return;
  const orbs = [...document.querySelectorAll('.orb')];
  // mouse
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth - .5);
    const y = (e.clientY / window.innerHeight - .5);
    orbs.forEach(o => {
      const d = parseFloat(o.dataset.depth) * 120;
      gsap.to(o, { x:x*d, y:y*d, duration:1.2, ease:'power2.out', overwrite:'auto' });
    });
  });
  // scroll drift
  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    orbs.forEach(o => {
      const d = parseFloat(o.dataset.depth);
      gsap.to(o, { yPercent: s * d * 0.06, duration:.6, ease:'none', overwrite:'auto' });
    });
  }, { passive:true });
  // idle float
  orbs.forEach((o,i) => {
    gsap.to(o, { scale:1.12, duration:5+i, yoyo:true, repeat:-1, ease:'sine.inOut', delay:i*.4 });
  });
})();

/* ============================================================
   SPA ROUTER  — animated page transitions
   ============================================================ */
const pages = [...document.querySelectorAll('.page')];
const links = [...document.querySelectorAll('[data-link]')];
let current = 'home';
let animating = false;

/* overlay elements */
const ptPanels = [...document.querySelectorAll('.pt__panel')];
const ptLabel = document.getElementById('ptLabel');
const ptLabelText = document.getElementById('ptLabelText');
const LABELS = { home:'Home', masterclass:'Masterclass', community:'Community', live:'Live', contact:'Contact' };

function setActiveLink(name){
  document.querySelectorAll('.nav__link').forEach(l =>
    l.classList.toggle('is-active', l.dataset.link === name));
}

function revealIn(page){
  const items = page.querySelectorAll('[data-reveal]');
  gsap.set(items, { opacity:0, y:26 });
  gsap.to(items, { opacity:1, y:0, duration:.7, stagger:.05, ease:'power3.out', delay:.05,
    onComplete: () => ScrollTrigger.refresh() });
}

function initPage(name, first){
  const page = pages.find(p => p.dataset.page === name);
  if(!page) return;
  if(name === 'masterclass'){ buildOrbit(); buildDeck(); }
  if(reduce){ page.querySelectorAll('[data-reveal]').forEach(e => gsap.set(e,{opacity:1,y:0})); }
  else revealIn(page);
  // Layout is now final & static — recompute pin/scroll positions so the
  // pricing deck never measures a mid-transition (transformed) position.
  ScrollTrigger.refresh();
}

function swapPages(name){
  const from = pages.find(p => p.dataset.page === current);
  const to   = pages.find(p => p.dataset.page === name);
  if(from) from.hidden = true;
  if(to)   to.hidden = false;
  window.scrollTo(0,0);
  current = name;
}

function go(name){
  if(name === current || animating) return;
  const to = pages.find(p => p.dataset.page === name);
  if(!to) return;

  history.replaceState(null, '', '#' + name);
  setActiveLink(name);
  closeMenu();

  if(reduce){
    swapPages(name); initPage(name); return;
  }

  animating = true;
  ptLabelText.textContent = LABELS[name] || name;

  const tl = gsap.timeline({ onComplete:()=>{ animating=false; } });

  // 1) cover screen — panels wipe up (staggered), label fades in
  tl.set(ptPanels, { transformOrigin:'bottom' })
    .to(ptPanels, { scaleY:1, duration:.5, stagger:.06, ease:'power4.inOut' }, 0)
    .to(ptLabel, { opacity:1, duration:.3, ease:'power2.out' }, .18)

    // 2) swap pages while fully covered (page is static + untransformed here)
    .add(() => { swapPages(name); initPage(name); }, .6)

    // 3) uncover — panels wipe away downward, label fades out
    .to(ptLabel, { opacity:0, duration:.25, ease:'power2.in' }, .82)
    .to(ptPanels, { scaleY:0, transformOrigin:'top', duration:.55, stagger:.06, ease:'power4.inOut' }, .9);
}

links.forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  go(a.dataset.link);
}));

/* deep link on load */
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.replace('#','');
  if(hash && pages.some(p => p.dataset.page === hash) && hash !== 'home'){
    pages.forEach(p => p.hidden = p.dataset.page !== hash);
    current = hash; setActiveLink(hash);
    initPage(hash, true);
  }
});

/* keep ScrollTrigger honest once late assets (images) change layout height */
window.addEventListener('load', () => ScrollTrigger.refresh());

/* ghost button — cursor-follow glow */
document.querySelectorAll('.btn--ghost').forEach(b => {
  b.addEventListener('mousemove', e => {
    const r = b.getBoundingClientRect();
    b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    b.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ============================================================
   NAV — scroll state + mobile menu
   ============================================================ */
const nav = document.getElementById('nav');
const burger = document.getElementById('navBurger');
function closeMenu(){ nav.classList.remove('is-open'); }
burger.addEventListener('click', () => nav.classList.toggle('is-open'));
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 20
    ? '0 24px 60px -24px rgba(0,0,0,.95)' : '0 20px 50px -24px rgba(0,0,0,.8)';
}, { passive:true });

/* ============================================================
   ORBIT GALLERY (adapted from provided file)
   ============================================================ */
let orbitBuilt = false;
function buildOrbit(){
  if(orbitBuilt) return; orbitBuilt = true;

  const ring = document.getElementById('orbitRing');
  const stage = document.getElementById('orbitStage');
  const stageWrap = document.getElementById('orbitStageWrap');
  const core = document.getElementById('orbitCore');
  const counter = document.getElementById('orbitCounter');
  if(!ring) return;

  const RXZ = 220, RY = 180;
  const GOLD = Math.PI * (3 - Math.sqrt(5));
  const count = ORBIT_ITEMS.length;
  counter.textContent = '00 / ' + String(count).padStart(2,'0');
  const wraps = [];

  ORBIT_ITEMS.forEach((item, i) => {
    const t = count === 1 ? 0 : i/(count-1);
    const yN = 1 - t*2;
    const ringR = Math.sqrt(Math.max(0, 1 - yN*yN));
    const theta = GOLD * i;
    const x = Math.cos(theta)*ringR*RXZ;
    const z = Math.sin(theta)*ringR*RXZ;
    const y = yN*RY;

    const wrap = document.createElement('div');
    wrap.className = 'thumb-wrap';
    wrap.style.transform = `translate3d(${x}px,${y}px,${z}px)`;
    const bob = document.createElement('div'); bob.className = 'thumb-bob';
    const face = document.createElement('button'); face.className = 'thumb-face';
    face.setAttribute('data-idx', String(i+1).padStart(2,'0'));
    const img = document.createElement('img');
    img.src = 'https://picsum.photos/id/' + (1015 + i*4) + '/300/170';
    img.alt = item.label; img.loading = 'lazy';
    face.appendChild(img); bob.appendChild(face); wrap.appendChild(bob); ring.appendChild(wrap);
    wraps.push({ wrap, bob, face });
    face.addEventListener('click', () => openOrbitModal(item, i, count, counter));
  });

  if(reduce){
    wraps.forEach(w => gsap.set(w.bob, { rotationY:0 }));
    gsap.set(core, { opacity:1, scale:1 });
    return;
  }

  gsap.to(ring, { rotationY:360, duration:90, repeat:-1, ease:'none' });
  gsap.to({}, { duration:1/60, repeat:-1, onRepeat(){
    const rot = gsap.getProperty(ring, 'rotationY');
    wraps.forEach(w => gsap.set(w.bob, { rotationY:-rot }));
  }});
  wraps.forEach(w => {
    gsap.to(w.wrap, { y:'+=' + (12+Math.random()*16), duration:3+Math.random()*2.5, yoyo:true, repeat:-1, ease:'sine.inOut', delay:Math.random()*2 });
    gsap.to(w.face, { rotationZ:(Math.random()>.5?1:-1)*(2+Math.random()*3), duration:4+Math.random()*3, yoyo:true, repeat:-1, ease:'sine.inOut', delay:Math.random()*2 });
  });

  gsap.from(core, { opacity:0, scale:.7, duration:1, ease:'power3.out' });
  gsap.from(wraps.map(w=>w.wrap), { opacity:0, scale:.4, duration:1.1, stagger:.08, ease:'back.out(1.6)', delay:.2 });

  // parallax tilt
  let rx=0, ry=0;
  stageWrap.addEventListener('mousemove', e => {
    const r = stageWrap.getBoundingClientRect();
    ry = ((e.clientX-r.left)/r.width - .5)*14;
    rx = -((e.clientY-r.top)/r.height - .5)*14;
    gsap.to(stage, { rotationY:ry, rotationX:rx, duration:1, ease:'power2.out' });
  });
  stageWrap.addEventListener('mouseleave', () =>
    gsap.to(stage, { rotationY:0, rotationX:0, duration:1.2, ease:'power2.out' }));
}

/* orbit modal */
const oModal = document.getElementById('orbitModal');
const oImg = document.getElementById('orbitModalImg');
const oLabel = document.getElementById('orbitModalLabel');
document.getElementById('orbitClose').addEventListener('click', closeOrbitModal);
oModal.addEventListener('click', e => { if(e.target === oModal) closeOrbitModal(); });
document.addEventListener('keydown', e => { if(e.key==='Escape') closeOrbitModal(); });

function openOrbitModal(item, i, count, counter){
  oImg.src = item.full; oImg.alt = item.label;
  oLabel.textContent = 'FRAME ' + String(i+1).padStart(2,'0');
  counter.textContent = String(i+1).padStart(2,'0') + ' / ' + String(count).padStart(2,'0');
  oModal.style.visibility = 'visible';
  gsap.fromTo(oModal, { opacity:0 }, { opacity:1, duration:.35 });
  gsap.fromTo('.orbit-modal__frame', { opacity:0, scale:.85, y:20 }, { opacity:1, scale:1, y:0, duration:.45, ease:'power3.out' });
}
function closeOrbitModal(){
  if(oModal.style.visibility !== 'visible') return;
  gsap.to('.orbit-modal__frame', { opacity:0, scale:.9, y:10, duration:.3, ease:'power2.in' });
  gsap.to(oModal, { opacity:0, duration:.3, onComplete:()=>{ oModal.style.visibility='hidden'; } });
}

/* ============================================================
   PRICING DECK (adapted from provided pricing.js)
   ============================================================ */
let deckBuilt = false;
function buildDeck(){
  if(deckBuilt) return; deckBuilt = true;

  const center = document.querySelector('[data-card="center"]');
  const left   = document.querySelector('[data-card="left"]');
  const right  = document.querySelector('[data-card="right"]');
  if(!center) return;

  const mm = gsap.matchMedia();
  mm.add({
    isDesktop:'(min-width: 721px)',
    isMobile:'(max-width: 720px)',
    reduced:'(prefers-reduced-motion: reduce)'
  }, (ctx) => {
    const { isDesktop, reduced } = ctx.conditions;
    const spread = isDesktop ? 220 : 120;
    const tilt = isDesktop ? 9 : 7;

    gsap.set(center, { opacity:0, scale:.72, y:70, rotateZ:0, z:0 });
    gsap.set([left,right], { opacity:0, x:0, y:30, scale:.8, rotateY:0,
      rotateZ:(i)=> i===0?6:-6, z:-60, transformOrigin:'50% 100%' });
    gsap.set(left,  { rotateY:78 });
    gsap.set(right, { rotateY:-78 });

    if(reduced){
      gsap.set(center, { opacity:1, scale:1, y:0 });
      gsap.set(left,  { opacity:1, x:-spread, y:14, rotateY:0, rotateZ:-tilt, scale:.94, z:20 });
      gsap.set(right, { opacity:1, x:spread,  y:14, rotateY:0, rotateZ:tilt,  scale:.94, z:20 });
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger:{ trigger:'#pricingPin', start:'center center', end:'+=120%',delay:"2s", scrub:.6, pin:'#pricingPin', anticipatePin:1, invalidateOnRefresh:true }
    });
    tl.to(center, { opacity:1, scale:1, y:0, duration:.34, ease:'power2.out' }, 0)
      .to(left,  { opacity:1, rotateY:0, x:-spread, y:14, z:40, scale:.94, rotateZ:-tilt, duration:.33, ease:'power3.out' }, .30)
      .to(right, { opacity:1, rotateY:0, x:spread,  y:14, z:40, scale:.94, rotateZ:tilt,  duration:.33, ease:'power3.out' }, .40)
      .to([left,right], { y:4, duration:.15, ease:'power1.inOut' }, .78);
  });

  [left,right].forEach(card => {
    if(!card) return;
    card.addEventListener('mouseenter', () => gsap.to(card, { z:70, duration:.35, ease:'power2.out' }));
    card.addEventListener('mouseleave', () => gsap.to(card, { z:40, duration:.35, ease:'power2.out' }));
  });
}
