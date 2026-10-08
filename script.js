(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem('jr26-' + k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('jr26-' + k, JSON.stringify(v)); } catch {} }
  };

  /* Toast */
  const toast = $('#toast'); let tt;
  const notify = msg => { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 3200); };

  /* Compte à rebours : 27/11/2026 9 h (heure de Paris) */
  const target = Date.UTC(2026, 10, 27, 8, 0, 0);
  const cd = $('#countdown');
  const tick = () => {
    let diff = target - Date.now();
    if (diff <= 0) { cd.innerHTML = '<p>🎉 C’est le grand jour !</p>'; return; }
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4);
    $('[data-cd="d"]').textContent = d; $('[data-cd="h"]').textContent = h; $('[data-cd="m"]').textContent = m;
  };
  tick(); setInterval(tick, 30000);

  const embedded = new URLSearchParams(location.search).has('embed') || window.self !== window.top;

  /* Visionneuse (dans un iframe : ouverture dans un nouvel onglet) */
  const lb = $('#lightbox'), lbImg = $('#lb-img'), lbDl = $('#lb-dl');
  $$('.zoom').forEach(b => b.addEventListener('click', () => {
    lbImg.src = b.dataset.src; lbImg.alt = b.dataset.title;
    $('#lb-title').textContent = b.dataset.title;
    lbDl.href = b.dataset.src; lbDl.setAttribute('download', 'JR2026-usagers-' + b.dataset.src);
    if (lb.showModal && !embedded) lb.showModal(); else window.open(b.dataset.src, '_blank');
  }));
  $('.lb-close').addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });

  /* Filtres supports */
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    $$('.chip').forEach(x => x.classList.toggle('active', x === c));
    const f = c.dataset.filter;
    $$('#supports [data-cat]').forEach(el => el.classList.toggle('is-hidden', f !== 'all' && el.dataset.cat !== f));
  }));

  /* Onglets textes */
  const tabs = $$('[role="tab"]');
  const select = t => tabs.forEach(x => {
    const on = x === t;
    x.classList.toggle('active', on); x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
    $('#' + x.getAttribute('aria-controls')).hidden = !on;
  });
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      select(n); n.focus();
    });
  });

  /* Personnalisation des textes */
  const marks = $$('mark[data-field]');
  marks.forEach(m => m.dataset.ph = m.textContent);
  const fields = { msp: $('#in-msp'), contact: $('#in-contact') };
  const apply = () => marks.forEach(m => {
    const v = fields[m.dataset.field].value.trim();
    m.textContent = v || m.dataset.ph; m.classList.toggle('filled', !!v);
  });
  Object.entries(fields).forEach(([k, input]) => {
    input.value = store.get('f-' + k) || '';
    input.addEventListener('input', () => { store.set('f-' + k, input.value); input.classList.remove('missing'); apply(); });
  });
  apply();

  /* Copie */
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const el = document.getElementById(btn.dataset.copy);
    const left = el.innerText.includes('[');
    try {
      await navigator.clipboard.writeText(el.innerText);
      btn.textContent = '✅ Texte copié';
      if (!fields.contact.value.trim()) { fields.contact.classList.add('missing'); notify('Copié ! ⚠️ Ajoutez le contact pour les inscriptions avant de diffuser.'); }
      else notify(left ? 'Copié ! Pensez à compléter les éléments entre crochets.' : 'Texte copié, prêt à coller !');
      setTimeout(() => btn.textContent = '📋 Copier le texte', 3000);
    } catch {
      const r = document.createRange(); r.selectNodeContents(el);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
      notify('Texte sélectionné : utilisez Copier sur votre appareil.');
    }
  }));

  /* Checklist */
  const boxes = $$('.checks input');
  const saved = store.get('checks') || {};
  const update = () => {
    const n = boxes.filter(b => b.checked).length;
    $('#progress-bar').style.width = (n / boxes.length * 100) + '%';
    $('#progress-label').textContent = `${n} / ${boxes.length} étapes`;
    $('#done-msg').hidden = n !== boxes.length;
  };
  boxes.forEach(b => {
    b.checked = !!saved[b.dataset.k];
    b.addEventListener('change', () => { saved[b.dataset.k] = b.checked; store.set('checks', saved); update(); if (b.checked && boxes.every(x => x.checked)) notify('🎉 Checklist terminée !'); });
  });
  update();

  /* Mode intégration : ?embed=1 → masque l’en-tête et transmet la hauteur à la page parente */
  if (embedded) {
    document.documentElement.classList.add('embed');
    const send = () => parent.postMessage({ jr26Height: document.documentElement.scrollHeight }, '*');
    new ResizeObserver(send).observe(document.body); addEventListener('load', send);
  }
})();
