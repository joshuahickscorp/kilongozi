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

    // Form tab switching
    document.querySelector('.form-tabs')?.addEventListener('click', e => {
        if (e.target.classList.contains('form-tab')) {
            const formId = e.target.dataset.form;
            document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            document.querySelectorAll('.contact-form').forEach(f => f.classList.remove('active'));
            document.getElementById(`${formId}Form`).classList.add('active');
        }
    });

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

    // Enhanced Form Handling with API verification
    document.querySelectorAll('.contact-form').forEach(form => {
        const msg = form.querySelector('.form-message');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        form.addEventListener('submit', async e => {
            e.preventDefault();
            
            // Show loading state
            msg.style.display = 'block';
            msg.textContent = 'Submitting form...';
            msg.style.backgroundColor = '#2196F3'; // Blue
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                // Prepare form data
                const formData = new FormData(form);
                
                // Add Formspree's required fields
                formData.append('_gotcha', ''); // Honeypot
                formData.append('_format', 'plain'); // Text format
                
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                // Parse response regardless of status
                const result = await response.json();
                
                // Check for actual success indicators from Formspree
                const isSuccess = response.ok && 
                                  (result.success || result.ok || result.next);
                
                if (isSuccess) {
                    // Success handling
                    msg.textContent = form.id === 'generalForm' ? 
                        '✓ Thank you! Your inquiry has been submitted.' : 
                        '✓ Case intake submitted successfully.';
                    msg.style.backgroundColor = '#4CAF50'; // Green
                    form.reset();
                    
                    // Log successful submission
                    console.log('Form submitted successfully:', {
                        form: form.id,
                        time: new Date().toISOString(),
                        response: result
                    });
                } else {
                    // Handle Formspree errors
                    const errorMsg = result.error || 
                                   result.errors?.map(e => e.message).join('. ') || 
                                   `Submission failed (${response.status})`;
                    throw new Error(errorMsg);
                }
            } catch (error) {
                // Show detailed error message
                msg.textContent = `✗ ${error.message}`;
                msg.style.backgroundColor = '#f44336'; // Red
                
                // Add "Form not sent" indicator
                const notSent = document.createElement('div');
                notSent.textContent = 'Form not sent. Please try again.';
                notSent.style.fontSize = '0.9em';
                notSent.style.marginTop = '8px';
                msg.appendChild(notSent);
                
                // Log full error
                console.error('Form submission failed:', {
                    error: error.message,
                    form: form.id,
                    time: new Date().toISOString()
                });
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                
                // Hide message after 8 seconds
                setTimeout(() => {
                    msg.style.display = 'none';
                    msg.replaceChildren(); // Clear appended elements
                }, 8000);
            }
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
