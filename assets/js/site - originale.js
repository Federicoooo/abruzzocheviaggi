document.addEventListener("DOMContentLoaded", () => {
  // 1) Carica i partials
  const includes = document.querySelectorAll("[data-include]");
  const loaders = [];

  includes.forEach(el => {
    const file = "partials/" + el.getAttribute("data-include") + ".html";
    loaders.push(
      fetch(file)
        .then(r => r.text())
        .then(html => { el.innerHTML = html; })
    );
  });

  Promise.all(loaders).then(() => {

    // 0) anno automatico footer (ora che il footer esiste)
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();

    // 2) Attiva menu mobile (ora l'header esiste)
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    // 3) Cookie banner (come prima, invariato)
    const key = 'acv_cookie_ok_v1';
    if (localStorage.getItem(key) === '1') return;

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
  });
});

