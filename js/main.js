(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SITE = window.SITE || {};
  const WORKS = window.WORKS || [];
  const REVIEWS = window.REVIEWS || [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CATS = { kitchens: 'Кухня', wardrobes: 'Шкафы и прихожие', kids: 'Детская / рабочая зона' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Контакты из config.js ---------- */
  const phoneHref = (SITE.phone || '').replace(/[^\d+]/g, '');
  $$('[data-phone]').forEach(el => {
    if (!phoneHref) { (el.closest('[data-phone-wrap]') || el).hidden = true; return; }
    el.textContent = SITE.phone;
    el.href = 'tel:' + phoneHref;
  });
  $$('[data-link]').forEach(el => {
    const url = SITE[el.dataset.link];
    if (url && url !== '#') { el.href = url; el.target = '_blank'; el.rel = 'noopener'; }
  });
  $$('[data-hours]').forEach(el => { if (SITE.hours) el.textContent = SITE.hours; });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Шапка: стекло при прокрутке, прячется вниз / появляется вверх ---------- */
  const header = $('.header');
  const fab = $('#fab');
  const toTop = $('.to-top');
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const menuOpen = document.body.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > 500);
    fab.classList.toggle('is-away', y < window.innerHeight * 0.7);
    toTop.classList.toggle('is-visible', y > window.innerHeight * 1.2);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);
  onScroll();

  /* ---------- Мобильное меню ---------- */
  const burger = $('.burger');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Появление блоков при прокрутке ---------- */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  const observeReveal = root => $$('[data-reveal]', root).forEach(el => revealIO.observe(el));
  observeReveal(document);

  /* ---------- Счётчики: цифры «бегут» каждый раз, когда появляются на экране ----------
     data-count — итоговое число, data-from — с какого начинать (по умолчанию 0),
     поэтому можно считать и вверх (0 → 10), и вниз (2 000 → 0) */
  const fmt = (v, el) => Math.round(v).toLocaleString('ru-RU') + (el.dataset.suffix || '');
  const runCount = el => {
    const from = +(el.dataset.from || 0), to = +el.dataset.count;
    const token = (el._run = (el._run || 0) + 1);
    const delay = 450, dur = 2000;
    el.textContent = fmt(from, el);
    setTimeout(() => {
      const t0 = performance.now();
      const tick = now => {
        if (el._run !== token) return;
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(from + (to - from) * (1 - Math.pow(1 - p, 3)), el);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    // страховка: если браузер приостановил анимацию (свёрнутая вкладка), всё равно ставим итог
    setTimeout(() => { if (el._run === token) el.textContent = fmt(to, el); }, delay + dur + 300);
  };
  const counters = $$('[data-count]');
  if (!reduceMotion) {
    counters.forEach(el => { el.textContent = fmt(+(el.dataset.from || 0), el); });
    const countIO = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) runCount(e.target); });
    }, { threshold: 0.6 });
    counters.forEach(el => countIO.observe(el));
  }

  /* ---------- «Жидкий» блик на стеклянных плашках за курсором ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    let raf = 0, ev = null;
    document.addEventListener('pointermove', e => {
      ev = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const g = ev.target.closest && ev.target.closest('.glass');
        if (!g) return;
        const r = g.getBoundingClientRect();
        g.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        g.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    }, { passive: true });
  }

  /* ---------- Слайдеры (стрелки + перетаскивание мышью) ---------- */
  const initSlider = root => {
    const track = $('.slider__track', root);
    const id = root.dataset.slider;
    const prev = $(`[data-prev="${id}"]`), next = $(`[data-next="${id}"]`);
    const step = () => {
      const card = track.children[0];
      return card ? card.getBoundingClientRect().width + 20 : 320;
    };
    const update = () => {
      if (prev) prev.disabled = track.scrollLeft < 5;
      if (next) next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 5;
    };
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    let down = false, moved = false, startX = 0, startLeft = 0;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-drag'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (moved) {
        // плавно доводим до ближайшей карточки
        const s = step();
        const target = Math.round(track.scrollLeft / s) * s;
        track.classList.remove('is-drag');
        track.scrollTo({ left: target, behavior: 'smooth' });
      }
    });
    // если тащили — не считаем это кликом по карточке
    track.addEventListener('click', e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  };

  /* ---------- Отзывы ---------- */
  const reviewsTrack = $('#reviewsTrack');
  if (REVIEWS.length && reviewsTrack) {
    reviewsTrack.innerHTML = REVIEWS.map(file =>
      `<figure class="review"><img src="img/reviews/${esc(file)}" alt="Отзыв клиента" loading="lazy" draggable="false"></figure>`).join('');
    $('#reviews').hidden = false;
  }
  $$('[data-slider]').forEach(initSlider);

  /* ---------- Портфолио ---------- */
  const grid = $('#worksGrid');
  let currentFilter = 'all';
  grid.innerHTML = WORKS.map((w, i) => `
    <figure class="work" data-cat="${esc(w.cat)}" data-wide="${w.wide ? 1 : 0}" data-reveal style="--d:${(i % 4) * 0.06}s">
      <button class="work__btn" type="button" data-index="${i}" aria-label="Открыть фото: ${esc(w.title)}">
        <img src="img/works/thumb/${esc(w.file)}" data-thumb="img/works/thumb/${esc(w.file)}" data-full="img/works/${esc(w.file)}" alt="${esc(w.title)}" loading="lazy">
      </button>
      <figcaption class="work__cap glass"><small>${esc(CATS[w.cat] || '')}</small>${esc(w.title)}</figcaption>
    </figure>`).join('');
  observeReveal(grid);

  // Заполняем сетку без пустых мест: если в последнем ряду не хватает плиток,
  // растягиваем на 2 колонки нужное число фото (сначала горизонтальные, ближе к началу)
  const layoutWorks = () => {
    const cols = parseInt(getComputedStyle(grid).getPropertyValue('--cols'), 10) || 3;
    const items = $$('.work', grid).filter(f => !f.hidden);
    items.forEach(f => f.classList.remove('is-wide'));
    let extra = (cols - items.length % cols) % cols;
    const pool = items.length > cols ? items.slice(0, -1) : items;
    const candidates = pool
      .map((f, i) => ({ f, i, rank: f.dataset.wide === '1' ? 0 : 1 }))
      .sort((a, b) => a.rank - b.rank || a.i - b.i);
    for (const c of candidates) {
      if (!extra) break;
      c.f.classList.add('is-wide');
      extra--;
    }
    // широким плиткам — большое фото, остальным — уменьшенное
    items.forEach(f => {
      const img = $('img', f);
      const want = f.classList.contains('is-wide') ? img.dataset.full : img.dataset.thumb;
      if (img.getAttribute('src') !== want) img.src = want;
    });
  };

  const applyFilter = cat => {
    currentFilter = cat;
    $$('.filter').forEach(b => {
      const on = b.dataset.filter === cat;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $$('.work', grid).forEach(f => {
      f.hidden = !(cat === 'all' || f.dataset.cat === cat);
      if (!f.hidden) f.classList.add('is-in');
    });
    layoutWorks();
  };
  layoutWorks();
  let resizeT = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(layoutWorks, 150); });
  $$('.filter').forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));
  // клик по карточке «Что делаем» — открываем нужный раздел портфолио
  $$('.service[data-filter]').forEach(card => card.addEventListener('click', () => applyFilter(card.dataset.filter)));

  /* ---------- Просмотр фото (лайтбокс) ---------- */
  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount');
  let list = [], pos = 0;
  const show = () => {
    const w = WORKS[list[pos]];
    lbImg.src = 'img/works/' + w.file;
    lbImg.alt = w.title;
    lbCap.textContent = w.title;
    lbCount.textContent = `${pos + 1} / ${list.length}`;
  };
  const go = d => { pos = (pos + d + list.length) % list.length; show(); };
  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-index]');
    if (!btn) return;
    const idx = +btn.dataset.index;
    list = WORKS.map((_, i) => i).filter(i => currentFilter === 'all' || WORKS[i].cat === currentFilter);
    pos = Math.max(0, list.indexOf(idx));
    show();
    lb.showModal();
  });
  lb.addEventListener('click', e => {
    const act = e.target.closest('[data-lb]');
    if (act) {
      if (act.dataset.lb === 'close') lb.close();
      if (act.dataset.lb === 'prev') go(-1);
      if (act.dataset.lb === 'next') go(1);
      return;
    }
    if (e.target === lb || e.target.classList.contains('lightbox__fig')) lb.close();
  });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX = null;
  });

  /* ---------- Вопросы: открыт только один ---------- */
  $$('.qa').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) $$('.qa').forEach(o => { if (o !== d) o.open = false; });
  }));

  /* ---------- Плавающая кнопка ---------- */
  const fabToggle = $('.fab__toggle');
  fabToggle.addEventListener('click', () => {
    const open = fab.classList.toggle('is-open');
    fabToggle.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Форма заявки ---------- */
  const form = $('#leadForm');
  const phone = form.elements.phone;
  const status = $('#formStatus');
  const consent = form.elements.consent;
  const consentLabel = $('#consentLabel');

  phone.addEventListener('input', e => {
    phone.classList.remove('is-error');
    if (e.inputType && e.inputType.startsWith('delete')) return;
    let d = phone.value.replace(/\D/g, '');
    if (!d) { phone.value = ''; return; }
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    const p = d.slice(1, 11);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ') ' + p.slice(3, 6);
    if (p.length >= 6) out += '-' + p.slice(6, 8);
    if (p.length >= 8) out += '-' + p.slice(8, 10);
    phone.value = out;
  });
  phone.addEventListener('blur', () => { if (phone.value.replace(/\D/g, '').length <= 1) phone.value = ''; });
  consent.addEventListener('change', () => consentLabel.classList.remove('is-error'));

  const messengerLinks = () => {
    const links = [];
    if (SITE.telegram && SITE.telegram !== '#') links.push(`<a href="${esc(SITE.telegram)}" target="_blank" rel="noopener">Telegram</a>`);
    if (SITE.max && SITE.max !== '#') links.push(`<a href="${esc(SITE.max)}" target="_blank" rel="noopener">MAX</a>`);
    if (phoneHref) links.push(`позвоните: <a href="tel:${esc(phoneHref)}">${esc(SITE.phone)}</a>`);
    return links.length ? ' Напишите нам в ' + links.join(' или ') + '.' : '';
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';
    let ok = true;
    if (phone.value.replace(/\D/g, '').length !== 11) { phone.classList.add('is-error'); ok = false; }
    if (!consent.checked) { consentLabel.classList.add('is-error'); ok = false; }
    if (!ok) {
      status.classList.add('is-err');
      status.textContent = !consent.checked && phone.classList.contains('is-error')
        ? 'Введите телефон полностью и отметьте согласие на обработку данных.'
        : phone.classList.contains('is-error') ? 'Введите номер телефона полностью.' : 'Отметьте согласие на обработку данных.';
      return;
    }
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    status.textContent = 'Отправляем…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'send_failed');
      form.reset();
      status.classList.add('is-ok');
      status.textContent = 'Спасибо! Заявка отправлена — мы свяжемся с вами в рабочее время.';
    } catch (err) {
      status.classList.add('is-err');
      status.innerHTML = 'Не получилось отправить заявку.' + messengerLinks();
    } finally {
      btn.disabled = false;
    }
  });
})();
