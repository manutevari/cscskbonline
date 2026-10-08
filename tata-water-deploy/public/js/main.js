document.addEventListener('DOMContentLoaded', () => {
    
    // Form Submission Handler
    const distributorForm = document.getElementById('distributorForm');
    
    if (distributorForm) {
        distributorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = distributorForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> SUBMITTING...';
            submitBtn.disabled = true;

            // Collect Form Data
            const formData = new FormData(distributorForm);
            const data = Object.fromEntries(formData.entries());
            
            // Remove the consent field as it's not in the Pydantic model
            delete data.consent;

            // Grab UTM parameters from URL if present
            const urlParams = new URLSearchParams(window.location.search);
            if(urlParams.has('utm_source')) data.utm_source = urlParams.get('utm_source');
            if(urlParams.has('utm_medium')) data.utm_medium = urlParams.get('utm_medium');
            if(urlParams.has('utm_campaign')) data.utm_campaign = urlParams.get('utm_campaign');
            
            try {
                // Send data to Lead API
                const response = await fetch('/api/submit-lead', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Show Success State
                    if (result.status === 'warning') {
                         console.warn("Lead recorded, but flagged as duplicate.");
                    }
                    submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> REQUEST SUBMITTED';
                    submitBtn.style.backgroundColor = 'var(--success-green)';
                    
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.disabled = false;
                        distributorForm.reset();
                    }, 3000);
                } else {
                    // Handle Validation Errors from API
                    console.error("Validation Error", result);
                    alert("Please check the form inputs. " + (result.detail?.[0]?.msg || "Invalid data."));
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert("Network error. Please try again later.");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // FAQ Accordion
    const faqBtns = document.querySelectorAll('.faq-btn');
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Close others (optional)
            /*
            faqBtns.forEach(otherBtn => {
                if (otherBtn !== btn) {
                    otherBtn.classList.remove('active');
                    otherBtn.nextElementSibling.style.maxHeight = null;
                }
            });
            */
            
            btn.classList.toggle('active');
            const content = btn.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // WhatsApp Widget
    const waTrigger = document.getElementById('waTrigger');
    const waPopup = document.getElementById('waPopup');
    const waClose = document.getElementById('waClose');
    const waChips = document.querySelectorAll('.wa-chip');
    
    if (waTrigger && waPopup && waClose) {
        waTrigger.addEventListener('click', () => {
            waPopup.classList.toggle('active');
        });
        
        waClose.addEventListener('click', () => {
            waPopup.classList.remove('active');
        });
        
        // Handle quick replies
        waChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const message = encodeURIComponent(`Hi, I would like to know about: ${chip.innerText}`);
                window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
            });
        });
    }
});
