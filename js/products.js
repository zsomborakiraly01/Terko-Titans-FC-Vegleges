/**
 * Termékadatbázis – EZ AZ EGYETLEN HELY, ahol a termékeket szerkeszteni kell.
 * A Merch Shop lista, a termékoldal és a kosár is innen dolgozik.
 *
 * Új termék felvétele: másolj be egy objektumot, adj neki egyedi `id`-t,
 * tedd a képet az img/merch/ mappába (ajánlott: .webp, max. 640 px).
 *
 *  id          egyedi azonosító (URL-ben is ez szerepel: termek.html?id=...)
 *  price       egész szám, forintban (a formázást a kód végzi)
 *  category    PRODUCT_CATEGORIES valamelyik kulcsa
 */
const PRODUCT_CATEGORIES = {
  ruhazat: "Ruházat",
  felszereles: "Felszerelés",
  kiegeszito: "Kiegészítők",
  extra: "Különlegességek",
};

const PRODUCTS_DATA = [
  {
    "id": "kulcstarto",
    "title": "Titán Prémium Kulcstartó",
    "subtitle": "Fém Kulcstartó Klubcímerrel",
    "price": 1990,
    "category": "kiegeszito",
    "model": "#01 Szőke Dávid",
    "img": "img/merch/kulcstarto.webp",
    "description": "Prémium minőségű, csiszolt fém kulcstartó a Térkő Titánok FC hivatalos címerével gravírozva. Nem rozsdásodik, strapabíró kivitel, hogy a kulcsaid mindig a bajnokok biztonságában legyenek."
  },
  {
    "id": "kulacs",
    "title": "Sport Kulacs 750ml",
    "subtitle": "BPA Mentes Sportkulacs DENSO Logóval",
    "price": 3490,
    "category": "felszereles",
    "model": "#54 Babay Krisztofer",
    "img": "img/merch/kulacs.webp",
    "description": "BPA-mentes, környezetbarát 750ml-es sportkulacs a DENSO szponzori logójával és Titán címerrel. Cseppmentes záródás, ergonomikus fogás edzésekhez és meccsekhez."
  },
  {
    "id": "ultra_mez",
    "title": "Hivatalos Ultra Mez 2026",
    "subtitle": "Zöld-Fehér Csíkos Ballon d'Or Edition Mez",
    "price": 18990,
    "category": "ruhazat",
    "model": "#10 Bugdán Brájen",
    "img": "img/merch/ultra_mez.webp",
    "description": "A hivatalos 2026-os zöld-fehér csíkos mezkollekció prémium darabja. Bugdán Brájen Ballon d'Or jelölt csatár által inspirált lélegző mikroszálas poliészter anyagból, aranyozott részletekkel."
  },
  {
    "id": "sip",
    "title": "Bírói Fém Síp",
    "subtitle": "Krómozott Fém Síp Zöld Nyakpánttal",
    "price": 2490,
    "category": "felszereles",
    "model": "#02 Burkus Máté",
    "img": "img/merch/sip.webp",
    "description": "Professzionális, krómozott fém bírói síp mocsárzöld nyakpánttal. Extrém hangerő, hogy az egész Titans Aréna hallja a sípszót."
  },
  {
    "id": "zokni",
    "title": "Pro Meccszokni",
    "subtitle": "Légáteresztő Sportzokni Titán Logóval",
    "price": 1990,
    "category": "ruhazat",
    "model": "#31 Kandács Romano",
    "img": "img/merch/zokni.webp",
    "description": "Profi meccszokni megerősített sarok- és talprésszel. Minimálisra csökkenti a vízhólyagok kockázatát, kiváló szellőzést biztosít a kilencven perc alatt."
  },
  {
    "id": "nadrag",
    "title": "Mérkőzés Nadrág",
    "subtitle": "Mocsárzöld Mérkőzés Nadrág Fehér Csíkkal",
    "price": 6990,
    "category": "ruhazat",
    "model": "#04 Völgyi Richárd",
    "img": "img/merch/nadrag.webp",
    "description": "Mocsárzöld mérkőzés nadrág fehér oldalsávval és hímzett klubcímerrel. Gumírozott, húzózsinóros derékrész a maximális kényelemért."
  },
  {
    "id": "cipo",
    "title": "Titán Stoplis Cipő",
    "subtitle": "Fűre Tervezett Pro Stoplis Focicipő",
    "price": 24990,
    "category": "felszereles",
    "model": "#99 Ambubu Kumalu",
    "img": "img/merch/cipo.webp",
    "description": "Professzionális stoplis focicipő természetes fűre. Ambubu Kumalu gyorsasági szélső által fémjelzett darab a maximális tapadásért és labdaérzékelésért."
  },
  {
    "id": "kituzo",
    "title": "Fém Zománcozott Kitűző",
    "subtitle": "Pajzs Alakú Prémium Kitűző",
    "price": 1290,
    "category": "kiegeszito",
    "model": "#05 Bíró Zsombor",
    "img": "img/merch/kituzo.webp",
    "description": "Fém zománcozott pajzs alakú kitűző. Tökéletes kiegészítő zakóra, táskára vagy sapkára a Titán identitás kifejezésére."
  },
  {
    "id": "baseball_sapka",
    "title": "Titáns Snapback Sapka",
    "subtitle": "Hímzett Zöld Snapback Sapka",
    "price": 5490,
    "category": "ruhazat",
    "model": "#07 Török Kevin",
    "img": "img/merch/baseball_sapka.webp",
    "description": "Stílusos hímzett zöld snapback sapka állítható hátsó pánttal. Megvédi a szemet a naptól a lelátón és a mindennapokban."
  },
  {
    "id": "labda",
    "title": "Hivatalos Meccslabda FIFA Pro",
    "subtitle": "Hivatalos 5-ös Méretű Pro Meccslabda",
    "price": 12990,
    "category": "felszereles",
    "model": "#10 Bugdán Brájen",
    "img": "img/merch/labda.webp",
    "description": "Hivatalos 5-ös méretű FIFA Pro minősítésű meccslabda aerodinamikus panelekkel a tökéletes röppályáért és lövőerőért."
  },
  {
    "id": "papucs",
    "title": "Öltözői Megyei Papucs",
    "subtitle": "Kényelmes Öltözői Csapatpapucs",
    "price": 3990,
    "category": "ruhazat",
    "model": "#44 Hamburger István",
    "img": "img/merch/papucs.webp",
    "description": "Kényelmes, csúszásmentes öltözői papucs a meccsek előtti és utáni pihenéshez. Ergonómiai talpkialakítás."
  },
  {
    "id": "torolkozo",
    "title": "Mikroszálas Edzőtörölköző",
    "subtitle": "Gyorsan Száradó Nagy Edzőtörölköző",
    "price": 4490,
    "category": "felszereles",
    "model": "#01 Szabó Ádám",
    "img": "img/merch/torolkozo.webp",
    "description": "Extra nedvszívó, mikroszálas edzőtörölköző 70x140 cm méretben. Gyorsan szárad, kis helyen is elfér a sporttáskában."
  },
  {
    "id": "felni",
    "title": "DENSO x Titánok Alufelni 18\"",
    "subtitle": "Exkluzív Alufelni Zöld Díszcsíkkal",
    "price": 89990,
    "category": "extra",
    "model": "#06 Dányi Dominik",
    "img": "img/merch/felni.webp",
    "description": "18 colos exkluzív alufelni garnitúra mocsárzöld díszcsíkkal a DENSO és a Titánok FC közös kiadásában. Autód méltó dísze!"
  },
  {
    "id": "tornazsak",
    "title": "Vízhatlan Tornazsák",
    "subtitle": "Strandra és Edzésre Ideális Tornazsák",
    "price": 3290,
    "category": "felszereles",
    "model": "#87 Bordás Zorall Dzsézön",
    "img": "img/merch/tornazsak.webp",
    "description": "Strapabíró, vízhatlan tornazsák vastag zsinórokkal. Ideális cipő, edzőcucc vagy strandfelszerelés szállítására."
  },
  {
    "id": "szel_dzseki",
    "title": "Eső- és Széldzseki",
    "subtitle": "Vízhatlan Széldzseki Kapucnival",
    "price": 14990,
    "category": "ruhazat",
    "model": "#19 Kalányos Róbert",
    "img": "img/merch/szel_dzseki.webp",
    "description": "Könnyű eső- és széldzseki kapucnival és vízálló cipzárral. Szeles, esős meccsnapokon is melegen tart."
  },
  {
    "id": "melegito",
    "title": "Hivatalos Csapat Melegítő",
    "subtitle": "Czipzáras Melegítő Felső és Alsó",
    "price": 19990,
    "category": "ruhazat",
    "model": "#23 Ifj. Horváth Zsolt Zoltán",
    "img": "img/merch/melegito.webp",
    "description": "Kétrészes cipzáras csapat melegítő (felső + alsó) puha pamut-poliészter keverékből. Tökéletes utazáshoz és bemelegítéshez."
  },
  {
    "id": "tolltarto",
    "title": "Diák Tolltartó",
    "subtitle": "Czipzáras Tolltartó Iskolásoknak",
    "price": 2290,
    "category": "kiegeszito",
    "model": "#11 Sárközi Nicolaus",
    "img": "img/merch/tolltarto.webp",
    "description": "Kétrekeszes cipzáras tolltarto iskolásoknak és diákoknak Titán logóval és csapatszínekkel."
  },
  {
    "id": "alsogatya",
    "title": "Sport Boxer (2 db-os)",
    "subtitle": "Kényelmes Pamut Sport Boxer",
    "price": 3990,
    "category": "ruhazat",
    "model": "#08 Rostás Aladin Dániel",
    "img": "img/merch/alsogatya.webp",
    "description": "2 db-os pamut sport boxer csomag rugalmas derékgumival a mindennapi kényelemért."
  },
  {
    "id": "nyakkendo",
    "title": "Barbershop Elegant Nyakkendő",
    "subtitle": "Elegáns Zöld Selyem Nyakkendő",
    "price": 4990,
    "category": "ruhazat",
    "model": "#03 Junior Krisztián Krisztopher",
    "img": "img/merch/nyakkendo.webp",
    "description": "Kézzel varrott zöld selyem nyakkendő a Gino & Lorenzo Barbershop ajánlásával. Elegáns eseményekre és meccsek előtti megjelenésre."
  },
  {
    "id": "elektromos_roller",
    "title": "Titán E-Scooter 350W",
    "subtitle": "350W-os Elektromos Roller Titán Zöldben",
    "price": 129990,
    "category": "extra",
    "model": "#12 Kalányos Márkinhos",
    "img": "img/merch/elektromos_roller.webp",
    "description": "350W-os kefe nélküli motorral szerelt elektromos roller 30 km hatótávval, mocsárzöld Titán fényezéssel és LED világítással."
  },
  {
    "id": "evoeszkoz",
    "title": "Kemping Evőeszköz Készlet",
    "subtitle": "Rozsdamentes Fém Evőeszköz Tokkal",
    "price": 2990,
    "category": "kiegeszito",
    "model": "#22 Somogyi Patrik",
    "img": "img/merch/evoeszkoz.webp",
    "description": "Rozsdamentes acél kemping evőeszköz készlet (villa, kanál, kés) mocsárzöld gyöngyvászon védőtokban edzőtáborokhoz."
  },
  {
    "id": "ov",
    "title": "Bőr Nadrágszíj",
    "subtitle": "Valódi Bőr Nadrágszíj Titán Csatolással",
    "price": 4490,
    "category": "ruhazat",
    "model": "#76 Dandár Ferenc Robika",
    "img": "img/merch/ov.webp",
    "description": "Valódi marhabőr nadrágszíj gravírozott fém Titán csattal. Időtálló és elegáns kiegészítő."
  },
  {
    "id": "energiaital",
    "title": "Titán Power Energiaital 250ml",
    "subtitle": "Tutti-Frutti Ízű Csapat Energiaital",
    "price": 490,
    "category": "kiegeszito",
    "model": "#45 JohnDeer Julio Emánuel",
    "img": "img/merch/energiaital.webp",
    "description": "250ml tutti-frutti ízű frissítő energiaital B-vitaminokkal és koffeinnel a maximális meccshangulathoz."
  },
  {
    "id": "bogre",
    "title": "Kerámia Szurkolói Bögre",
    "subtitle": "330ml Kerámia Bögre Klubcímerrel",
    "price": 2990,
    "category": "kiegeszito",
    "model": "#01 Szőke Dávid",
    "img": "img/merch/bogre.webp",
    "description": "330ml-es prémium kerámia bögre klubcímerrel. Mikrohullámú sütőben és mosogatógépben is biztonságosan használható."
  },
  {
    "id": "sal",
    "title": "Kötött Szurkolói Sál",
    "subtitle": "Kétoldalas Kötött Sál 'HAJRÁ TITÁN!'",
    "price": 4990,
    "category": "ruhazat",
    "model": "#02 Burkus Máté",
    "img": "img/merch/sal.webp",
    "description": "Dupla kötésű meleg szurkolói sál \"HAJRÁ TITÁN!\" felirattal és rojtos végekkel. Elengedhetetlen hideg meccsnapokon."
  },
  {
    "id": "sornyito",
    "title": "Mágneses Sörnyitó",
    "subtitle": "Hűtőmágneses Fém Sörnyitó",
    "price": 1490,
    "category": "kiegeszito",
    "model": "#05 Bíró Zsombor",
    "img": "img/merch/sornyito.webp",
    "description": "Erős mágnessel ellátott fém sörnyitó, ami megtapad a hűtőajtón. Mindig kéznél van a győzelmi koccintáshoz!"
  },
  {
    "id": "kontroller",
    "title": "Titánok Edition PS5 Kontroller",
    "subtitle": "Egyedi Zöld-Fehér Wireless Kontroller",
    "price": 29990,
    "category": "extra",
    "model": "#06 Dányi Dominik",
    "img": "img/merch/kontroller.webp",
    "description": "Egyedi mocsárzöld-fehér Titánok Edition vezeték nélküli PS5 kontroller ergonómikus markolattal e-sportosoknak és szurkolóknak."
  }
];
