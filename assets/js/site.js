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

/* === ABRUZZO CHE VIAGGI · PATCH ZERO-HTML · SCHEDA AI DENTRO LA CARD ===
   Richiede: assets/js/schede-ai.js
*/
(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-ai-src="' + src + '"]');
      if (existing) {
        if (existing.dataset.loaded === "1") return resolve();
        existing.addEventListener("load", function () { resolve(); }, { once: true });
        existing.addEventListener("error", function () {
          reject(new Error("Errore caricamento " + src));
        }, { once: true });
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

  function closePanel() {
    document.querySelectorAll(".ai-floating-panel").forEach(function (panel) {
      panel.hidden = true;
      panel.classList.remove("is-visible");
    });

    document.querySelectorAll(".carditem.ai-active").forEach(function (card) {
      card.classList.remove("ai-active");
    });
  }

function buildQuery(record) {
  const percorso = (record.percorso || "").toLowerCase().trim();
  const titolo = (record.titolo || "").trim();
  const tipo = (record.tipo || "").trim();

  if (
    percorso === "città e borghi" ||
    percorso === "citta e borghi" ||
    percorso === "citta-borghi"
  ) {
    return `${titolo} comune`.trim();
  }

  if (percorso === "castelli") {
    return `${tipo} ${titolo}`.trim();
  }

if (percorso === "medievale") {
  return `${tipo} ${titolo}`.trim();
}

if (percorso === "barocco") {
  return `${tipo} ${titolo}`.trim();
}

  if (percorso === "archeologico") {
    return `${tipo} ${titolo}`.trim();
  }

if (percorso === "dannunziano") {
  return `D'Annunzio ${tipo} ${titolo}`.trim();
}

  if (percorso === "artigianato") {
    return `artigianato ${tipo} ${titolo}`.trim();
  }

  if (
    percorso === "eventi e tradizioni" ||
    percorso === "eventi-tradizioni" ||
    percorso === "eventi-e-tradizioni"
  ) {
    return `${titolo}`.trim();
  }

  if (
    percorso === "mare e costa" ||
    percorso === "mare" ||
    percorso === "costa"
  ) {
    return `${titolo}`.trim();
  }

  if (
    percorso === "montagna e parchi" ||
    percorso === "montagna" ||
    percorso === "montagna-parchi"
  ) {
    return `${titolo}`.trim();
  }

  if (
    percorso === "trekking & mtb" ||
    percorso === "trekking e mtb" ||
    percorso === "trekking-mtb"
  ) {
    return `${titolo} ${tipo}`.trim();
  }

  if (
    percorso === "itinerari misti" ||
    percorso === "misto" ||
    percorso === "itinerari-misti"
  ) {
    return `${tipo} ${titolo} itinerario`.trim();
  }

  return `${tipo} ${titolo}`.trim();
}

function buildWikiLink(record, query) {
  return "https://it.wikipedia.org/w/index.php?search=" + encodeURIComponent(query);
}

  function openForCard(card) {
    const img = card.querySelector(".media img");
    if (!img) return;

    const src = img.getAttribute("src") || "";
    const record = getSchedaByImg(src);
    if (!record || !record.scheda) return;

    let panel = card.querySelector(".ai-floating-panel");

    if (!panel) {
      panel = document.createElement("div");
      panel.className = "ai-floating-panel";
      panel.hidden = true;
      panel.innerHTML = '<div class="ai-floating-panel-inner"><p class="ai-floating-text"></p></div>';
      card.appendChild(panel);
    }

    const text = panel.querySelector(".ai-floating-text");
    const query = buildQuery(record);
    const q = encodeURIComponent(query);
    const wikiLink = buildWikiLink(record, query);

    let html = "";

    html += `
      <div class="ai-more">
        <a href="${wikiLink}" target="_blank" rel="noopener noreferrer">Wikipedia</a>
        <span class="ai-sep">|</span>
        <a href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener noreferrer">Google Maps</a>
        <span class="ai-sep">|</span>
        <a href="https://www.google.com/search?tbm=isch&q=${q}" target="_blank" rel="noopener noreferrer">Cerca immagini</a>
      </div>
    `;

    text.innerHTML = html;

    document.querySelectorAll(".carditem.ai-active").forEach(function (el) {
      if (el !== card) el.classList.remove("ai-active");
    });

    document.querySelectorAll(".ai-floating-panel").forEach(function (otherPanel) {
      if (otherPanel !== panel) {
        otherPanel.hidden = true;
        otherPanel.classList.remove("is-visible");
      }
    });

    card.classList.add("ai-active");
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

    card.addEventListener("mouseleave", function () {
      if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
        closePanel();
      }
    });

    card.addEventListener("click", function (ev) {
      const ignored = ev.target.closest("a, button, input, select, textarea, label");
      if (ignored) return;

      if (window.matchMedia("(hover:none), (pointer:coarse)").matches) {
        const panel = card.querySelector(".ai-floating-panel");

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

  function initAiFloatingPanel() {
    enhanceAll();

    const cardsRoot = document.querySelector("#cards");
    if (!cardsRoot) return;

    const observer = new MutationObserver(function () {
      enhanceAll();
    });
    observer.observe(cardsRoot, { childList: true, subtree: true });

    document.addEventListener("click", function (ev) {
      const insideCard = ev.target.closest(".carditem");
      const insidePanel = ev.target.closest(".ai-floating-panel");
      if (!insideCard && !insidePanel) closePanel();
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closePanel();
    });
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