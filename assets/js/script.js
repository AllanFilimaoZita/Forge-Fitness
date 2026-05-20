// ==================== Utilitários ====================
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);


// ==================== Menu Mobile ====================
const MobileMenu = (() => {

    let sidebar, overlay, openBtn, closeBtn, links;
    let isOpen = false;

    const open = () => {
        sidebar.classList.add('is-active');
        overlay.classList.add('is-active');
        document.body.classList.add('nav-is-open');
        openBtn.setAttribute('aria-expanded', 'true');
        sidebar.setAttribute('aria-hidden', 'false');
        closeBtn.focus();
        isOpen = true;
    };

    const close = () => {
        sidebar.classList.remove('is-active');
        overlay.classList.remove('is-active');
        document.body.classList.remove('nav-is-open');
        openBtn.setAttribute('aria-expanded', 'false');
        sidebar.setAttribute('aria-hidden', 'true');
        openBtn.focus();
        isOpen = false;
    };

    const handleKeydown = (e) => {
        if (!isOpen) return;
    };

    const init = () => {
        sidebar  = $('#navMenu');
        overlay  = $('#navOverlay');
        openBtn  = $('#header-toggle');
        closeBtn = $('#navClose');
        links    = $$('.nav-sidebar__link');

        if (!sidebar || !overlay || !openBtn || !closeBtn) return;

        openBtn.addEventListener('click', open);
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);

        links.forEach(link => {
            link.addEventListener('click', () => {
                close();
            });
        });

        document.addEventListener('keydown', handleKeydown);

        observeSections();
    };

    const observeSections = () => {
        const sections = $$('section[id]');
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.getAttribute('id');
                links.forEach(link => {
                    link.classList.toggle(
                        'is-active',
                        link.getAttribute('href') === `#${id}`
                    );
                });
            });
        }, { threshold: 0.4 });

        sections.forEach(section => observer.observe(section));
    };

    return { init, open, close };
})();

 
document.addEventListener('DOMContentLoaded', () => {
    MobileMenu.init();
    Carousel.init();
    HeroScroll.init();
    Header.init();
});

// ==================== Carroussel ====================
const Carousel = (() => {
    const SCROLL_AMOUNT = 300;
 
    const init = () => {
        const carousel = $('#learn-carousel');
        const prevBtn  = $('#prevBtn');
        const nextBtn  = $('#nextBtn');
 
        if (!carousel || !prevBtn || !nextBtn) return;
 
        prevBtn.addEventListener('click', () => scrollBy(carousel, -SCROLL_AMOUNT));
        nextBtn.addEventListener('click', () => scrollBy(carousel,  SCROLL_AMOUNT));
 
        carousel.addEventListener('scroll', () => updateButtons(carousel, prevBtn, nextBtn), { passive: true });
 
        updateButtons(carousel, prevBtn, nextBtn);
    };
 
    const scrollBy = (el, amount) => {
        el.scrollBy({ left: amount, behavior: 'smooth' });
    };
 
    const updateButtons = (carousel, prev, next) => {
        const { scrollLeft, scrollWidth, clientWidth } = carousel;
        const atStart = scrollLeft <= 0;
        const atEnd   = scrollLeft + clientWidth >= scrollWidth - 1;
 
        prev.style.opacity = atStart ? '0.35' : '1';
        next.style.opacity = atEnd   ? '0.35' : '1';
        prev.disabled = atStart;
        next.disabled = atEnd;
    };
 
    return { init };
})();