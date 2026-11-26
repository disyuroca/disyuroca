document.addEventListener('DOMContentLoaded', function() {
    /* ==========================================
       1. MENÚ MÓVIL
       ========================================== */
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function() {
            const isOpen = mobileMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        mobileMenu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ==========================================
       2. BUSCADOR Y FILTROS DEL CATÁLOGO
       ========================================== */
    const searchInput = document.getElementById('catalogSearch');
    const filterContainer = document.getElementById('categoryFilters');
    const catalogGrid = document.getElementById('catalogGrid');
    const catalogCount = document.getElementById('catalogCount');
    const noResultsBox = document.getElementById('noResultsBox');

    if (catalogGrid && (searchInput || filterContainer)) {
        const cards = Array.from(catalogGrid.querySelectorAll('.product-card'));
        let activeCategory = 'all';

        function normalizeText(str) {
            return (str || '')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
        }

        function applyCatalogFilter() {
            const query = normalizeText(searchInput ? searchInput.value.trim() : '');
            let visibleCards = 0;
            let visibleProducts = 0;

            cards.forEach(function(card) {
                const cardCategory = card.getAttribute('data-category');
                const categoryMatches = activeCategory === 'all' || cardCategory === activeCategory;
                const titleText = normalizeText(card.querySelector('h3')?.textContent);
                const accordion = card.querySelector('.product-accordion');
                const items = Array.from(card.querySelectorAll('.catalog-item'));

                if (!categoryMatches) {
                    card.classList.add('hidden-card');
                    return;
                }

                if (!query) {
                    card.classList.remove('hidden-card');
                    if (card.classList.contains('scroll-reveal') && !card.classList.contains('is-visible')) {
                        card.classList.add('is-visible', 'reveal-done');
                    }
                    items.forEach(function(item) { item.classList.remove('hidden-item'); });
                    visibleCards++;
                    visibleProducts += items.length;
                    return;
                }

                const titleMatches = titleText.includes(query);
                let matchedItemsCount = 0;

                items.forEach(function(item) {
                    const itemMatches = titleMatches || normalizeText(item.textContent).includes(query);
                    item.classList.toggle('hidden-item', !itemMatches);
                    if (itemMatches) matchedItemsCount++;
                });

                if (matchedItemsCount > 0) {
                    card.classList.remove('hidden-card');
                    if (card.classList.contains('scroll-reveal') && !card.classList.contains('is-visible')) {
                        card.classList.add('is-visible', 'reveal-done');
                    }
                    if (accordion) accordion.open = true;
                    visibleCards++;
                    visibleProducts += matchedItemsCount;
                } else {
                    card.classList.add('hidden-card');
                }
            });

            if (catalogCount) {
                const lineWord = visibleCards === 1 ? 'línea' : 'líneas';
                const prodWord = visibleProducts === 1 ? 'producto' : 'productos';
                catalogCount.textContent = `Mostrando ${visibleCards} ${lineWord} · ${visibleProducts} ${prodWord}`;
            }

            if (noResultsBox) {
                noResultsBox.classList.toggle('visible', visibleCards === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyCatalogFilter);
        }

        if (filterContainer) {
            filterContainer.querySelectorAll('.filter-pill').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    filterContainer.querySelectorAll('.filter-pill').forEach(function(b) {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');
                    activeCategory = btn.getAttribute('data-filter') || 'all';
                    applyCatalogFilter();
                });
            });
        }
    }

    /* ==========================================
       3. FORMULARIO DE CONTACTO (FORMSUBMIT AJAX)
       ========================================== */
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const form = event.target;
            const submitBtn = document.getElementById('submitBtn');
            const formStatus = document.getElementById('formStatus');
            const originalLabel = submitBtn.textContent;

            submitBtn.textContent = "Enviando solicitud...";
            submitBtn.disabled = true;

            if (formStatus) {
                formStatus.className = 'form-status';
                formStatus.textContent = '';
            }

            const formData = new FormData(form);
            const formObject = Object.fromEntries(formData);

            fetch("https://formsubmit.co/ajax/administracion@disyuroca.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formObject)
            })
            .then(function(response) {
                if (!response.ok) throw new Error('Error de red');
                return response.json();
            })
            .then(function() {
                if (formStatus) {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = "¡Solicitud enviada correctamente! Nos pondremos en contacto contigo a la brevedad.";
                }
                form.reset();
            })
            .catch(function(error) {
                if (formStatus) {
                    formStatus.className = 'form-status error';
                    formStatus.textContent = "Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo o escríbenos por WhatsApp.";
                }
                console.error("Error al enviar:", error);
            })
            .finally(function() {
                submitBtn.textContent = originalLabel;
                submitBtn.disabled = false;
            });
        });
    }

    /* ==========================================
       4. ANIMACIONES DE ENTRADA AL HACER SCROLL
       ========================================== */
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealTargets = [];

        function registerReveal(elements, options) {
            const opts = options || {};
            const type = opts.type || 'up';
            const baseDelay = opts.baseDelay || 0;
            const stagger = opts.stagger || 0;
            const rowSize = opts.rowSize || 0;
            const alternate = Boolean(opts.alternate);

            Array.from(elements).forEach(function(el, index) {
                if (!el || el.classList.contains('scroll-reveal')) return;

                const revealType = alternate ? (index % 2 === 0 ? 'left' : 'right') : type;
                const slot = rowSize > 0 ? (index % rowSize) : index;
                const delayMs = baseDelay + (slot * stagger);

                el.classList.add('scroll-reveal');
                if (revealType !== 'up') {
                    el.setAttribute('data-reveal', revealType);
                }
                if (delayMs > 0) {
                    el.style.setProperty('--reveal-delay', delayMs + 'ms');
                }
                el.dataset.revealDelayMs = String(delayMs);
                revealTargets.push(el);
            });
        }

        // Bloques principales y cabeceras
        registerReveal(document.querySelectorAll('.hero-content'), { type: 'left', baseDelay: 80 });
        registerReveal(document.querySelectorAll('.hero-media'), { type: 'right', baseDelay: 220 });
        registerReveal(document.querySelectorAll('.about-hero-text'), { type: 'left', baseDelay: 80 });
        registerReveal(document.querySelectorAll('.about-brand-card'), { type: 'right', baseDelay: 220 });
        registerReveal(document.querySelectorAll('.contact-info-block'), { type: 'left', baseDelay: 80 });
        registerReveal(document.querySelectorAll('.contact-form'), { type: 'right', baseDelay: 220 });

        registerReveal(document.querySelectorAll('.section-header'), { type: 'up' });
        registerReveal(document.querySelectorAll('.banner-info'), { type: 'up', baseDelay: 120 });
        registerReveal(document.querySelectorAll('.catalog-controls'), { type: 'up', baseDelay: 200 });
        registerReveal(document.querySelectorAll('.stats-bar'), { type: 'zoom' });
        registerReveal(document.querySelectorAll('.cta-banner'), { type: 'zoom' });
        registerReveal(document.querySelectorAll('.packaging-section > .section-eyebrow, .packaging-title, .packaging-subtitle-text'), { type: 'up', stagger: 110 });

        // Tarjetas y listas con efecto escalonado
        registerReveal(document.querySelectorAll('.stats-bar .stat-item'), { type: 'up', baseDelay: 120, stagger: 130 });
        registerReveal(document.querySelectorAll('.features .feature-card'), { type: 'up', stagger: 150 });
        registerReveal(document.querySelectorAll('.lines-preview-grid .line-preview-card'), { type: 'up', stagger: 150 });
        registerReveal(document.querySelectorAll('.home-section > div[style*="text-align: center"]'), { type: 'up', baseDelay: 140 });
        registerReveal(document.querySelectorAll('.sectors-grid .sector-card'), { alternate: true, stagger: 160, rowSize: 2 });
        registerReveal(document.querySelectorAll('#catalogGrid .product-card'), { type: 'up', stagger: 140, rowSize: 3 });
        registerReveal(document.querySelectorAll('.packaging-grid .packaging-card'), { type: 'zoom', stagger: 170 });
        registerReveal(document.querySelectorAll('.mission-vision-grid .mv-card'), { alternate: true, stagger: 170, rowSize: 2 });
        registerReveal(document.querySelectorAll('.values-grid .value-card'), { type: 'up', stagger: 120, rowSize: 4 });
        registerReveal(document.querySelectorAll('.process-grid .process-step'), { type: 'up', stagger: 170 });
        registerReveal(document.querySelectorAll('.contact-cards-list .contact-item-card'), { type: 'up', baseDelay: 140, stagger: 120 });
        registerReveal(document.querySelectorAll('.site-footer .footer-col'), { type: 'up', stagger: 140 });

        if (revealTargets.length > 0) {
            document.documentElement.classList.add('scroll-anim-ready');

            function finishReveal(el) {
                if (el.classList.contains('reveal-done')) return;
                el.classList.add('reveal-done');
                el.style.removeProperty('--reveal-delay');
            }

            function revealElement(el) {
                if (el.classList.contains('is-visible')) return;
                el.classList.add('is-visible');

                const delayMs = parseInt(el.dataset.revealDelayMs || '0', 10) || 0;
                const fallbackTimer = window.setTimeout(function() {
                    finishReveal(el);
                }, 1250 + delayMs);

                el.addEventListener('transitionend', function onEnd(event) {
                    if (event.target !== el) return;
                    if (event.propertyName !== 'opacity' && event.propertyName !== 'transform') return;
                    window.clearTimeout(fallbackTimer);
                    el.removeEventListener('transitionend', onEnd);
                    finishReveal(el);
                });
            }

            const observer = new IntersectionObserver(function(entries, obs) {
                entries.forEach(function(entry) {
                    if (!entry.isIntersecting) return;
                    revealElement(entry.target);
                    obs.unobserve(entry.target);
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -50px 0px'
            });

            // Esperar dos frames para que el navegador pinte el estado inicial antes de animar
            window.requestAnimationFrame(function() {
                window.requestAnimationFrame(function() {
                    revealTargets.forEach(function(el) {
                        observer.observe(el);
                    });
                });
            });
        }
    }
});
