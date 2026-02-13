const images = {
  // Úpravy sprav len tu: pridaj/odober názvy a cesty k fotkám
  interior: [
    'assets/images/interier/473188978_122132045600523776_7431414319302364896_n.jpg',
  ],
  food: [
    'assets/images/jedlo/jedlo.jpg',
    'assets/images/jedlo/jedlo1.jpg',
    'assets/images/jedlo/jedlo2.jpg',
    'assets/images/jedlo/jedlo3.jpg',
    'assets/images/jedlo/jedlo4.jpg',
    'assets/images/jedlo/jedlo5.jpg',
    'assets/images/jedlo/jedlo6.jpg',
  ],
  placeholder:
    'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 300\" preserveAspectRatio=\"xMidYMid slice\"%3E%3Crect width=\"400\" height=\"300\" fill=\"%23f2e6d7\"/%3E%3Ctext x=\"50%25\" y=\"52%25\" fill=\"%237a3b32\" font-family=\"Manrope,Arial,sans-serif\" font-size=\"20\" text-anchor=\"middle\"%3EFoto sa pripravuje%3C/text%3E%3C/svg%3E',
};

const featuredDishes = [
  {
    name: 'Detvianska pochúťka',
    desc: 'V zemiakovej placke, kyslá uhorka.',
    price: '7,10 €',
    imageIndex: 3,
  },
  {
    name: 'Maďarský guláš',
    desc: 'Podávaný s knedľou, sýta klasika.',
    price: '7,10 €',
    imageIndex: 0,
  },
  {
    name: 'Vyprážaný syr',
    desc: 'Hranolky a tatárska omáčka, obľúbená celá porcia.',
    price: '7,10 €',
    imageIndex: 5,
  },
];

const nav = document.querySelector('[data-nav]');
const toggle = document.querySelector('.menu-toggle');
const hero = document.getElementById('hero');

function setHeroBackground() {
  const candidate = images.interior[0];
  const source = candidate || images.placeholder;
  const temp = new Image();
  temp.onload = () => hero.style.setProperty('--hero-photo', `url('${source}')`);
  temp.onerror = () => hero.style.setProperty('--hero-photo', `url('${images.placeholder}')`);
  temp.src = source;
}

function buildMarquee() {
  const viewport = document.getElementById('gallery-marquee');
  if (!viewport) return;
  const baseList = images.food && images.food.length ? [...images.food] : [];
  while (baseList.length < 6) baseList.push(images.placeholder);
  const loopList = [...baseList, ...baseList];

  const strip = document.createElement('div');
  strip.className = 'marquee-strip';

  loopList.forEach((src, idx) => {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = src;
    img.alt = `Jedlo ${((idx % baseList.length) + 1).toString()}`;
    img.onerror = () => (img.src = images.placeholder);
    strip.appendChild(img);
  });

  viewport.innerHTML = '';
  viewport.appendChild(strip);
  startMarquee(viewport, strip);
}

function buildFeatured() {
  const wrap = document.getElementById('featured-grid');
  if (!wrap) return;
  wrap.innerHTML = '';

  featuredDishes.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'rec-card';

    const img = document.createElement('img');
    const src = images.food[item.imageIndex] || images.placeholder;
    img.src = src;
    img.alt = item.name;
    img.loading = 'lazy';
    img.onerror = () => (img.src = images.placeholder);

    const body = document.createElement('div');
    body.className = 'rec-body';

    const title = document.createElement('h4');
    title.textContent = item.name;
    const desc = document.createElement('p');
    desc.textContent = item.desc;
    const price = document.createElement('div');
    price.className = 'rec-price';
    price.textContent = item.price;

    body.append(title, desc, price);
    card.append(img, body);
    wrap.appendChild(card);
  });
}

function startMarquee(viewport, strip) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    viewport.style.overflowX = 'auto';
  }
  let halfWidth = 0;
  let speed = 20; // initial value, recalculated
  let lastTime = null;
  let paused = false;
  let scrollPos = 0;

  const recalc = () => {
    halfWidth = strip.scrollWidth / 2 || 1;
    speed = halfWidth / 50; // full loop in ~50s
    scrollPos = scrollPos % halfWidth;
    viewport.scrollLeft = scrollPos;
  };

  const imagesInStrip = strip.querySelectorAll('img');
  imagesInStrip.forEach((img) => img.addEventListener('load', recalc));

  recalc();
  window.addEventListener('resize', recalc);

  if (!reduceMotion) {
    const step = (ts) => {
      if (paused) {
        lastTime = ts;
        requestAnimationFrame(step);
        return;
      }
      if (lastTime === null) lastTime = ts;
      const delta = (ts - lastTime) / 1000;
      scrollPos += speed * delta;
      if (scrollPos >= halfWidth) scrollPos -= halfWidth;
      viewport.scrollLeft = scrollPos;
      lastTime = ts;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const pause = () => (paused = true);
  const resume = () => (paused = false);

  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resume);

  let isDragging = false;
  let startX = 0;
  let startScroll = 0;
  let pointerId = null;

  viewport.addEventListener('pointerdown', (e) => {
    pointerId = e.pointerId;
    viewport.setPointerCapture(pointerId);
    isDragging = true;
    paused = true;
    startX = e.clientX;
    startScroll = scrollPos;
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startX;
    scrollPos = startScroll - delta;
    while (scrollPos < 0) scrollPos += halfWidth;
    while (scrollPos >= halfWidth) scrollPos -= halfWidth;
    viewport.scrollLeft = scrollPos;
  });

  const endDrag = (e) => {
    if (pointerId !== null) viewport.releasePointerCapture(pointerId);
    isDragging = false;
    paused = false;
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
}

function setupNav() {
  if (!toggle || !nav) return;
  nav.dataset.open = 'false';

  toggle.addEventListener('click', () => {
    const isOpen = nav.dataset.open === 'true';
    nav.dataset.open = (!isOpen).toString();
    toggle.setAttribute('aria-expanded', (!isOpen).toString());
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 700) {
        nav.dataset.open = 'false';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

function init() {
  setHeroBackground();
  buildMarquee();
  buildFeatured();
  setupNav();
  setupSmoothScroll();
  setYear();
}

init();
