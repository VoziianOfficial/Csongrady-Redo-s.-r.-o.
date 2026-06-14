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
        menuOpenButton.setAttribute('aria-controls', 'service-mobile-menu');
        mobileMenu.id = 'service-mobile-menu';

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

    const setupSmoothScroll = () => {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');

            if (!href || !href.startsWith('#')) return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();

            const headerHeight = header ? header.offsetHeight + 16 : 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
        });
    };

    const setupDropdownTouchSupport = () => {
        const dropdowns = document.querySelectorAll('[data-dropdown]');

        dropdowns.forEach((dropdown) => {
            const trigger = dropdown.querySelector('.service-nav__dropdown-link');

            if (!trigger) return;

            trigger.addEventListener('click', (event) => {
                const isTouchLayout = window.matchMedia('(hover: none)').matches;

                if (!isTouchLayout) return;

                const href = trigger.getAttribute('href');

                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);

                    if (target) {
                        event.preventDefault();

                        const headerHeight = header ? header.offsetHeight + 16 : 0;
                        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                        window.scrollTo({
                            top: targetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    };

    const setupActiveServiceLinks = () => {
        const currentService = body.dataset.servicePage;

        if (!currentService) return;

        document.querySelectorAll(`[data-service-link="${currentService}"]`).forEach((link) => {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');
        });
    };

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.target || '0');
        const suffix = counter.dataset.suffix || '';
        const hasDecimal = String(counter.dataset.target || '').includes('.');
        const duration = 1200;
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = target * easedProgress;

            counter.textContent = `${hasDecimal ? currentValue.toFixed(1) : Math.round(currentValue)}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = `${hasDecimal ? target.toFixed(1) : Math.round(target)}${suffix}`;
            }
        };

        requestAnimationFrame(update);
    };

    const setupServiceCounters = () => {
        const section = document.querySelector('[data-service-counter-section]');
        const counters = document.querySelectorAll('[data-service-counter]');

        if (!section || !counters.length) return;

        let hasAnimated = false;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting || hasAnimated) return;

                    hasAnimated = true;
                    counters.forEach(animateCounter);
                    observer.disconnect();
                });
            },
            {
                threshold: 0.3
            }
        );

        observer.observe(section);
    };

    const setupFaqAccordion = () => {
        const accordion = document.querySelector('[data-service-faq]');

        if (!accordion) return;

        const items = [...accordion.querySelectorAll('.service-faq-item')];
        const animations = new WeakMap();

        const animationOptions = {
            duration: 380,
            easing: 'cubic-bezier(.22, 1, .36, 1)'
        };

        const stopAnimation = (content) => {
            const currentAnimation = animations.get(content);

            if (currentAnimation) {
                currentAnimation.cancel();
                animations.delete(content);
            }
        };

        const closeItem = (item) => {
            const button = item.querySelector('button');
            const content = item.querySelector('.service-faq-item__content');

            if (!button || !content || !item.classList.contains('is-active')) return;

            stopAnimation(content);

            const startHeight = content.scrollHeight;

            content.style.height = `${startHeight}px`;
            content.style.overflow = 'hidden';

            item.classList.add('is-closing');
            button.setAttribute('aria-expanded', 'false');

            const animation = content.animate(
                [
                    { height: `${startHeight}px` },
                    { height: '0px' }
                ],
                animationOptions
            );

            animations.set(content, animation);

            animation.onfinish = () => {
                item.classList.remove('is-active');
                item.classList.remove('is-closing');

                content.style.height = '0px';
                content.style.overflow = 'hidden';

                animations.delete(content);
            };

            animation.oncancel = () => {
                animations.delete(content);
            };
        };

        const openItem = (item) => {
            const button = item.querySelector('button');
            const content = item.querySelector('.service-faq-item__content');

            if (!button || !content || item.classList.contains('is-active')) return;

            stopAnimation(content);

            item.classList.add('is-active');
            item.classList.remove('is-closing');

            content.style.height = '0px';
            content.style.overflow = 'hidden';

            const endHeight = content.scrollHeight;

            button.setAttribute('aria-expanded', 'true');

            const animation = content.animate(
                [
                    { height: '0px' },
                    { height: `${endHeight}px` }
                ],
                animationOptions
            );

            animations.set(content, animation);

            animation.onfinish = () => {
                if (!item.classList.contains('is-active')) return;

                content.style.height = 'auto';
                content.style.overflow = 'visible';

                animations.delete(content);
            };

            animation.oncancel = () => {
                animations.delete(content);
            };
        };

        items.forEach((item, index) => {
            const button = item.querySelector('button');
            const content = item.querySelector('.service-faq-item__content');

            if (!button || !content) return;

            button.id = `service-faq-button-${index}`;
            button.setAttribute('aria-controls', `service-faq-panel-${index}`);

            content.id = `service-faq-panel-${index}`;
            content.setAttribute('role', 'region');
            content.setAttribute('aria-labelledby', button.id);

            if (item.classList.contains('is-active')) {
                content.style.height = 'auto';
                content.style.overflow = 'visible';
                button.setAttribute('aria-expanded', 'true');
            } else {
                content.style.height = '0px';
                content.style.overflow = 'hidden';
                button.setAttribute('aria-expanded', 'false');
            }

            button.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-active');

                if (isOpen) {
                    closeItem(item);
                    return;
                }

                items.forEach((otherItem) => {
                    if (otherItem !== item) {
                        closeItem(otherItem);
                    }
                });

                openItem(item);
            });
        });
    };

    const setupRelatedHover = () => {
        const cards = document.querySelectorAll('.service-related-card');

        if (!cards.length) return;

        cards.forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                if (!window.matchMedia('(pointer: fine)').matches) return;

                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                card.style.setProperty('--hover-x', `${x}px`);
                card.style.setProperty('--hover-y', `${y}px`);
            });
        });
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
            const headerHeight = header ? header.offsetHeight + 16 : 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
        }, 150);
    };

    window.addEventListener('scroll', setHeaderState, { passive: true });
    window.addEventListener('load', setupHashOnLoad);

    setHeaderState();
    setupMobileMenu();
    setupSmoothScroll();
    setupDropdownTouchSupport();
    setupActiveServiceLinks();
    setupServiceCounters();
    setupFaqAccordion();
    setupRelatedHover();
    setupCookieBanner();
})();