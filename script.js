// Precision Root Canal Therapy - Interactive JavaScript

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    // Use 'open' to match CSS breakpoint styles; remove any legacy 'active'
    navMenu.classList.remove('active');
    navMenu.classList.toggle('open');
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const navMenu = document.getElementById('navMenu');
            if (!navMenu) return;
            navMenu.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });

    // Highlight current page in navbar
    try {
        const path = window.location.pathname;
        const file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        // Clear any existing active classes
        navLinks.forEach(a => a.classList.remove('active'));

        // Find best match: exact filename or root index
        let matched = false;
        navLinks.forEach(a => {
            const href = a.getAttribute('href');
            if (!matched && (href === file || (file === 'index.html' && (href === 'index.html' || href === './' || href === '/')))) {
                a.classList.add('active');
                matched = true;
            }
        });
    } catch (e) {
        console.warn('Navbar active link highlighting failed:', e);
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Referrals page: force download the referral PDF on click (no new tab)
document.addEventListener('DOMContentLoaded', function() {
    try {
        if (!document.body.classList.contains('referrals')) return;
        const btn = document.querySelector('.btn-download[href$="Endodontic-Referral-Form.pdf"]');
        if (!btn) return;
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.getAttribute('href');
            // Fetch the file and download as a Blob to avoid the browser opening it
            fetch(url)
              .then(res => res.blob())
              .then(blob => {
                  const blobUrl = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  // Try to preserve filename
                  a.download = url.split('/').pop() || 'Endodontic-Referral-Form.pdf';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
              })
              .catch(err => {
                  console.warn('Referral PDF download failed, falling back to direct link:', err);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = '';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
              });
        });
    } catch (e) {
        console.warn('Referral download handler error:', e);
    }
});

// Disable scroll-in animations: make everything visible immediately
document.addEventListener('DOMContentLoaded', function() {
    // Sections become visible by applying 'fade-in' (matches styles.css rule .section.fade-in)
    const sections = document.querySelectorAll('.section');
    sections.forEach(el => el.classList.add('fade-in'));

    // Elements with directional fade classes: apply 'animate' immediately
    const directional = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    directional.forEach(el => el.classList.add('animate'));
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = '#ffffff';
        header.style.backdropFilter = 'none';
    }
});

// Contact form submission
function submitForm(event) {
    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());

    // Map to the actual element IDs/fields used in contact.html
    const firstNameEl = document.getElementById('firstName');
    const lastNameEl = document.getElementById('lastName');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const serviceEl = document.getElementById('service');
    const messageEl = document.getElementById('message');

    // Validate required fields
    let valid = true;
    const mark = (el, ok) => {
        if (!el) return; // safety
        el.style.borderColor = ok ? '#e0e0e0' : '#e74c3c';
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const firstName = (values.firstName || '').trim();
    const lastName = (values.lastName || '').trim();
    const email = (values.email || '').trim();
    const phone = (values.phone || '').trim();
    const service = (values.service || '').trim();
    const msg = (values.message || '').trim();

    if (!firstName) { valid = false; mark(firstNameEl, false); } else { mark(firstNameEl, true); }
    if (!lastName)  { valid = false; mark(lastNameEl, false); } else { mark(lastNameEl, true); }
    if (!email || !emailRegex.test(email)) { valid = false; mark(emailEl, false); } else { mark(emailEl, true); }
    if (!msg) { valid = false; mark(messageEl, false); } else { mark(messageEl, true); }

    if (!valid) {
        showNotification('Please fill in all required fields (First name, Last name, Email, Message).', 'error');
        return;
    }

    // Build a prefilled email using mailto
    const to = 'info@mindfuldentist.london';
    const subject = `Appointment Request: ${service || 'General Enquiry'} - ${firstName} ${lastName}`;
    const bodyLines = [
        'Hello Precision Root Canal Therapy Team,',
        '',
        'I would like to book an appointment.',
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        service ? `Service: ${service}` : null,
        '',
        'Message:',
        msg,
        '',
        'Thank you!'
    ].filter(Boolean);

    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

    // Attempt to open the user's default email client with prefilled details
    window.location.href = mailto;

    // Provide quick visual feedback
    showNotification('Opening your email client to send the appointment request...', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-size: 0.9rem;
        line-height: 1.4;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Enhanced button hover effects
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card, .tech-item, .quick-link');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Gallery item hover effects
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const overlay = this.querySelector('.gallery-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
            this.style.transform = 'scale(1.05)';
        });
        
        item.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.gallery-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
            this.style.transform = 'scale(1)';
        });
    });
});

// Lazy loading for images (when real images are added)
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Scroll to top functionality removed per request

// Form field focus effects
document.addEventListener('DOMContentLoaded', function() {
    const formFields = document.querySelectorAll('input, textarea, select');
    formFields.forEach(field => {
        field.addEventListener('focus', function() {
            this.style.borderColor = '#1a237e';
            this.style.boxShadow = '0 0 10px rgba(26, 35, 126, 0.1)';
        });
        
        field.addEventListener('blur', function() {
            if (!this.value) {
                this.style.borderColor = '#e0e0e0';
                this.style.boxShadow = 'none';
            }
        });
    });
});

// Preloader (optional)
function createPreloader() {
    const preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        transition: opacity 0.5s ease;
    `;
    
    preloader.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #1a237e; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p style="color: #1a237e; font-weight: 500;">Loading...</p>
        </div>
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(preloader);
    
    // Hide preloader when page is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 500);
        }, 500);
    });
}

// Initialize preloader (uncomment if needed)
// document.addEventListener('DOMContentLoaded', createPreloader);

console.log('Precision Root Canal Therapy - Website loaded successfully!');

// FAQ Accordion interaction (Contact page)
document.addEventListener('DOMContentLoaded', function() {
    const faqAccordion = document.querySelector('.faq-accordion');
    if (!faqAccordion) return;

    faqAccordion.addEventListener('click', function(e) {
        const trigger = e.target.closest('.faq-trigger');
        if (!trigger) return;

        const item = trigger.closest('.faq-item');
        const panelId = trigger.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        const isOpen = item.classList.contains('open');

        // Close all items first
        faqAccordion.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('open');
            const btn = i.querySelector('.faq-trigger');
            if (btn) btn.setAttribute('aria-expanded', 'false');
            const pid = btn ? btn.getAttribute('aria-controls') : null;
            const pnl = pid ? document.getElementById(pid) : null;
            if (pnl) pnl.hidden = true;
            const icon = i.querySelector('.icon');
            if (icon) icon.textContent = '＋';
        });

        // Open the clicked item if it was not open
        if (!isOpen) {
            item.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            if (panel) panel.hidden = false;
            const icon = item.querySelector('.icon');
            if (icon) icon.textContent = '−';
        }
    });
});
