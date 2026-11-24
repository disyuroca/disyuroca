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
});
