/**
 * cart.js – kosár állapot (localStorage) + a kosár-ablak kirajzolása.
 *
 * A kosár csak {id, qty} párokat tárol; az árat és a nevet mindig a
 * PRODUCTS_DATA-ból olvassa, így egy árváltozás azonnal érvényesül, és a
 * kosár nem tud "elavult" adatot tartalmazni.
 *
 * Nyilvános API:  Cart.add(id, qty) · Cart.remove(id) · Cart.setQty(id, qty)
 *                 Cart.clear() · Cart.count() · Cart.total() · Cart.items()
 */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'terko_cart_v2';
    const MAX_QTY = 99;
    const { esc, formatPrice, toast } = global.TT;

    const findProduct = (id) => PRODUCTS_DATA.find((p) => p.id === id);
    const clampQty = (q) => Math.max(0, Math.min(MAX_QTY, Math.floor(Number(q)) || 0));

    let lines = load();

    function load() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            if (!Array.isArray(raw)) return [];
            return raw
                .filter((l) => l && findProduct(l.id) && clampQty(l.qty) > 0)
                .map((l) => ({ id: l.id, qty: clampQty(l.qty) }));
        } catch (e) {
            return []; // sérült vagy tiltott tárhely – üres kosárral indulunk
        }
    }

    function save() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch (e) { /* privát mód */ }
    }

    function commit() { save(); render(); }

    /* ---------- Műveletek ---------- */
    function add(id, qty) {
        const product = findProduct(id);
        if (!product) return;
        const n = clampQty(qty || 1) || 1;
        const line = lines.find((l) => l.id === id);
        if (line) line.qty = Math.min(MAX_QTY, line.qty + n);
        else lines.push({ id, qty: n });
        commit();
        bumpBadge();
        toast('„' + product.title + '” (' + n + ' db) a kosárba került.', {
            actionLabel: 'Kosár megnyitása',
            onAction: openModal,
        });
    }

    function setQty(id, qty) {
        const q = clampQty(qty);
        lines = q === 0 ? lines.filter((l) => l.id !== id) : lines.map((l) => (l.id === id ? { id, qty: q } : l));
        commit();
    }

    function remove(id) { setQty(id, 0); }
    function clear() { lines = []; commit(); }
    function count() { return lines.reduce((s, l) => s + l.qty, 0); }
    function total() { return lines.reduce((s, l) => s + findProduct(l.id).price * l.qty, 0); }

    /* ---------- Kirajzolás ---------- */
    function setView(name) {
        document.querySelectorAll('[data-cart-view]').forEach((el) => {
            el.hidden = el.dataset.cartView !== name;
        });
    }

    function render() {
        const badge = document.getElementById('cart-badge');
        const n = count();
        if (badge) {
            badge.textContent = n > 99 ? '99+' : n;
            badge.classList.toggle('d-none', n === 0);
        }
        const list = document.getElementById('cart-lines');
        if (!list) return;

        if (lines.length === 0) {
            // A sikeres megrendelés nézetet nem írjuk felül.
            const success = document.querySelector('[data-cart-view="success"]');
            if (!success || success.hidden) setView('empty');
            return;
        }
        setView('items');
        list.innerHTML = lines.map((l) => {
            const p = findProduct(l.id);
            return (
                '<li class="cart-line">' +
                '<img class="cart-thumb" src="' + esc(p.img) + '" alt="" width="56" height="56" loading="lazy">' +
                '<div class="cart-line-info"><a href="termek.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.title) + '</a>' +
                '<div class="small text-muted">' + formatPrice(p.price) + ' / db</div></div>' +
                '<div class="cart-line-side">' +
                '<div class="qty-stepper" role="group" aria-label="Mennyiség: ' + esc(p.title) + '">' +
                '<button type="button" data-cart-action="dec" data-id="' + esc(p.id) + '" aria-label="Kevesebb">−</button>' +
                '<span class="qty-val" aria-live="polite">' + l.qty + '</span>' +
                '<button type="button" data-cart-action="inc" data-id="' + esc(p.id) + '" aria-label="Több"' + (l.qty >= MAX_QTY ? ' disabled' : '') + '>+</button></div>' +
                '<div class="d-flex align-items-center gap-2"><span class="cart-line-total">' + formatPrice(p.price * l.qty) + '</span>' +
                '<button type="button" class="btn btn-sm btn-outline-danger" data-cart-action="remove" data-id="' + esc(p.id) + '" aria-label="Törlés: ' + esc(p.title) + '"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>' +
                '</div></li>'
            );
        }).join('');
        document.getElementById('cart-total-price').textContent = formatPrice(total());
    }

    function bumpBadge() {
        const btn = document.querySelector('.btn-cart-nav');
        if (!btn) return;
        btn.classList.remove('cart-bump');
        void btn.offsetWidth; // animáció újraindítása
        btn.classList.add('cart-bump');
    }

    function openModal() {
        const el = document.getElementById('cartModal');
        if (el && global.bootstrap) bootstrap.Modal.getOrCreateInstance(el).show();
    }

    function checkout() {
        if (lines.length === 0) return;
        // DEMÓ: itt nincs szerver. Valódi rendelésnél a `lines` tömböt kell elküldeni a backendnek.
        lines = [];
        save();
        setView('success');
        render();
    }

    /* ---------- Eseménykezelés (delegálva, nincs inline onclick) ---------- */
    document.addEventListener('click', (e) => {
        const addBtn = e.target.closest('[data-add-to-cart]');
        if (addBtn) {
            const qtyInput = document.getElementById(addBtn.dataset.qtyInput || '');
            add(addBtn.dataset.addToCart, qtyInput ? qtyInput.value : 1);
            return;
        }
        const btn = e.target.closest('[data-cart-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const line = lines.find((l) => l.id === id);
        switch (btn.dataset.cartAction) {
            case 'inc': if (line) setQty(id, line.qty + 1); break;
            case 'dec': if (line) setQty(id, line.qty - 1); break;
            case 'remove': remove(id); break;
            case 'clear': if (confirm('Biztosan üríteni szeretnéd a kosarat?')) clear(); break;
            case 'checkout': checkout(); break;
        }
    });

    // Ha a modal újranyílik, ne a "köszönjük" nézet maradjon ott.
    document.addEventListener('show.bs.modal', (e) => {
        if (e.target.id !== 'cartModal') return;
        const success = document.querySelector('[data-cart-view="success"]');
        if (success) success.hidden = true;
        render();
    });

    // Több nyitott fül szinkronban marad.
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) { lines = load(); render(); }
    });

    render();
    global.Cart = { add, remove, setQty, clear, count, total, items: () => lines.slice() };
})(window);
