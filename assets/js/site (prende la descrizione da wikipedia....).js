document.addEventListener("DOMContentLoaded", () => {
  // 1) Carica i partials
  const includes = document.querySelectorAll("[data-include]");
  const loaders = [];

  includes.forEach(el => {
    const file = "partials/" + el.getAttribute("data-include") + ".html";
    loaders.push(
      fetch(file)
        .then(r => {
          if (!r.ok) throw new Error(`Impossibile caricare ${file} (${r.status})`);
          return r.text();
        })
        .then(html => { el.innerHTML = html; })
        .catch(err => {
          console.error(err);
          el.innerHTML = "";
        })
    );
  });

  Promise.all(loaders).then(() => {

    /* =========================
       FOOTER: anno automatico
    ========================= */
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();

    /* =========================
       NAV: menu mobile + UX
    ========================= */
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');

    const closeMenu = () => {
      if (!menu || !toggle) return;
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      // Chiudi menu quando clicchi un link
      menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', closeMenu);
      });

      // Chiudi con ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
      });

      // Se torni su desktop, chiudi menu (evita stati strani)
      window.addEventListener('resize', () => {
        if (window.innerWidth > 920) closeMenu();
      });
    }

    // Evidenzia pagina corrente: aria-current="page"
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav.menu a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path) a.setAttribute('aria-current', 'page');
    });

/* =========================
   LIGHTBOX IMMAGINI (delegato)
========================= */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a.lightbox-trigger');
  if (!link) return;

  e.preventDefault();

  const src = link.getAttribute('href');

  // crea overlay
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-box" role="dialog" aria-modal="true">
      <button class="lightbox-close" type="button" aria-label="Chiudi">✕</button>
      <img src="${src}" alt="">
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.querySelector('.lightbox-close').addEventListener('click', close);

  // chiudi cliccando fuori
  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });

  // chiudi con ESC
  const onKey = (ev) => {
    if (ev.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
});

    /* =========================
       COOKIE BANNER
    ========================= */
    const key = 'acv_cookie_ok_v1';
    const alreadyOk = localStorage.getItem(key) === '1';

    if (!alreadyOk) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.left = '16px';
      el.style.right = '16px';
      el.style.bottom = '16px';
      el.style.zIndex = '9999';

      el.innerHTML = `
        <div class="card pad" style="display:flex; gap:12px; align-items:flex-start; justify-content:space-between; flex-wrap:wrap;">
          <div style="max-width:820px">
            <strong>Cookie</strong>
            <div class="small" style="color:var(--muted); margin-top:6px">
              Questo sito usa cookie tecnici necessari al funzionamento. Se in futuro attivi pubblicità o servizi di terze parti,
              verrà chiesto un consenso dedicato.
              <a href="cookie.html">Leggi l’informativa</a>.
            </div>
          </div>
          <div class="cta-row" style="margin-top:0">
            <a class="btn" href="cookie.html">Dettagli</a>
            <button class="btn primary" id="cookie-ok" type="button">Ok</button>
          </div>
        </div>
      `;

      document.body.appendChild(el);

      const okBtn = el.querySelector('#cookie-ok');
      if (okBtn) {
        okBtn.addEventListener('click', () => {
          localStorage.setItem(key, '1');
          el.remove();
        });
      }
    }
  });
});

