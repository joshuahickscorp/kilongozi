document.addEventListener('DOMContentLoaded', () => {
    // Page navigation
    const pages = document.querySelectorAll('.page-content');
    const navLinks = document.querySelectorAll('nav a');
    
    const showPage = (pageId) => {
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(pageId)?.classList.add('active');
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
        history.pushState(null, null, `#${pageId}`);
    };

    document.querySelector('nav').addEventListener('click', e => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            showPage(e.target.dataset.page);
        }
    });

    window.addEventListener('popstate', () => 
        showPage(window.location.hash.substring(1) || 'home')
    );
    showPage(window.location.hash.substring(1) || 'home');

    // Clock
    const updateClock = () => {
        const now = new Date();
        document.getElementById('clock').innerHTML = `
            ${now.toLocaleDateString('en-US', { weekday: 'long' })}
            ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            <br>${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        `;
    };
    updateClock();
    setInterval(updateClock, 1000);

    // Form handling
    const formTabs = document.querySelectorAll('.form-tab');
    const contactForms = document.querySelectorAll('.contact-form');

    document.querySelector('.form-tabs').addEventListener('click', e => {
        if (e.target.classList.contains('form-tab')) {
            const formId = e.target.dataset.form;
            formTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            contactForms.forEach(f => f.classList.remove('active'));
            document.getElementById(`${formId}Form`).classList.add('active');
        }
    });

    document.querySelectorAll('.contact-form').forEach(form => {
        const msg = form.querySelector('#form-message');
        form.addEventListener('submit', async e => {
            e.preventDefault();
            msg.style.display = 'block';
            
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    msg.textContent = form.id === 'generalForm' ? 
                        'Thank you! Your inquiry has been submitted.' : 
                        'Case intake submitted successfully.';
                    msg.style.backgroundColor = '#4CAF50';
                    form.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                msg.textContent = 'Error submitting form. Please try again later.';
                msg.style.backgroundColor = '#f44336';
            }
            
            setTimeout(() => msg.style.display = 'none', 5000);
        });
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const toggleTheme = () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️' : '🌓';
    };

    themeToggle.addEventListener('click', toggleTheme);
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    // Map modal
    const mapModal = document.getElementById('mapModal');
    document.querySelectorAll('.office-address').forEach(el => {
        el.addEventListener('click', () => mapModal.style.display = 'flex');
    });

    window.addEventListener('click', e => {
        if (e.target === mapModal) mapModal.style.display = 'none';
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') mapModal.style.display = 'none';
    });

    // Cookie consent
    const cookieBanner = document.getElementById('cookie-consent');
    if (!localStorage.getItem('cookies-accepted')) {
        cookieBanner.style.display = 'block';
    }
    document.getElementById('cookie-accept').addEventListener('click', () => {
        localStorage.setItem('cookies-accepted', 'true');
        cookieBanner.style.display = 'none';
    });

    // Set current year
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});