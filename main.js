document.documentElement.classList.add('js-ready');

// Navegación interna sin ensuciar la URL con "#..."
function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Fallback: algunos previews/webviews pueden no soportar IntersectionObserver.
// Si ocultamos elementos con .js-ready pero no podemos observar, los revelamos de inmediato.
if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.sr, .sr-wipe, .sr-tilt, .sr-tilt-neg, .sr-left, .sr-right').forEach(el => {
        el.classList.add('revealed');
    });
}

function getHeaderOffset() {
    const header = document.getElementById('header');
    return (header ? header.offsetHeight : 0) + 12;
}

function scrollToSectionById(id) {
    const target = document.getElementById(id);
    if (!target) return false;
    const top = window.scrollY + target.getBoundingClientRect().top - getHeaderOffset();
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    return true;
}

function clearHashFromUrl() {
    if (!location.hash) return;
    history.replaceState(null, '', location.pathname + location.search);
}

document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.getAttribute('target') === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    if (!id) return;
    if (scrollToSectionById(id)) {
        e.preventDefault();
        clearHashFromUrl();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash;
    if (!hash || hash === '#') return;
    const id = hash.slice(1);
    if (!id) return;
    setTimeout(() => {
        if (scrollToSectionById(id)) clearHashFromUrl();
    }, 0);
});

if ('IntersectionObserver' in window) {
    // Scroll Reveal Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.sr').forEach(el => observer.observe(el));

    // Scroll Reveal — CSS Animation Classes
    const srRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                srRevealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.sr-wipe, .sr-tilt, .sr-tilt-neg, .sr-left, .sr-right').forEach(el => srRevealObserver.observe(el));
}

// Eclair Drift Animations
const eclair1 = document.getElementById('eclair1');
const eclair2 = document.getElementById('eclair2');
const eclair3 = document.getElementById('eclair3');

let rafId = null;
let lastFrameTime = 0;
const FRAME_INTERVAL = 1000 / 40; // cap a 40fps — invisible a ojo, ahorra GPU

function animateWorld(now) {
    if (document.hidden) { rafId = null; return; }
    if (now - lastFrameTime < FRAME_INTERVAL) { rafId = requestAnimationFrame(animateWorld); return; }
    lastFrameTime = now;

    const t = now / 1000;

    if (eclair1) eclair1.style.transform = `rotate(${-22 + Math.sin(t) * 2}deg) translate(${Math.sin(t * 1.2) * 6}px, ${Math.cos(t) * -10}px)`;
    if (eclair2) eclair2.style.transform = `rotate(${16 + Math.sin(t * 0.9) * 2}deg) translate(${Math.cos(t * 1.1) * -5}px, ${Math.sin(t * 0.8) * -8}px)`;
    if (eclair3) eclair3.style.transform = `rotate(${-8 + Math.cos(t * 1.1) * 2}deg) translate(${Math.sin(t * 0.7) * 4}px, ${Math.cos(t * 1.3) * -7}px)`;

    rafId = requestAnimationFrame(animateWorld);
}
rafId = requestAnimationFrame(animateWorld);

// Reanudar animación al volver a la pestaña
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !rafId) rafId = requestAnimationFrame(animateWorld);
});


// Sabores accordion — uno a la vez, efecto líquido
(function () {
    const cards = document.querySelectorAll('.sabor-card');
    if (!cards.length) return;

    cards.forEach(card => {
        const btn = card.querySelector('.sabor-card-summary');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isOpen = card.classList.contains('expanded');

            // Cerrar todos
            cards.forEach(c => {
                c.classList.remove('expanded');
                const b = c.querySelector('.sabor-card-summary');
                if (b) b.setAttribute('aria-expanded', 'false');
            });

            // Abrir el pulsado si estaba cerrado
            if (!isOpen) {
                card.classList.add('expanded');
                btn.setAttribute('aria-expanded', 'true');
                // Scroll suave para que no quede cortado
                setTimeout(() => {
                    const top = card.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - 12;
                    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
                }, 80);
            }
        });

        // Soporte teclado
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
    });
})();

// ¿Por qué están tan buenos? — accordion centrado
document.querySelectorAll('.why-item-head').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.why-item');
        const isOpen = item.classList.contains('expanded');
        document.querySelectorAll('.why-item').forEach(i => {
            i.classList.remove('expanded');
            i.querySelector('.why-item-head').setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
            item.classList.add('expanded');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
    btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
});

