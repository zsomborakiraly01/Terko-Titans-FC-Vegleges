/**
 * main.js – oldalspecifikus viselkedések: űrlapok és az élő meccs.
 */
(function () {
    'use strict';

    /* ---------- Űrlapok ----------
     * Használat: <form data-demo-form data-success-title="..." data-success-text="..." novalidate>
     * A böngészős validációt Bootstrap-stílusban mutatjuk.
     * A beküldés DEMÓ (nincs szerver). Valódi backendhez hallgasd a `tt:form-submit`
     * eseményt:  document.addEventListener('tt:form-submit', e => fetch('/api', {method:'POST', body:e.detail.data}))
     */
    document.querySelectorAll('form[data-demo-form]').forEach((form) => {
        const status = (form.parentElement || document).querySelector('[data-form-status]');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }
            document.dispatchEvent(new CustomEvent('tt:form-submit', {
                detail: { form: form, data: new FormData(form) },
            }));
            form.reset();
            form.classList.remove('was-validated');
            if (status) {
                status.innerHTML =
                    '<div class="alert alert-success d-flex gap-2 align-items-start" role="alert">' +
                    '<i class="bi bi-check-circle-fill" aria-hidden="true"></i><div><strong></strong><span class="d-block"></span></div></div>';
                // textContent: a szöveg a HTML attribútumból jön, nem szúrjuk be nyersen.
                status.querySelector('strong').textContent = form.dataset.successTitle || 'Köszönjük!';
                status.querySelector('span').textContent = form.dataset.successText || '';
                status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    });

    /* ---------- Élő meccs szimuláció ---------- */
    const live = document.getElementById('live-match');
    if (live) {
        const timer = document.getElementById('live-match-timer');
        const bar = document.getElementById('live-match-bar');
        const badge = document.getElementById('live-match-badge');
        let minute = parseInt(live.dataset.minute, 10) || 0;

        const paint = () => {
            timer.textContent = minute + "'";
            const pct = Math.min(100, (minute / 90) * 100);
            bar.style.width = pct + '%';
            bar.parentElement.setAttribute('aria-valuenow', String(minute));
        };
        paint();

        const tick = setInterval(() => {
            minute += 1;
            if (minute >= 90) {
                minute = 90;
                clearInterval(tick);
                badge.innerHTML = '<i class="bi bi-flag-fill me-1" aria-hidden="true"></i> Lefújták';
                timer.textContent = 'Vége';
                bar.style.width = '100%';
                bar.parentElement.setAttribute('aria-valuenow', '90');
                return;
            }
            paint();
        }, 8000);
    }
})();
