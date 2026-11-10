# Térkő Titánok FC – weboldal

Statikus oldal (HTML + Bootstrap 5.3 + vanilla JS). Nincs build lépés, nincs szerver:
nyisd meg az `index.html`-t, vagy indíts egy helyi szervert (`python3 -m http.server`).

## Mappaszerkezet

```
index.html            Főoldal
eredmenyek.html       Keret + taktikai tábla (4-3-3)
meccs-kovetes.html    Élő meccskövetés
merch.html            Webshop lista (keresés, kategória, rendezés)
termek.html           Termékoldal (termek.html?id=<termék id>)
jelentkezes.html      Toborzó űrlap
kapcsolat.html        Kapcsolat + üzenet űrlap

css/style.css         Egyetlen saját stíluslap (design tokenek az elején)
js/products.js        ★ Termékadatbázis – itt kell termékeket felvenni/szerkeszteni
js/core.js            Segédek (esc, formatPrice, toast) + menü / lábléc / kosár-ablak
js/cart.js            Kosár (localStorage) + kosár-ablak
js/shop.js            Termékkártyák, shop lista, termékoldal
js/main.js            Űrlapok és az élő meccs szimuláció
vendor/               Bootstrap 5.3.3 és Bootstrap Icons 1.11.3 (helyben, CDN nélkül)
img/                  Képek (.webp a termékekhez, max. 640 px)
```

## Gyakori feladatok

**Új termék:** tedd a képet az `img/merch/` mappába, majd másolj egy objektumot a
`js/products.js`-ben (egyedi `id`, `price` egész számként). A lista, a számlálók, a
termékoldal és a kosár automatikusan megkapja.

**Új kategória:** vedd fel a `PRODUCT_CATEGORIES` objektumba, és használd a termékeknél.

**Menüpont / lábléc módosítása:** `js/core.js` → `NAV_ITEMS` és `footerHTML()`.
Egy helyen kell átírni, minden oldalon megjelenik. Új oldalnál a `<body data-page="...">`
értéke egyezzen a `NAV_ITEMS` megfelelő `page` mezőjével.

**Színek:** `css/style.css` elején a `:root` tokenek (`--tt-green-*`, `--tt-gold`).
A Bootstrap `success` színe is erre van átállítva, ezért a `.text-success`, `.bg-success` stb. klubzöld.

**Űrlapok valódi küldése:** az űrlapok jelenleg demók. Hallgasd a `tt:form-submit` eseményt:

```js
document.addEventListener('tt:form-submit', (e) => {
  fetch('/api/contact', { method: 'POST', body: e.detail.data });
});
```

**Megrendelés:** a `Cart.checkout` (js/cart.js) most csak kiüríti a kosarat és köszönő nézetet mutat.
Valódi rendeléshez a `lines` tömböt kell a backendnek küldeni.

## Ismert, szándékosan nem módosított tartalmi pontok

- Az „Ambubu Kumalu” a főoldalon és a keretben rövidítve szerepel (korábban az egyik helyen „Ambubu Butan Kumalu” volt) – egyeztessétek a hivatalos írásmódot.
- Az élő meccs adatai (2–1, 67. perc) statikusak, az óra csak szimulál.
- A közösségi média linkek még `#`-re mutatnak; cseréld őket a valódi profilokra a `js/core.js`-ben.
