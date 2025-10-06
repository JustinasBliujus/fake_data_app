document.addEventListener('DOMContentLoaded', () => {
    const seedInput = document.getElementById('seedInput');
    const likesInput = document.getElementById('likesInput');
    const localeButton = document.getElementById('localeButton');
    const localeItems = document.querySelectorAll('#localeInput .dropdown-item');
    const pagination = document.getElementById('pagination');
    const scrollableContent = document.getElementById('scrollable-content');
    const accordionItemsContainer = document.getElementById('accordion-items');
    const paginationViewButton = document.getElementById('paginationViewBtn');
    const infiniteViewButton = document.getElementById('infiniteViewBtn');

    seedInput.addEventListener('change', async () => {
        currentPage = 0;
        accordionItemsContainer.innerHTML = '';

        if (infiniteViewButton.classList.contains('active')) {
            currentPage = 0;    
            accordionItemsContainer.innerHTML = '';
            await loadMoreAccordionItems();
            await loadMoreAccordionItems();
            window.stopAllMelodies();
        } else {
            goToPage(currentPage);
        }
    });

    likesInput.addEventListener('change', async () => {
        currentPage = 0;
        accordionItemsContainer.innerHTML = '';
        if (infiniteViewButton.classList.contains('active')) {
            currentPage = 0;
            accordionItemsContainer.innerHTML = '';
            await loadMoreAccordionItems();
            await loadMoreAccordionItems();
            window.stopAllMelodies();
        } else {
            goToPage(currentPage);
        }
    });

    let currentPage = parseInt(document.body.dataset.page) || 1;
    const maxPage = parseInt(document.body.dataset.maxPages) || 10;
    let isFetching = false;
    let selectedLocale = localeButton.textContent.trim();

    function setActiveButton(activeButton) {
        paginationViewButton.classList.remove('active');
        infiniteViewButton.classList.remove('active');
        activeButton.classList.add('active');

        if (activeButton === infiniteViewButton) {
            pagination.style.display = 'none';
            localStorage.setItem('activeView', 'infinite');
        } else {
            pagination.style.display = 'flex';
            localStorage.setItem('activeView', 'pagination');
        }
    }

    const savedView = localStorage.getItem('activeView') || 'pagination';
    setActiveButton(savedView === 'pagination' ? paginationViewButton : infiniteViewButton);

    paginationViewButton.addEventListener('click', e => {
        e.preventDefault();
        setActiveButton(paginationViewButton);
        goToPage(1);
    });

    infiniteViewButton.addEventListener('click', async e => {
        e.preventDefault();
        setActiveButton(infiniteViewButton);
        currentPage = 0;    
        accordionItemsContainer.innerHTML = '';
        await loadMoreAccordionItems();
        await loadMoreAccordionItems();
        window.stopAllMelodies();
    });

    window.addEventListener('scroll', async () => {
        if (!infiniteViewButton.classList.contains('active') || isFetching) return;

        const scrollBottom = scrollableContent.getBoundingClientRect().bottom <= window.innerHeight;
        if (scrollBottom) await loadMoreAccordionItems();
    });

    async function loadMoreAccordionItems() {
        if (currentPage >= maxPage) return;
        isFetching = true;
        currentPage++;
        const seed = seedInput.value.trim();
        const likes = parseFloat(likesInput.value);

        try {
            const res = await fetch('/loadAccordionBatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seed, likes, locale: selectedLocale, page: currentPage })
            });
            document.getElementById('likesCount').textContent = `Likes: ${likes}`;
            if (!res.ok) throw new Error('Failed to fetch batch');

            const html = await res.text();
            accordionItemsContainer.insertAdjacentHTML('beforeend', html);
            initializeAccordion();
        } catch (err) {
            console.error(err);
        } finally {
            isFetching = false;
        }
    }

    function initializeAccordion() {
        accordionItemsContainer.querySelectorAll('.accordion-collapse').forEach(collapseEl => {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
            bsCollapse.hide();

            collapseEl.addEventListener('show.bs.collapse', () => {
                accordionItemsContainer.querySelectorAll('.accordion-collapse').forEach(otherEl => {
                    if (otherEl !== collapseEl) {
                        bootstrap.Collapse.getInstance(otherEl)?.hide();
                    }
                });
            });
        });
    }

    initializeAccordion();

    localeItems.forEach(item => {
        item.addEventListener('click', async e => {
            e.preventDefault();
            selectedLocale = item.textContent.trim();
            localeButton.textContent = selectedLocale;

            currentPage = 0;
            accordionItemsContainer.innerHTML = '';

            if (infiniteViewButton.classList.contains('active')) {
                currentPage = 0;    
                accordionItemsContainer.innerHTML = '';
                await loadMoreAccordionItems();
                await loadMoreAccordionItems();
                window.stopAllMelodies();
            } else {
                goToPage(currentPage);
            }
        });
    });

    window.stopAllMelodies = function() {
        Tone.Transport.stop();
        Tone.Transport.position = 0;

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        document.querySelectorAll('.form-range').forEach(input => {
            input.value = 0;
            input.disabled = true;
        });

        document.querySelectorAll('[id^="timer-"]').forEach(timerEl => {
            timerEl.textContent = '0:00 / 0:00';
        });

        activeIndex = null;
        musicData = null;
    };

    async function updateSettings(page) {
        const seed = seedInput.value.trim();
        const likes = parseFloat(likesInput.value);

        const res = await fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seed, likes, locale: selectedLocale, page })
        });

        if (res.ok) {
            window.location.reload();
        } else {
            console.error('Failed to update settings');
        }
    }

    function renderPages() {
        const pageItems = Array.from(pagination.querySelectorAll('.page-item'));
        pageItems.forEach((li, i) => {
            if (i !== 0 && i !== pageItems.length - 1) li.remove();
        });

        const visiblePages = 3;
        let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        let endPage = startPage + visiblePages - 1;

        if (endPage > maxPage) {
            endPage = maxPage;
            startPage = Math.max(1, endPage - visiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            pagination.insertBefore(li, pagination.querySelector('.page-item:last-child'));
        }
    }

    function goToPage(page) {
        currentPage = page;
        renderPages();
        updateSettings(currentPage);
    }

    pagination.addEventListener('click', e => {
        e.preventDefault();
        const target = e.target;
        if (!target.classList.contains('page-link')) return;

        if (target.dataset.page === 'prev') {
            if (currentPage > 1) goToPage(currentPage - 1);
        } else if (target.dataset.page === 'next') {
            if (currentPage < maxPage) goToPage(currentPage + 1);
        } else {
            goToPage(parseInt(target.dataset.page));
        }
    });

    renderPages();
});
