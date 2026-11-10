/**
 * main.js – oldalspecifikus viselkedések: űrlapok és az élő meccs.
 */
(function () {
    'use strict';

    /* ---------- Űrlapok ----------
     * <form data-demo-form data-email-subject="..." data-success-title="..." data-success-text="..." novalidate>
     * Beküldéskor a mezők (címkéikkel) e-mailben a TT_CONFIG.notifyEmail címre mennek (lásd js/config.js).
     */
    document.querySelectorAll('form[data-demo-form]').forEach((form) => {
        const status = (form.parentElement || document).querySelector('[data-form-status]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnHTML = submitBtn ? submitBtn.innerHTML : '';

        const show = (type, title, text) => {
            if (!status) return;
            status.innerHTML = '<div class="alert alert-' + type + '" role="alert"><strong></strong><span class="d-block"></span></div>';
            status.querySelector('strong').textContent = title;
            status.querySelector('span').textContent = text || '';
            status.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        };

        // A levél mezőit az űrlap címkéiből építjük (pl. "Telefonszám": "+36 ...").
        const collect = () => {
            const fields = {};
            form.querySelectorAll('input, select, textarea').forEach((el) => {
                if (!el.name || el.name === '_honey') return;
                const label = el.id ? form.querySelector('label[for="' + el.id + '"]') : null;
                const key = (label ? label.textContent : el.name).trim();
                fields[key] = el.value.trim() || '-';
            });
            return fields;
        };

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) firstInvalid.focus();
                return;
            }
            if (form.elements._honey && form.elements._honey.value) return; // spam-robot csapda

            const emailField = form.querySelector('input[type="email"]');
            const fields = collect();
            fields['Beküldés ideje'] = new Date().toLocaleString('hu-HU');

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Küldés…';
            if (status) status.innerHTML = '';

            TT.sendEmail(form.dataset.emailSubject || 'Új üzenet – Térkő Titánok FC', fields, emailField && emailField.value)
                .then(() => {
                    form.reset();
                    form.classList.remove('was-validated');
                    show('success', form.dataset.successTitle || 'Köszönjük!', form.dataset.successText);
                })
                .catch((err) => show('danger', 'A küldés nem sikerült.', err.userMessage || 'Kérjük, próbáld újra pár perc múlva, vagy hívj minket a Kapcsolat oldalon megadott számon.'))
                .finally(() => { submitBtn.disabled = false; submitBtn.innerHTML = btnHTML; });
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
