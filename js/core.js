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

    global.TT = { NAV_ITEMS, esc, formatPrice, toast };
    mountLayout();
})(window);
