/**
 * core.js – közös segédfüggvények és az oldalkeret (menü, lábléc, kosár-ablak, értesítések).
 *
 * Minden oldal ugyanezt a keretet használja, így a menüt / láblécet EGY helyen
 * kell módosítani. Az oldalak a <body data-page="..."> attribútummal jelzik,
 * melyik menüpont aktív (értékek: lásd NAV_ITEMS).
 */
(function (global) {
    'use strict';

    /* ---------- Menüpontok (ide kell új oldalt felvenni) ---------- */
    const NAV_ITEMS = [
        { page: 'home',    href: 'index.html',         icon: 'house-door',  label: 'Főoldal' },
        { page: 'squad',   href: 'eredmenyek.html',    icon: 'trophy',      label: 'Keret & Taktika' },
        { page: 'live',    href: 'meccs-kovetes.html', icon: 'broadcast',   label: 'Élő meccs' },
        { page: 'shop',    href: 'merch.html',         icon: 'shop',        label: 'Merch Shop' },
        { page: 'join',    href: 'jelentkezes.html',   icon: 'person-plus', label: 'Toborzás' },
        { page: 'contact', href: 'kapcsolat.html',     icon: 'envelope',    label: 'Kapcsolat' },
    ];

    /* ---------- Segédfüggvények ---------- */
    const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    /** HTML-escape: minden dinamikusan beszúrt szöveghez használd. */
    const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
    /** 4990 -> "4 990 Ft" (a hu-HU locale 4 számjegynél nem csoportosít, ezért kézzel formázunk) */
    const formatPrice = (n) => String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + '\u00a0Ft';

    /* ---------- Spam-védelem (kliens oldali rétegek) ----------
     * A küldés előtt minden e-mail ezen a szűrőn megy át. Beállítások: SPAM. */
    const SPAM = {
        minPageSeconds: 4,      // robotok azonnal küldenek; ember ennél tovább tölti ki
        minGapMs: 30000,        // két küldés között legalább ennyi idő
        maxPerHour: 5,          // böngészőnként óránként ennyi levél
        maxLinks: 2,            // ennél több hivatkozás = spam
        maxFieldLength: 2000,   // mezőnkénti karakterkorlát
    };
    const PAGE_LOADED = Date.now();
    const LOG_KEY = 'tt_send_log';
    const userError = (message) => Object.assign(new Error(message), { userMessage: message });

    function readLog(now) {
        try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]').filter((t) => now - t < 3600000); }
        catch (e) { return []; }
    }

    function spamGuard(fields) {
        const now = Date.now();
        if (now - PAGE_LOADED < SPAM.minPageSeconds * 1000) throw userError('Kérjük, várj néhány másodpercet a küldés előtt.');
        const log = readLog(now);
        if (log.length && now - log[log.length - 1] < SPAM.minGapMs) throw userError('Túl gyorsan küldesz. Próbáld újra fél perc múlva.');
        if (log.length >= SPAM.maxPerHour) throw userError('Elérted az óránkénti küldési korlátot. Próbáld újra később.');
        const text = Object.keys(fields).map((k) => fields[k]).join(' ');
        if ((text.match(/https?:\/\/|www\./gi) || []).length > SPAM.maxLinks) throw userError('Az üzenet túl sok hivatkozást tartalmaz, ezért nem küldhető el.');
        log.push(now);
        try { localStorage.setItem(LOG_KEY, JSON.stringify(log)); } catch (e) { /* privát mód */ }
    }

    /**
     * E-mail küldése a FormSubmit-en keresztül (lásd js/config.js).
     * fields: { 'Címke': 'érték', ... } – a levélben táblázatként jelenik meg.
     * Hibánál elutasít; a spam-szűrő hibáinak van `userMessage` mezője (megjeleníthető a látogatónak).
     */
    function sendEmail(subject, fields, replyTo) {
        const clean = {};
        Object.keys(fields).forEach((k) => { clean[k] = String(fields[k]).slice(0, SPAM.maxFieldLength); });
        try { spamGuard(clean); } catch (err) { return Promise.reject(err); }

        const body = Object.assign({ _subject: subject, _template: 'table', _captcha: 'false' }, clean);
        if (replyTo) body._replyto = String(replyTo).slice(0, 200);
        return fetch(global.TT_CONFIG.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body),
        }).then((res) => res.json().catch(() => ({})).then((data) => {
            if (!res.ok || data.success === false || data.success === 'false') {
                throw new Error(data.message || 'A küldés nem sikerült.');
            }
            return data;
        }));
    }

    function toast(message, options) {
        const opts = options || {};
        const host = document.getElementById('toast-host');
        if (!host || !global.bootstrap) return;
        host.innerHTML = ''; // egyszerre csak egy értesítés látszik, nem halmozódnak
        const el = document.createElement('div');
        el.className = 'toast toast-titan align-items-center';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-atomic', 'true');
        el.innerHTML =
            '<div class="d-flex"><div class="toast-body">' + esc(message) +
            (opts.actionLabel
                ? ' <button type="button" class="btn btn-link btn-sm p-0 ms-1 align-baseline fw-bold" data-toast-action>' + esc(opts.actionLabel) + '</button>'
                : '') +
            '</div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Bezárás"></button></div>';
        host.appendChild(el);
        const t = new bootstrap.Toast(el, { delay: opts.delay || 3500 });
        const actionBtn = el.querySelector('[data-toast-action]');
        if (actionBtn && opts.onAction) {
            actionBtn.addEventListener('click', () => { opts.onAction(); t.hide(); });
        }
        el.addEventListener('hidden.bs.toast', () => el.remove());
        t.show();
    }

    /* ---------- Keret (header / footer / kosár-ablak) ---------- */
    function headerHTML(activePage) {
        const links = NAV_ITEMS.map((n) =>
            '<li class="nav-item"><a class="nav-link' + (n.page === activePage ? ' active' : '') + '" href="' + n.href + '"' +
            (n.page === activePage ? ' aria-current="page"' : '') +
            '><i class="bi bi-' + n.icon + ' me-1" aria-hidden="true"></i>' + n.label + '</a></li>'
        ).join('');
        return (
            '<nav class="navbar navbar-expand-lg navbar-dark navbar-titan sticky-top" aria-label="Főmenü">' +
            '<div class="container">' +
            '<a class="navbar-brand d-flex align-items-center" href="index.html">' +
            '<img src="img/logo.png" alt="" class="brand-logo me-2" width="42" height="42">TÉRKŐ TITÁNOK FC</a>' +
            '<div class="d-flex align-items-center gap-2 order-lg-last ms-lg-2">' +
            '<button class="btn btn-cart-nav btn-sm px-3 py-2" type="button" data-bs-toggle="modal" data-bs-target="#cartModal" aria-label="Kosár megnyitása">' +
            '<i class="bi bi-cart-fill me-1" aria-hidden="true"></i><span class="d-none d-sm-inline">Kosár</span>' +
            '<span id="cart-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">0</span></button>' +
            '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Menü megnyitása">' +
            '<span class="navbar-toggler-icon"></span></button></div>' +
            '<div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav ms-auto align-items-lg-center">' + links + '</ul></div>' +
            '</div></nav>'
        );
    }

    function footerHTML() {
        const year = new Date().getFullYear();
        const years = year > 2026 ? '2026–' + year : '2026';
        const links = NAV_ITEMS.map((n) => '<li><a href="' + n.href + '">' + n.label + '</a></li>').join('');
        return (
            '<footer class="site-footer py-5 mt-5"><div class="container"><div class="row g-4">' +
            '<div class="col-lg-5"><h2><i class="bi bi-shield-fill-check me-2 text-accent" aria-hidden="true"></i>Térkő Titánok FC</h2>' +
            '<p class="small mb-2">Alapítva: 2026 · Otthonunk: Hajdúböszörmény, Titans Aréna (Táltos utca)</p>' +
            '<p class="small fst-italic mb-0 opacity-75">„Fiatal pulyaktól az öreg ráklokig várjuk a footballozni szerető igazi gadzsókat!”</p></div>' +
            '<div class="col-6 col-lg-3"><h2>Oldalak</h2><ul class="small">' + links + '</ul></div>' +
            '<div class="col-6 col-lg-4"><h2>Támogatóink</h2>' +
            '<p class="small mb-3"><strong>DENSO</strong><br><strong>Gino &amp; Lorenzo Barbershop</strong></p>' +
            '<div class="d-flex gap-2">' +
            '<a class="social-link" href="#" aria-label="Facebook"><i class="bi bi-facebook" aria-hidden="true"></i></a>' +
            '<a class="social-link" href="#" aria-label="Instagram"><i class="bi bi-instagram" aria-hidden="true"></i></a>' +
            '<a class="social-link" href="#" aria-label="YouTube"><i class="bi bi-youtube" aria-hidden="true"></i></a>' +
            '<a class="social-link" href="#" aria-label="TikTok"><i class="bi bi-tiktok" aria-hidden="true"></i></a>' +
            '</div></div></div>' +
            '<div class="footer-bottom text-center pt-3 mt-4">&copy; ' + years + ' Térkő Titánok FC. Minden jog fenntartva.</div>' +
            '</div></footer>'
        );
    }

    function cartModalHTML() {
        return (
            '<div class="modal fade cart-modal" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"><div class="modal-content">' +
            '<div class="modal-header"><h2 class="modal-title fs-5 fw-bold" id="cartModalLabel"><i class="bi bi-cart-check-fill text-gold me-2" aria-hidden="true"></i>Kosarad tartalma</h2>' +
            '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Bezárás"></button></div>' +
            '<div class="modal-body p-3 p-md-4">' +
            '<div data-cart-view="empty" class="text-center py-4"><i class="bi bi-cart-x display-1 text-muted" aria-hidden="true"></i>' +
            '<p class="lead mt-3 text-muted">A kosarad jelenleg üres.</p>' +
            '<a href="merch.html" class="btn btn-titan-primary mt-2">Irány a Merch Shop!</a></div>' +
            '<div data-cart-view="items" hidden><ul class="cart-lines" id="cart-lines"></ul>' +
            '<div class="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3">' +
            '<div class="fw-bold">Végösszeg: <span id="cart-total-price" class="cart-total">0 Ft</span></div>' +
            '<div class="d-flex gap-2"><button type="button" class="btn btn-outline-danger" data-cart-action="clear"><i class="bi bi-trash me-1" aria-hidden="true"></i>Ürítés</button>' +
            '<button type="button" class="btn btn-titan-primary" data-cart-action="checkout"><i class="bi bi-credit-card me-1" aria-hidden="true"></i>Megrendelés</button></div></div></div>' +
            '<div data-cart-view="checkout" hidden>' +
            '<h3 class="h5 fw-bold mb-3"><i class="bi bi-truck me-2 text-success" aria-hidden="true"></i>Szállítási és elérhetőségi adatok</h3>' +
            '<div id="checkout-summary" class="callout small mb-3"></div>' +
            '<div id="checkout-status" aria-live="polite"></div>' +
            '<form id="checkout-form" novalidate>' +
            '<input type="text" name="_honey" tabindex="-1" autocomplete="off" style="display:none" aria-hidden="true">' +
            '<div class="row g-3">' +
            '<div class="col-12"><label class="form-label" for="c-name">Teljes név</label><input id="c-name" name="name" class="form-control" required autocomplete="name"><div class="invalid-feedback">Add meg a neved.</div></div>' +
            '<div class="col-md-6"><label class="form-label" for="c-phone">Telefonszám</label><input id="c-phone" name="phone" type="tel" class="form-control" required autocomplete="tel" inputmode="tel" pattern="\\+?[0-9 \\-]{7,20}" placeholder="+36 30 123 4567"><div class="invalid-feedback">Adj meg érvényes telefonszámot.</div></div>' +
            '<div class="col-md-6"><label class="form-label" for="c-email">E-mail cím</label><input id="c-email" name="email" type="email" class="form-control" required autocomplete="email"><div class="invalid-feedback">Adj meg érvényes e-mail címet.</div></div>' +
            '<div class="col-12"><label class="form-label" for="c-delivery">Átvétel módja</label><select id="c-delivery" name="delivery" class="form-select"><option value="courier">Futárszolgálat (1–2 munkanap)</option><option value="pickup">Személyes átvétel – Titans Aréna, Táltos utca</option></select></div>' +
            '<div class="col-12 row g-3 m-0 p-0" data-address-fields>' +
            '<div class="col-md-4"><label class="form-label" for="c-zip">Irányítószám</label><input id="c-zip" name="zip" class="form-control" required autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{4}" placeholder="4220"><div class="invalid-feedback">4 számjegyű irányítószám.</div></div>' +
            '<div class="col-md-8"><label class="form-label" for="c-city">Település</label><input id="c-city" name="city" class="form-control" required autocomplete="address-level2"><div class="invalid-feedback">Add meg a települést.</div></div>' +
            '<div class="col-12"><label class="form-label" for="c-street">Utca, házszám, emelet/ajtó</label><input id="c-street" name="street" class="form-control" required autocomplete="street-address"><div class="invalid-feedback">Add meg a szállítási címet.</div></div></div>' +
            '<div class="col-12"><label class="form-label" for="c-note">Megjegyzés (méret, futárnak szóló infó stb.)</label><textarea id="c-note" name="note" class="form-control" rows="2"></textarea></div>' +
            '</div>' +
            '<div class="d-flex flex-wrap gap-2 justify-content-between mt-4">' +
            '<button type="button" class="btn btn-outline-secondary" data-cart-action="back"><i class="bi bi-arrow-left me-1" aria-hidden="true"></i>Vissza a kosárhoz</button>' +
            '<button type="submit" class="btn btn-titan-primary" id="checkout-submit"><i class="bi bi-send-check me-1" aria-hidden="true"></i>Megrendelés elküldése</button></div>' +
            '</form></div>' +
            '<div data-cart-view="success" class="text-center py-4" hidden><i class="bi bi-check-circle-fill display-1 text-success" aria-hidden="true"></i>' +
            '<h3 class="mt-3 fw-bold">Köszönjük a megrendelést!</h3>' +
            '<p class="text-muted mb-3">A Térkő Titánok FC merch csapata hamarosan feldolgozza a vásárlásodat.</p>' +
            '<button type="button" class="btn btn-titan-primary" data-bs-dismiss="modal">Bezárás</button></div>' +
            '</div></div></div></div>' +
            '<div class="toast-container position-fixed bottom-0 end-0 p-3" id="toast-host"></div>'
        );
    }

    function mountLayout() {
        const page = document.body.dataset.page || '';
        const header = document.getElementById('site-header');
        const footer = document.getElementById('site-footer');
        if (header) header.outerHTML = headerHTML(page);
        if (footer) footer.outerHTML = footerHTML() + cartModalHTML();
    }

    global.TT = { NAV_ITEMS, esc, formatPrice, toast, sendEmail };
    mountLayout();
})(window);
