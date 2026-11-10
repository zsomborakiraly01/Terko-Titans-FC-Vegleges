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

**E-mail értesítések:** a rendelések, a toborzó űrlap és a kapcsolat űrlap e-mailben a
`js/config.js` → `formId` (FormSubmit alias) által megadott címre mennek a FormSubmit.co szolgáltatáson keresztül (nincs saját szerver).
Az első beküldés után a FormSubmit egy megerősítő levelet küld erre a címre – egyszer jóvá kell hagyni,
addig a levelek nem érkeznek meg. Az e-mail cím látszik az oldal forrásában (spamgyűjtők célpontja);
a megerősítés után a FormSubmit ad egy véletlen alias-azonosítót, ezt érdemes a címe helyett használni.
Új űrlapnál: `<form data-demo-form data-email-subject="..." novalidate>` – a mezők a címkéikkel kerülnek a levélbe.

## Ismert, szándékosan nem módosított tartalmi pontok

- Az „Ambubu Kumalu” a főoldalon és a keretben rövidítve szerepel (korábban az egyik helyen „Ambubu Butan Kumalu” volt) – egyeztessétek a hivatalos írásmódot.
- Az élő meccs adatai (2–1, 67. perc) statikusak, az óra csak szimulál.
- A közösségi média linkek még `#`-re mutatnak; cseréld őket a valódi profilokra a `js/core.js`-ben.

## Spam-védelem

A `js/core.js` `SPAM` beállításai szűrik a küldéseket (rejtett csapdamező, minimális kitöltési idő,
küldési korlát böngészőnként, hivatkozás- és hosszkorlát). Fontos: ez **kliens oldali** védelem – a
böngésző kezelheti, de aki közvetlenül a FormSubmit címére küld kéréseket, azt nem állítja meg.
Valódi védelemhez szerver oldalon ellenőrzött CAPTCHA kell (pl. Cloudflare Turnstile + Web3Forms,
vagy egy Cloudflare Worker). A FormSubmit irányítópultján is lehet jelentett spamet tiltani.