/* === ABRUZZO CHE VIAGGI · PATCH ZERO-HTML · SCHEDA AI FLOTTANTE ===
   Richiede: assets/js/schede-ai.js
*/
(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-ai-src="' + src + '"]');
      if (existing) {
        if (existing.dataset.loaded === "1") return resolve();
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Errore caricamento " + src)), { once: true });
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.dataset.aiSrc = src;
      s.addEventListener("load", function () {
        s.dataset.loaded = "1";
        resolve();
      }, { once: true });
      s.addEventListener("error", function () {
        reject(new Error("Errore caricamento " + src));
      }, { once: true });
      document.head.appendChild(s);
    });
  }

  function getSchedaByImg(imgSrc) {
    const data = window.SCHEDE_AI || {};
    if (!imgSrc) return null;
    if (data[imgSrc]) return data[imgSrc];
    try {
      const url = new URL(imgSrc, window.location.href);
      const pathname = url.pathname.replace(/^\/+/, "");
      return data[pathname] || null;
    } catch (_) {
      return null;
    }
  }

  function ensurePanel() {
    let panel = document.getElementById("aiFloatingPanel");
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "aiFloatingPanel";
    panel.className = "ai-floating-panel";
    panel.hidden = true;
    panel.innerHTML = '<div class="ai-floating-panel-inner"><p class="ai-floating-text"></p></div>';
    document.body.appendChild(panel);
    return panel;
  }

  function closePanel() {
    const panel = document.getElementById("aiFloatingPanel");
    if (!panel) return;
    panel.hidden = true;
    panel.classList.remove("is-visible");

    document.querySelectorAll(".carditem.ai-active").forEach(function (card) {
      card.classList.remove("ai-active");
    });
  }

  function positionPanel(panel, card) {
    const rect = card.getBoundingClientRect();
    const panelWidth = Math.min(rect.width, 420);

    let left = window.scrollX + rect.left;
    let top = window.scrollY + rect.bottom + 8;

    const maxLeft = window.scrollX + document.documentElement.clientWidth - panelWidth - 12;
    if (left > maxLeft) left = maxLeft;
    if (left < 12) left = 12;

    panel.style.width = panelWidth + "px";
    panel.style.left = left + "px";
    panel.style.top = top + "px";
  }

  function openForCard(card) {
    const img = card.querySelector(".media img");
    if (!img) return;

    const src = img.getAttribute("src") || "";
    const record = getSchedaByImg(src);
    if (!record) return;

const panel = ensurePanel();
const text = panel.querySelector(".ai-floating-text");

const query = (record.wiki_query || `${record.tipo || ''} ${record.titolo || ''} Abruzzo`).trim();
const q = encodeURIComponent(query);

const mapsLink = `https://www.google.com/maps/search/?api=1&query=${q}`;
const imagesLink = `https://www.google.com/search?tbm=isch&q=${q}`;
const fallbackWiki = record.link || `https://it.wikipedia.org/w/index.php?search=${q}`;

text.innerHTML = `
  <div class="ai-desc">Caricamento…</div>
`;

fetch(
  'https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
  encodeURIComponent(query) +
  '&srlimit=1&format=json&origin=*'
)
  .then(r => r.json())
  .then(searchData => {
    const first = searchData?.query?.search?.[0];

    if (!first || !first.title) {
      text.innerHTML = `
        <div class="ai-desc">Nessuna scheda Wikipedia trovata per questo luogo.</div>
        <div class="ai-source">
          Fonte: <a href="${fallbackWiki}" target="_blank" rel="noopener noreferrer">Wikipedia</a> · CC BY-SA
        </div>
        <div class="ai-more">
          <a href="${fallbackWiki}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
          <span class="ai-sep">|</span>
          <a href="${mapsLink}" target="_blank" rel="noopener noreferrer">Google Maps</a>
          <span class="ai-sep">|</span>
          <a href="${imagesLink}" target="_blank" rel="noopener noreferrer">Cerca immagini</a>
        </div>
      `;
      return;
    }

    const title = first.title;

    return fetch(
      'https://it.wikipedia.org/api/rest_v1/page/summary/' +
      encodeURIComponent(title)
    )
      .then(r => r.json())
      .then(summaryData => {
        let txt = (summaryData.extract || '').trim();

        if (!txt) {
          txt = 'Scheda informativa non disponibile per questa voce.';
        }

        const sentences = txt.match(/[^.!?]+[.!?]+/g);
        if (sentences && sentences.length > 0) {
          txt = sentences.slice(0, 2).join(' ').trim();
        }

        if (txt.length > 280) {
          txt = txt.slice(0, 277).trimEnd() + '…';
        }

        const wikiLink =
          summaryData?.content_urls?.desktop?.page ||
          `https://it.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

        text.innerHTML = `
          <div class="ai-desc">${txt}</div>
          <div class="ai-source">
            Fonte: <a href="${wikiLink}" target="_blank" rel="noopener noreferrer">Wikipedia</a> · CC BY-SA
          </div>
          <div class="ai-more">
            <a href="${wikiLink}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
            <span class="ai-sep">|</span>
            <a href="${mapsLink}" target="_blank" rel="noopener noreferrer">Google Maps</a>
            <span class="ai-sep">|</span>
            <a href="${imagesLink}" target="_blank" rel="noopener noreferrer">Cerca immagini</a>
          </div>
        `;
      });
  })
  .catch(() => {
    text.innerHTML = `
      <div class="ai-desc">Impossibile caricare la scheda Wikipedia in questo momento.</div>
      <div class="ai-source">
        Fonte: <a href="${fallbackWiki}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
      </div>
      <div class="ai-more">
        <a href="${fallbackWiki}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
        <span class="ai-sep">|</span>
        <a href="${mapsLink}" target="_blank" rel="noopener noreferrer">Google Maps</a>
        <span class="ai-sep">|</span>
        <a href="${imagesLink}" target="_blank" rel="noopener noreferrer">Cerca immagini</a>
      </div>
    `;
  });
    document.querySelectorAll(".carditem.ai-active").forEach(function (el) {
      if (el !== card) el.classList.remove("ai-active");
    });

    card.classList.add("ai-active");
    positionPanel(panel, card);

    panel.hidden = false;
    requestAnimationFrame(function () {
      panel.classList.add("is-visible");
    });
  }

  function enhanceCard(card) {
    if (!card || card.dataset.aiEnhanced === "1") return;

    card.addEventListener("mouseenter", function () {
      if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
        openForCard(card);
      }
    });

    card.addEventListener("click", function (ev) {
      const ignored = ev.target.closest("a, button, input, select, textarea, label");
      if (ignored) return;

      if (window.matchMedia("(hover:none), (pointer:coarse)").matches) {
        const panel = document.getElementById("aiFloatingPanel");
        if (card.classList.contains("ai-active") && panel && !panel.hidden) {
          closePanel();
        } else {
          openForCard(card);
        }
      }
    });

    card.dataset.aiEnhanced = "1";
  }

  function enhanceAll() {
    document.querySelectorAll("#cards .carditem").forEach(enhanceCard);
  }

  function repositionIfOpen() {
    const panel = document.getElementById("aiFloatingPanel");
    if (!panel || panel.hidden) return;
    const active = document.querySelector(".carditem.ai-active");
    if (!active) return;
    positionPanel(panel, active);
  }

  function initAiFloatingPanel() {
    enhanceAll();

    const cardsRoot = document.querySelector("#cards");
    if (!cardsRoot) return;

    const observer = new MutationObserver(function () {
      enhanceAll();
      repositionIfOpen();
    });
    observer.observe(cardsRoot, { childList: true, subtree: true });

    document.addEventListener("click", function (ev) {
      const insideCard = ev.target.closest(".carditem");
      const insidePanel = ev.target.closest("#aiFloatingPanel");
      if (!insideCard && !insidePanel) closePanel();
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closePanel();
    });

    window.addEventListener("scroll", repositionIfOpen, { passive: true });
    window.addEventListener("resize", repositionIfOpen);
  }

  loadScript("assets/js/schede-ai.js")
    .then(function () {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAiFloatingPanel, { once: true });
      } else {
        initAiFloatingPanel();
      }
    })
    .catch(function (err) {
      console.warn("[Schede AI]", err.message);
    });
})();