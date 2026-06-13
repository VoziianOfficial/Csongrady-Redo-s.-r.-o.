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

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    };

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
        menuOpenButton.setAttribute('aria-controls', 'home-mobile-menu');
        mobileMenu.id = 'home-mobile-menu';

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
            const trigger = dropdown.querySelector('.home-nav__dropdown-link');

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

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.target || '0');
        const suffix = counter.dataset.suffix || '';
        const hasDecimal = String(counter.dataset.target || '').includes('.');
        const duration = 1300;
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

    const setupCounters = () => {
        const section = document.querySelector('[data-counter-section]');
        const counters = document.querySelectorAll('[data-counter]');

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

    const setupTestimonials = () => {
        const slider = document.querySelector('[data-testimonial-slider]');
        const prevButton = document.querySelector('[data-testimonial-prev]');
        const nextButton = document.querySelector('[data-testimonial-next]');

        if (!slider || !prevButton || !nextButton) return;

        const slides = [...slider.querySelectorAll('.home-testimonial')];

        if (!slides.length) return;

        let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));

        if (activeIndex < 0) {
            activeIndex = 0;
            slides[0].classList.add('is-active');
        }

        const showSlide = (index) => {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
        };

        prevButton.addEventListener('click', () => {
            showSlide(activeIndex - 1);
        });

        nextButton.addEventListener('click', () => {
            showSlide(activeIndex + 1);
        });
    };

    const setupStandoutAccordion = () => {
        const accordion = document.querySelector('[data-standout-accordion]');

        if (!accordion) return;

        const items = [...accordion.querySelectorAll('.home-standout-item')];

        items.forEach((item, index) => {
            const button = item.querySelector('button');

            if (!button) return;

            button.setAttribute('aria-controls', `home-standout-panel-${index}`);
            button.id = `home-standout-button-${index}`;

            const content = item.querySelector('.home-standout-item__content');

            if (content) {
                content.id = `home-standout-panel-${index}`;
                content.setAttribute('role', 'region');
                content.setAttribute('aria-labelledby', button.id);
            }

            button.addEventListener('click', () => {
                const isAlreadyActive = item.classList.contains('is-active');

                items.forEach((otherItem) => {
                    const otherButton = otherItem.querySelector('button');

                    otherItem.classList.remove('is-active');

                    if (otherButton) {
                        otherButton.setAttribute('aria-expanded', 'false');
                    }
                });

                if (!isAlreadyActive) {
                    item.classList.add('is-active');
                    button.setAttribute('aria-expanded', 'true');
                } else {
                    item.classList.add('is-active');
                    button.setAttribute('aria-expanded', 'true');
                }
            });
        });
    };

    const setupContactForm = () => {
        const form = document.querySelector('[data-contact-form]');
        const message = document.querySelector('[data-form-message]');

        if (!form || !message) return;

        const fields = [...form.querySelectorAll('input, select, textarea')];

        const clearFieldError = (field) => {
            field.classList.remove('is-error');
        };

        const showError = (text) => {
            message.textContent = text;
            message.classList.remove('is-success');
        };

        const showSuccess = (text) => {
            message.textContent = text;
            message.classList.add('is-success');
        };

        fields.forEach((field) => {
            field.addEventListener('input', () => clearFieldError(field));
            field.addEventListener('change', () => clearFieldError(field));
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            let isValid = true;

            fields.forEach((field) => {
                const value = String(field.value || '').trim();

                clearFieldError(field);

                if (field.hasAttribute('required') && !value) {
                    field.classList.add('is-error');
                    isValid = false;
                }

                if (field.type === 'email' && value && !isValidEmail(value)) {
                    field.classList.add('is-error');
                    isValid = false;
                }
            });

            if (!isValid) {
                showError('Please fill in all required fields with valid information.');
                const firstError = form.querySelector('.is-error');

                if (firstError) {
                    firstError.focus();
                }

                return;
            }

            showSuccess('Thank you! Your request has been prepared successfully. We will review your project details soon.');
            form.reset();
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

    const setupHeroParallax = () => {
        const hero = document.querySelector('.home-hero');
        const cards = document.querySelectorAll('[data-float-card]');

        if (!hero || !cards.length) return;

        const canUseParallax = () => {
            return window.matchMedia('(pointer: fine) and (min-width: 921px)').matches;
        };

        hero.addEventListener('pointermove', (event) => {
            if (!canUseParallax()) return;

            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            cards.forEach((card, index) => {
                const depth = (index + 1) * 8;
                const translateX = x * depth;
                const translateY = y * depth;

                card.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
            });
        });

        hero.addEventListener('pointerleave', () => {
            cards.forEach((card) => {
                card.style.transform = '';
            });
        });
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
    setupCounters();
    setupTestimonials();
    setupStandoutAccordion();
    setupContactForm();
    setupCookieBanner();
    setupHeroParallax();
})();