// Statement — 3 reel slot machine
(function () {
    const reelEls = Array.from(document.querySelectorAll('.slot-reel'));
    if (!reelEls.length) return;
    const jackpotMsg = document.querySelector('.slots-jackpot-msg');

    // Track which image index each reel is showing
    const cur = reelEls.map((_, i) => i % 3);

    function getImgs(reel) { return Array.from(reel.querySelectorAll('.slot-img')); }

    function showImg(ri, idx, land) {
        const reel = reelEls[ri];
        const imgs = getImgs(reel);
        imgs[cur[ri]].classList.remove('active', 'landing');
        cur[ri] = ((idx % imgs.length) + imgs.length) % imgs.length;
        imgs[cur[ri]].classList.add('active');
        if (land) imgs[cur[ri]].classList.add('landing');
    }

    // Init: show starting image on each reel
    reelEls.forEach((_, i) => showImg(i, cur[i], true));

    function spinReelTo(ri, targetIdx, startDelay, onDone) {
        const n = getImgs(reelEls[ri]).length;
        // Calculate minimum flips to land on target
        let flips = 4;
        while ((cur[ri] + flips) % n !== targetIdx) flips++;
        if (flips < 4) flips += n;

        setTimeout(() => {
            let step = 0;
            let delay = 75;
            function tick() {
                step++;
                const nextIdx = (cur[ri] + 1) % n;
                const isLast = step === flips;
                showImg(ri, nextIdx, isLast);
                if (isLast) {
                    if (onDone) onDone();
                } else {
                    // Slow down near the end
                    if (step >= flips - 2) delay = Math.min(delay * 1.6, 380);
                    else delay = Math.min(delay * 1.18, 140);
                    setTimeout(tick, delay);
                }
            }
            tick();
        }, startDelay);
    }

    const jackpotTexts = ['¡Lool!', '¡Boooom!', '¡De locos!'];
    let jackpotIdx = 0;

    function triggerJackpot() {
        reelEls.forEach(r => {
            r.classList.add('jackpot');
            setTimeout(() => r.classList.remove('jackpot'), 700);
        });
        if (jackpotMsg) {
            jackpotMsg.textContent = jackpotTexts[jackpotIdx % jackpotTexts.length];
            jackpotIdx++;
            jackpotMsg.classList.add('visible');
            setTimeout(() => jackpotMsg.classList.remove('visible'), 2200);
        }
    }

    let cycleCount = 0;

    function runCycle() {
        cycleCount++;
        const isJackpot = cycleCount % 5 === 0;
        const jackpotTarget = Math.floor(Math.random() * 3);

        const targets = reelEls.map(() =>
            isJackpot ? jackpotTarget : Math.floor(Math.random() * 3)
        );

        let done = 0;
        reelEls.forEach((_, i) => {
            spinReelTo(i, targets[i], i * 450, () => {
                done++;
                if (done === reelEls.length) {
                    if (isJackpot) triggerJackpot();
                    setTimeout(runCycle, 2200 + Math.random() * 800);
                }
            });
        });
    }

    setTimeout(runCycle, 1800);
})();

// Popup Próximamente
(function () {
    const overlay = document.getElementById('prontoOverlay');
    const btn = document.getElementById('prontoClose');
    if (!overlay || !btn) return;
    btn.addEventListener('click', () => overlay.classList.add('hidden'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.add('hidden'); });
})();

// Infiltrado — paquito cycling with random "?"
(function () {
    const reveal = document.querySelector('.infiltrado-reveal');
    if (!reveal) return;
    const srcs = [
        'img/paquito-frambuesa-lado.webp',
        'img/paquito-pistacho-lado.webp',
        'img/paquito-chocolate-lado.webp',
    ];
    const img = reveal.querySelector('.infiltrado-reveal-img');
    const q = reveal.querySelector('.infiltrado-reveal-q');
    if (!img) return;
    let step = 0;
    let sinceLastQ = 0;

    function tick() {
        const showQ = sinceLastQ >= 3 && Math.random() < 0.35;

        img.style.transition = 'opacity 0.4s ease-in-out';
        img.style.opacity = '0';
        if (q) q.style.opacity = '0';

        setTimeout(() => {
            if (showQ) {
                img.style.opacity = '0.15';
                if (q) q.style.opacity = '1';
                sinceLastQ = 0;
            } else {
                step = (step + 1) % srcs.length;
                img.src = srcs[step];
                img.style.opacity = '1';
                if (q) q.style.opacity = '0';
                sinceLastQ++;
            }
        }, 420);
    }

    setInterval(tick, 1800);
})();

