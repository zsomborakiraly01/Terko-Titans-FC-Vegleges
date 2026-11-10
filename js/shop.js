/**
 * shop.js – a termékek megjelenítése adatból (PRODUCTS_DATA).
 *
 *  #featured-products  -> főoldali kiemelt termékek
 *  #shop-grid          -> Merch Shop lista (keresés, kategória, rendezés)
 *  #product-detail     -> termékoldal (termek.html?id=...)
 */
(function (global) {
    'use strict';

    const { esc, formatPrice } = global.TT;
    const CATEGORY_LABEL = (key) => PRODUCT_CATEGORIES[key] || key;
    const detailUrl = (p) => 'termek.html?id=' + encodeURIComponent(p.id);

    /* ---------- Termékkártya ---------- */
    function productCard(p, colClass) {
        return (
            '<div class="' + (colClass || 'col-6 col-md-4 col-xl-3') + '">' +
            '<article class="titan-card hoverable product-card">' +
            '<a class="product-media" href="' + detailUrl(p) + '" tabindex="-1" aria-hidden="true">' +
            '<img src="' + esc(p.img) + '" alt="" width="640" height="640" loading="lazy" decoding="async">' +
            '<span class="product-model">' + esc(p.model) + '</span></a>' +
            '<div class="product-body">' +
            '<span class="product-cat">' + esc(CATEGORY_LABEL(p.category)) + '</span>' +
            '<h3 class="product-title"><a href="' + detailUrl(p) + '">' + esc(p.title) + '</a></h3>' +
            '<p class="product-sub">' + esc(p.subtitle) + '</p>' +
            '<div class="product-foot">' +
            '<div class="d-flex justify-content-between align-items-center">' +
            '<span class="product-price">' + formatPrice(p.price) + '</span>' +
            '<a class="small fw-semibold text-decoration-none" href="' + detailUrl(p) + '">Részletek <i class="bi bi-arrow-right" aria-hidden="true"></i></a></div>' +
            '<button type="button" class="btn btn-titan-primary btn-sm w-100" data-add-to-cart="' + esc(p.id) + '">' +
            '<i class="bi bi-cart-plus me-1" aria-hidden="true"></i>Kosárba</button>' +
            '</div></div></article></div>'
        );
    }

    /* ---------- Főoldal: kiemelt termékek ---------- */
    function initFeatured() {
        const host = document.getElementById('featured-products');
        if (!host) return;
        const ids = (host.dataset.ids || '').split(',').map((s) => s.trim()).filter(Boolean);
        const picks = ids.map((id) => PRODUCTS_DATA.find((p) => p.id === id)).filter(Boolean);
        host.innerHTML = picks.map((p) => productCard(p, 'col-6 col-lg-3')).join('');
    }

    /* ---------- Merch Shop lista ---------- */
    const SORTERS = {
        default: null,
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'name': (a, b) => a.title.localeCompare(b.title, 'hu'),
    };
    const normalize = (s) => s.toLocaleLowerCase('hu').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    function initShop() {
        const grid = document.getElementById('shop-grid');
        if (!grid) return;

        const search = document.getElementById('shop-search');
        const sort = document.getElementById('shop-sort');
        const pills = document.getElementById('shop-filters');
        const countEl = document.getElementById('shop-count');
        const empty = document.getElementById('shop-empty');
        const params = new URLSearchParams(location.search);
        const state = {
            cat: PRODUCT_CATEGORIES[params.get('kat')] ? params.get('kat') : 'all',
            q: params.get('q') || '',
            sort: SORTERS[params.get('rendez')] !== undefined ? params.get('rendez') : 'default',
        };

        // Kategória-gombok
        const counts = PRODUCTS_DATA.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
        const pillDefs = [['all', 'Mind', PRODUCTS_DATA.length]].concat(Object.keys(PRODUCT_CATEGORIES).map((k) => [k, PRODUCT_CATEGORIES[k], counts[k] || 0]));
        pills.innerHTML = pillDefs.map((d) =>
            '<button type="button" class="filter-pill" data-cat="' + d[0] + '" aria-pressed="false">' + esc(d[1]) + '<span class="n">' + d[2] + '</span></button>'
        ).join('');

        function apply() {
            const q = normalize(state.q.trim());
            let list = PRODUCTS_DATA.filter((p) =>
                (state.cat === 'all' || p.category === state.cat) &&
                (!q || normalize([p.title, p.subtitle, p.model, p.description].join(' ')).includes(q))
            );
            if (SORTERS[state.sort]) list = list.slice().sort(SORTERS[state.sort]);

            grid.innerHTML = list.map((p) => productCard(p)).join('');
            empty.hidden = list.length > 0;
            countEl.textContent = list.length + ' termék';
            pills.querySelectorAll('.filter-pill').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat)));

            // Az állapotot az URL-ben is tároljuk, így megosztható / frissítés után is megmarad.
            const next = new URLSearchParams();
            if (state.cat !== 'all') next.set('kat', state.cat);
            if (state.q.trim()) next.set('q', state.q.trim());
            if (state.sort !== 'default') next.set('rendez', state.sort);
            const qs = next.toString();
            history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
        }

        search.value = state.q;
        sort.value = state.sort;
        search.addEventListener('input', () => { state.q = search.value; apply(); });
        sort.addEventListener('change', () => { state.sort = sort.value; apply(); });
        pills.addEventListener('click', (e) => {
            const b = e.target.closest('.filter-pill');
            if (b) { state.cat = b.dataset.cat; apply(); }
        });
        document.getElementById('shop-reset').addEventListener('click', () => {
            state.cat = 'all'; state.q = ''; state.sort = 'default';
            search.value = ''; sort.value = 'default'; apply();
        });
        apply();
    }

    /* ---------- Termékoldal ---------- */
    function initDetail() {
        const host = document.getElementById('product-detail');
        if (!host) return;
        const id = new URLSearchParams(location.search).get('id');
        const p = PRODUCTS_DATA.find((x) => x.id === id);
        const crumb = document.getElementById('product-breadcrumb-title');

        if (!p) {
            document.title = 'A termék nem található - Térkő Titánok FC';
            crumb.textContent = 'Nem található';
            host.innerHTML =
                '<div class="text-center py-5"><i class="bi bi-emoji-frown display-1 text-muted" aria-hidden="true"></i>' +
                '<h1 class="h3 fw-bold mt-3">Ez a termék nem található</h1>' +
                '<p class="text-muted">Lehet, hogy elavult linket használtál. Nézz körül a kínálatunkban!</p>' +
                '<a class="btn btn-titan-primary" href="merch.html"><i class="bi bi-shop me-2" aria-hidden="true"></i>Vissza a Merch Shopba</a></div>';
            return;
        }

        document.title = p.title + ' - Térkő Titánok FC Merch';
        crumb.textContent = p.title;
        host.innerHTML =
            '<div class="row g-4 g-lg-5 align-items-start">' +
            '<div class="col-lg-6"><div class="detail-media mb-3">' +
            '<span class="product-model" style="font-size:.8rem">Modell: ' + esc(p.model) + '</span>' +
            '<img src="' + esc(p.img) + '" alt="' + esc(p.title) + '" width="640" height="640"></div>' +
            '<div class="row g-2 row-cols-1 row-cols-sm-3">' +
            trust('shield-check', '100% eredeti', 'Hivatalos klubtermék') +
            trust('truck', 'Gyors szállítás', '1–2 munkanap') +
            trust('geo-alt', 'Raktáron', 'Hajdúböszörmény') + '</div></div>' +
            '<div class="col-lg-6">' +
            '<span class="eyebrow">' + esc(CATEGORY_LABEL(p.category)) + '</span>' +
            '<h1 class="fw-bold h2 mb-1">' + esc(p.title) + '</h1>' +
            '<p class="lead text-muted mb-3">' + esc(p.subtitle) + '</p>' +
            '<div class="d-flex align-items-center flex-wrap gap-3 mb-4"><span class="detail-price">' + formatPrice(p.price) + '</span>' +
            '<span class="badge text-bg-light border p-2"><i class="bi bi-check-circle-fill text-success me-1" aria-hidden="true"></i>ÁFÁ-t tartalmazza</span></div>' +
            '<div class="callout mb-4"><h2 class="h6 fw-bold mb-2">Termékleírás</h2><p class="mb-0 text-secondary">' + esc(p.description) + '</p></div>' +
            '<div class="d-flex flex-wrap align-items-end gap-3 mb-4">' +
            '<div><label class="form-label mb-1" for="detail-qty">Mennyiség</label>' +
            '<div class="qty-stepper"><button type="button" id="qty-dec" aria-label="Kevesebb">−</button>' +
            '<input type="number" id="detail-qty" value="1" min="1" max="99" inputmode="numeric">' +
            '<button type="button" id="qty-inc" aria-label="Több">+</button></div></div>' +
            '<button type="button" class="btn btn-titan-primary btn-lg flex-grow-1" data-add-to-cart="' + esc(p.id) + '" data-qty-input="detail-qty">' +
            '<i class="bi bi-cart-plus-fill me-2" aria-hidden="true"></i>Kosárba teszem</button></div>' +
            '<div class="accordion" id="specs"><div class="accordion-item"><h2 class="accordion-header">' +
            '<button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#specsBody" aria-expanded="false" aria-controls="specsBody">' +
            '<i class="bi bi-box-seam me-2 text-success" aria-hidden="true"></i>Specifikáció és szállítás</button></h2>' +
            '<div id="specsBody" class="accordion-collapse collapse" data-bs-parent="#specs"><div class="accordion-body small text-muted">' +
            '<p class="mb-1"><strong>Gyártó:</strong> Térkő Titánok FC Hivatalos Műhely</p>' +
            '<p class="mb-1"><strong>Szállítás:</strong> 1–2 munkanapon belül futárszolgálattal, vagy ingyenes átvétel a hajdúböszörményi Titans Arénában.</p>' +
            '<p class="mb-0"><strong>Garancia:</strong> DENSO &amp; Gino Barbershop minőségbiztosítási garancia.</p></div></div></div></div>' +
            '<a href="merch.html" class="btn btn-titan-outline mt-4"><i class="bi bi-arrow-left me-2" aria-hidden="true"></i>Vissza a Merch Shopba</a>' +
            '</div></div>';

        // Mennyiségválasztó
        const qty = document.getElementById('detail-qty');
        const clamp = () => { qty.value = Math.max(1, Math.min(99, parseInt(qty.value, 10) || 1)); };
        document.getElementById('qty-dec').addEventListener('click', () => { qty.value = (parseInt(qty.value, 10) || 1) - 1; clamp(); });
        document.getElementById('qty-inc').addEventListener('click', () => { qty.value = (parseInt(qty.value, 10) || 1) + 1; clamp(); });
        qty.addEventListener('change', clamp);

        // Ajánlott termékek: először ugyanabból a kategóriából
        const rec = document.getElementById('recommended-products-row');
        if (rec) {
            const others = PRODUCTS_DATA.filter((x) => x.id !== p.id);
            const picks = others.filter((x) => x.category === p.category).concat(others.filter((x) => x.category !== p.category)).slice(0, 4);
            rec.innerHTML = picks.map((x) => productCard(x, 'col-6 col-lg-3')).join('');
        }
    }

    function trust(icon, title, text) {
        return '<div class="col"><div class="trust-item"><i class="bi bi-' + icon + '" aria-hidden="true"></i><strong>' + title + '</strong><span class="d-block text-muted">' + text + '</span></div></div>';
    }

    // A termékszámot jelző elemek (pl. "27 termék") adatból töltődnek – nincs kézzel írt szám.
    function initCounters() {
        document.querySelectorAll('[data-product-count]').forEach((el) => { el.textContent = PRODUCTS_DATA.length; });
    }

    initCounters();
    initFeatured();
    initShop();
    initDetail();
})(window);
