// ==================== Utilitários ====================

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);


// ==================== Dark Mode ====================

const ThemeToggle = (() => {

    const STORAGE_KEY = 'forge-theme';
    const DARK_CLASS  = 'dark';

    const applyTheme = (isDark) => {
        document.documentElement.classList.toggle(DARK_CLASS, isDark);
        const btn = $('#themeToggle');
        if (btn) btn.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    };

    const init = () => {
        const btn = $('#themeToggle');
        if (!btn) return;

        const saved       = localStorage.getItem(STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark      = saved ? saved === 'dark' : prefersDark;

        applyTheme(isDark);

        btn.addEventListener('click', () => {
            const nowDark = !document.documentElement.classList.contains(DARK_CLASS);
            applyTheme(nowDark);
            localStorage.setItem(STORAGE_KEY, nowDark ? 'dark' : 'light');
        });
    };

    return { init };
})();


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
        if (e.key === 'Escape') close();
    };

    const observeSections = () => {
        const sections = $$('section[id]');
        if (!sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.getAttribute('id');
                links.forEach(link => {
                    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
                });
            });
        }, { threshold: 0.4 });

        sections.forEach(section => observer.observe(section));
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
        links.forEach(link => link.addEventListener('click', close));
        document.addEventListener('keydown', handleKeydown);

        observeSections();
    };

    return { init };
})();


// ==================== Quotes API ====================

const QuotesAPI = (() => {

    const QUOTES = [
        {
            text: "The only bad workout is the one that didn't happen.",
            author: "Unknown",
            role: "Fitness Wisdom"
        },
        {
            text: "Take care of your body. It's the only place you have to live.",
            author: "Jim Rohn",
            role: "Entrepreneur & Author"
        },
        {
            text: "Strength does not come from the physical capacity. It comes from an indomitable will.",
            author: "Mahatma Gandhi",
            role: "Leader & Philosopher"
        },
        {
            text: "The pain you feel today will be the strength you feel tomorrow.",
            author: "Arnold Schwarzenegger",
            role: "Athlete & Actor"
        },
        {
            text: "Fitness is not about being better than someone else. It's about being better than you used to be.",
            author: "Khloe Kardashian",
            role: "Entrepreneur"
        },
        {
            text: "Your body can stand almost anything. It's your mind that you have to convince.",
            author: "Andrew Murphy",
            role: "Motivational Speaker"
        },
        {
            text: "Success usually comes to those who are too busy to be looking for it.",
            author: "Henry David Thoreau",
            role: "Author & Philosopher"
        },
        {
            text: "If it doesn't challenge you, it doesn't change you.",
            author: "Fred DeVito",
            role: "Fitness Instructor"
        }
    ];

    const state = {
        currentIndex: 0,
        isLoading: false,
        total: QUOTES.length
    };

    let elements = {};

    const fetchQuote = async (index) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return QUOTES[index];
    };

    const renderQuote = (quote) => {
        const initial = quote.author.charAt(0).toUpperCase();

        elements.text.textContent   = quote.text;
        elements.author.textContent = quote.author;
        elements.role.textContent   = quote.role;
        elements.avatar.textContent = initial;
        elements.counter.textContent = `${state.currentIndex + 1} / ${state.total}`;
    };

    const loadQuote = async (index) => {
        if (state.isLoading) return;

        state.isLoading = true;
        elements.btn.classList.add('is-loading');
        elements.section.classList.add('quote-is-fading');

        try {
            const quote = await fetchQuote(index);

            await new Promise(resolve => setTimeout(resolve, 300));

            renderQuote(quote);

            elements.section.classList.remove('quote-is-fading');

        } catch (error) {
            console.error('Erro ao carregar quote:', error);
            elements.text.textContent = 'Não foi possível carregar a frase. Tenta novamente.';
            elements.section.classList.remove('quote-is-fading');
        } finally {
            state.isLoading = false;
            elements.btn.classList.remove('is-loading');
        }
    };

    const nextQuote = () => {
        state.currentIndex = (state.currentIndex + 1) % state.total;
        loadQuote(state.currentIndex);
    };

    const init = () => {
        elements.section = $('#quotesSection');
        elements.text    = $('#quoteText');
        elements.author  = $('#quoteAuthor');
        elements.role    = $('#quoteRole');
        elements.avatar  = $('#quoteAvatar');
        elements.counter = $('#quotesCounter');
        elements.btn     = $('#newQuoteBtn');

        if (!elements.section || !elements.btn) return;

        loadQuote(state.currentIndex);

        elements.btn.addEventListener('click', nextQuote);
    };

    return { init };
})();


// ==================== Carrossel ====================

const Carousel = (() => {
    const SCROLL_AMOUNT = 300;

    const updateButtons = (carousel, prev, next) => {
        const { scrollLeft, scrollWidth, clientWidth } = carousel;
        const atStart = scrollLeft <= 0;
        const atEnd   = scrollLeft + clientWidth >= scrollWidth - 1;

        prev.style.opacity = atStart ? '0.35' : '1';
        next.style.opacity = atEnd   ? '0.35' : '1';
        prev.disabled = atStart;
        next.disabled = atEnd;
    };

    const init = () => {
        const carousel = $('#learn-carousel');
        const prevBtn  = $('#prevBtn');
        const nextBtn  = $('#nextBtn');

        if (!carousel || !prevBtn || !nextBtn) return;

        prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => carousel.scrollBy({ left:  SCROLL_AMOUNT, behavior: 'smooth' }));

        carousel.addEventListener('scroll', () => updateButtons(carousel, prevBtn, nextBtn), { passive: true });

        updateButtons(carousel, prevBtn, nextBtn);
    };

    return { init };
})();


// ==================== Hero Scroll ====================

const HeroScroll = (() => {
    const init = () => {
        const btn          = $('#heroScrollBtn');
        const learnSection = $('#learn-section');

        if (!btn || !learnSection) return;

        btn.addEventListener('click', () => {
            learnSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    return { init };
})();


// ==================== Header ====================

const Header = (() => {
    const init = () => {
        const header = $('#header');
        if (!header) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (ticking) return;
            requestAnimationFrame(() => {
                header.style.boxShadow = window.scrollY > 10
                    ? '0 2px 16px rgba(47, 47, 47, 0.08)'
                    : 'none';
                ticking = false;
            });
            ticking = true;
        }, { passive: true });
    };

    return { init };
})();


// ==================== Init ====================

document.addEventListener('DOMContentLoaded', () => {
    ThemeToggle.init();
    MobileMenu.init();
    QuotesAPI.init();
    Carousel.init();
    HeroScroll.init();
    Header.init();
});