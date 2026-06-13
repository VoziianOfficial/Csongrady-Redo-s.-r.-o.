'use strict';

(() => {
    const body = document.body;
    const header = document.querySelector('[data-header]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    const menuOpenButton = document.querySelector('[data-menu-open]');
    const menuCloseButton = document.querySelector('[data-menu-close]');

    const focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const setHeaderState = () => {
        if (!header) return;

        if (window.scrollY > 18) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    };

    const openMobileMenu = () => {
        if (!mobileMenu || !menuOpenButton) return;

        mobileMenu.classList.add('is-open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        body.classList.add('is-menu-open');

        menuOpenButton.setAttribute('aria-expanded', 'true');

        const firstFocusable = mobileMenu.querySelector(focusableSelector);
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 80);
        }
    };

    const closeMobileMenu = () => {
        if (!mobileMenu || !menuOpenButton) return;

        mobileMenu.classList.remove('is-open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        body.classList.remove('is-menu-open');

        menuOpenButton.setAttribute('aria-expanded', 'false');
    };

    const setupMobileMenu = () => {
        if (!mobileMenu || !menuOpenButton || !menuCloseButton) return;

        menuOpenButton.setAttribute('aria-expanded', 'false');
        menuOpenButton.setAttribute('aria-controls', 'legal-mobile-menu');
        mobileMenu.id = 'legal-mobile-menu';

        menuOpenButton.addEventListener('click', openMobileMenu);
        menuCloseButton.addEventListener('click', closeMobileMenu);

        mobileMenu.addEventListener('click', (event) => {
            if (event.target === mobileMenu) {
                closeMobileMenu();
            }
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                closeMobileMenu();
                menuOpenButton.focus();
            }

            if (event.key !== 'Tab' || !mobileMenu.classList.contains('is-open')) return;

            const focusableItems = [...mobileMenu.querySelectorAll(focusableSelector)];

            if (!focusableItems.length) return;

            const firstItem = focusableItems[0];
            const lastItem = focusableItems[focusableItems.length - 1];

            if (event.shiftKey && document.activeElement === firstItem) {
                event.preventDefault();
                lastItem.focus();
            }

            if (!event.shiftKey && document.activeElement === lastItem) {
                event.preventDefault();
                firstItem.focus();
            }
        });
    };

    const scrollToTarget = (target) => {
        if (!target) return;

        const headerHeight = header ? header.offsetHeight + 16 : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
    };

    const setupSmoothScroll = () => {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');

            if (!href || !href.startsWith('#')) return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            scrollToTarget(target);

            if (history.pushState) {
                history.pushState(null, '', href);
            }
        });
    };

    const setupDropdownTouchSupport = () => {
        const dropdowns = document.querySelectorAll('[data-dropdown]');

        dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector('.legal-nav__dropdown-link');

            if (!trigger) return;

            trigger.addEventListener('click', (event) => {
                const isTouchLayout = window.matchMedia('(hover: none)').matches;

                if (!isTouchLayout) return;

                const href = trigger.getAttribute('href');

                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);

                    if (target) {
                        event.preventDefault();
                        scrollToTarget(target);
                    }
                }
            });
        });
    };

    const setupLegalSideNav = () => {
        const navLinks = [...document.querySelectorAll('[data-legal-nav]')];

        if (!navLinks.length) return;

        const sections = navLinks
            .map((link) => {
                const id = link.getAttribute('href');
                const section = id ? document.querySelector(id) : null;

                return {
                    link,
                    section
                };
            })
            .filter((item) => item.section);

        if (!sections.length) return;

        const setActiveLink = (activeSection) => {
            sections.forEach(({ link, section }) => {
                const isActive = section === activeSection;

                link.classList.toggle('is-active', isActive);

                if (isActive) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (!visibleEntries.length) return;

                setActiveLink(visibleEntries[0].target);
            },
            {
                root: null,
                threshold: [0.22, 0.35, 0.5],
                rootMargin: '-22% 0px -58% 0px'
            }
        );

        sections.forEach(({ section }) => observer.observe(section));

        setActiveLink(sections[0].section);
    };

    const setupCookieBanner = () => {
        const banner = document.querySelector('[data-cookie-banner]');
        const acceptButton = document.querySelector('[data-cookie-accept]');
        const declineButton = document.querySelector('[data-cookie-decline]');

        if (!banner || !acceptButton || !declineButton) return;

        const storageKey = 'csongradyCookieConsent';
        const savedChoice = localStorage.getItem(storageKey);

        if (!savedChoice) {
            setTimeout(() => {
                banner.classList.add('is-visible');
            }, 500);
        }

        const saveChoice = (choice) => {
            localStorage.setItem(storageKey, choice);
            banner.classList.remove('is-visible');
        };

        acceptButton.addEventListener('click', () => saveChoice('accepted'));
        declineButton.addEventListener('click', () => saveChoice('declined'));
    };

    const setupHashOnLoad = () => {
        if (!window.location.hash) return;

        const target = document.querySelector(window.location.hash);

        if (!target) return;

        setTimeout(() => {
            scrollToTarget(target);
        }, 150);
    };

    window.addEventListener('scroll', setHeaderState, { passive: true });
    window.addEventListener('load', setupHashOnLoad);

    setHeaderState();
    setupMobileMenu();
    setupSmoothScroll();
    setupDropdownTouchSupport();
    setupLegalSideNav();
    setupCookieBanner();
})();