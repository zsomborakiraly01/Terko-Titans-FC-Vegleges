/**
 * config.js – oldal-szintű beállítások.
 *
 * Az űrlapok és a rendelések a FormSubmit.co szolgáltatáson keresztül mennek e-mailben
 * a fiókhoz tartozó címre (nincs saját szerver). A `formId` a FormSubmit által adott
 * véletlen azonosító: ezzel nem kell az e-mail címet kitenni az oldal forráskódjába.
 * (Az értesítések címzettje: fukomaniga69@gmail.com)
 */
window.TT_CONFIG = {
    formId: 'c2645c701799d05441dccde801ff3c82',
    get endpoint() { return 'https://formsubmit.co/ajax/' + this.formId; },
};
