const jwtToken = sessionStorage.getItem('jwtToken');

const loginLogoutBtn = document.getElementById('loginLogoutBtn');

if (jwtToken) {
    loginLogoutBtn.textContent = 'Logout';
    loginLogoutBtn.href = 'index.html'; 
    loginLogoutBtn.addEventListener('click', function () {
        
        sessionStorage.removeItem('jwtToken');
        window.location.reload();
    });
}



async function subscribe() {
    try {
        // Get the email input
        const emailInput = document.getElementById('userEmail');
        const email = emailInput.value.trim();

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please enter your email address.',
                icon: 'error'
            });
            return;
        }

        if (!emailPattern.test(email)) {
            await Swal.fire({
                title: 'Error!',
                text: 'Please enter a valid email address.',
                icon: 'error'
            });
            return;
        }

        // Disable button and show loading state
        const subscribeButton = document.getElementById('subscribeButton');
        subscribeButton.disabled = true;
        subscribeButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subscribing...';

        // Send the subscription request
        const response = await fetch('http://localhost:25025/api/NewsLatters/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(email) // Changed this line
        });

        // Reset button state
        subscribeButton.disabled = false;
        subscribeButton.innerHTML = 'Subscribe';

        if (response.ok) {
            // Show success message
            await Swal.fire({
                title: 'Success!',
                text: 'Thank you for subscribing to our newsletter!',
                icon: 'success'
            });

            // Clear the input field
            emailInput.value = '';
        } else {
            const errorResponse = await response.json(); // Parse as JSON

            // Log the error response for debugging
            console.error('Error response from backend:', errorResponse);

            let errorMessage = errorResponse.message || 'Failed to subscribe.';
            let icon = 'error';

            if (response.status === 409) {
                // Handle 409 Conflict specifically
                errorMessage = 'You are already subscribed to our newsletter.';
                icon = 'info'; // Use info icon for already subscribed
            }

            // Show the appropriate error message
            await Swal.fire({
                title: icon === 'info' ? 'Already Subscribed' : 'Error!',
                text: errorMessage,
                icon: icon
            });
        }
    } catch (error) {
        console.error('Subscription error:', error);
        await Swal.fire({
            title: 'Error!',
            text: error.message || 'Failed to subscribe. Please try again later.',
            icon: 'error'
        });
    }
}
// Add enter key support for the email input
document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('userEmail');
    if (emailInput) {
        emailInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                subscribe();
            }
        });
    }
});











// Call translatore when the document loads
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'ar',
        autoDisplay: false,
    }, 'google_translate_element');

    // Wait for the Google Translate dropdown to load
    const waitForDropdown = setInterval(() => {
        const selectElement = document.querySelector("#google_translate_element select");
        if (selectElement) {
            clearInterval(waitForDropdown); // Stop checking once the element is found
            selectElement.selectedIndex = 1; // Select Arabic (index 1)
            selectElement.dispatchEvent(new Event('change')); // Trigger the change event

            // Apply RTL styles based on the selected language
            setInterval(() => {
                const lang = document.documentElement.lang; // Detect the current language

                // Check if the language is Arabic or contains Arabic characters
                if (lang === 'ar' || /[\u0600-\u06FF]/.test(document.body.textContent)) {
                    document.documentElement.setAttribute('dir', 'rtl');
                    document.body.style.direction = 'rtl'; // Set text direction to RTL
                    document.body.style.textAlign = 'right'; // Align text to the right
                    document.body.classList.add('rtl-layout'); // Add RTL class for additional styling
                } else {
                    document.documentElement.setAttribute('dir', 'ltr');
                    document.body.style.direction = 'ltr'; // Default to LTR
                    document.body.style.textAlign = 'left'; // Align text to the left
                    document.body.classList.remove('rtl-layout'); // Remove RTL class
                }
            }, 1000); // Check periodically
        }
    }, 100); // Check every 100ms
}
// Function to protect email addresses from translation
function protectEmails() {
    const emailRegex = /\b[\w.-]+@[\w.-]+\.[\w.-]+\b/g;

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: node =>
                node.parentNode.closest('[translate="no"]') ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT,
        }
    );

    let node;
    while ((node = walker.nextNode())) {
        const text = node.nodeValue;
        const matches = text.match(emailRegex);

        if (matches) {
            const parent = node.parentNode;

            matches.forEach(email => {
                const span = document.createElement('span');
                span.setAttribute('translate', 'no');
                span.textContent = email;
                span.style.unicodeBidi = 'bidi-override';
                span.style.direction = 'ltr';

                const parts = text.split(email);
                const fragment = document.createDocumentFragment();

                if (parts[0]) {
                    fragment.appendChild(document.createTextNode(parts[0]));
                }

                fragment.appendChild(span);

                if (parts[1]) {
                    fragment.appendChild(document.createTextNode(parts[1]));
                }

                parent.replaceChild(fragment, node);
            });
        }
    }
}
// Function to observe dynamic changes and reapply email protection
function observeDOMChanges() {
    const observer = new MutationObserver(() => {
        protectEmails();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}
// Run the function after the page loads
document.addEventListener('DOMContentLoaded', () => {
    protectEmails();
    observeDOMChanges(); // Observe dynamic content changes
});



// function to handle search results
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let projectsData = [];
    let servicesData = [];

    // Fetch Projects
    fetch('http://localhost:25025/api/project/getprojectAccepted')
        .then(response => response.json())
        .then(data => {
            projectsData = data;
        })
        .catch(error => console.error('Error fetching projects:', error));

    // Fetch Services
    fetch('http://localhost:25025/api/services/getservicesAccepted')
        .then(response => response.json())
        .then(data => {
            servicesData = data;
        })
        .catch(error => console.error('Error fetching services:', error));

    // Search functionality
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase().trim();

        // Clear previous results
        searchResults.innerHTML = '';

        // If search term is empty, return
        if (!searchTerm) return;

        // Search in Projects
        const projectResults = projectsData.filter(project =>
            project.projectName.toLowerCase().includes(searchTerm) ||
            project.projectDescription.toLowerCase().includes(searchTerm)
        );

        // Search in Services
        const serviceResults = servicesData.filter(service =>
            service.serviceName.toLowerCase().includes(searchTerm) ||
            service.serviceDescription.toLowerCase().includes(searchTerm)
        );

        // Combine and display results
        const allResults = [...projectResults, ...serviceResults];

        allResults.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-3';

            // Determine if it's a project or service
            const isProject = item.projectName !== undefined;

            // Determine image path based on type
            const imagePath = isProject
                ? `http://localhost:25025/project/${item.projectImage}`
                : `http://localhost:25025/uploads/${item.serviceImage}`;

            card.innerHTML = `
                <div class="card h-100">
                    <img src="${imagePath}" 
                         class="card-img-top" alt="${isProject ? item.projectName : item.serviceName}">
                    <div class="card-body">
                        <h5 class="card-title">${isProject ? item.projectName : item.serviceName}</h5>
                        <p class="card-text">${isProject ? item.projectDescription : item.serviceDescription}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${isProject ? 'Project' : 'Service'}</span>
                            <a href="#" class="btn btn-sm btn-outline-secondary view-details" 
                               data-type="${isProject ? 'project' : 'service'}" 
                               data-id="${isProject ? item.projectId : item.serviceId}">
                                View Details
                            </a>
                        </div>
                    </div>
                </div>
            `;

            searchResults.appendChild(card);
        });

        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                const type = this.getAttribute('data-type');
                const id = this.getAttribute('data-id');

                // Redirect to appropriate detailed page
                if (type === 'project') {
                    window.location.href = `project.html?id=${id}`;
                } else if (type === 'service') {
                    window.location.href = `service.html?id=${id}`;
                }
            });
        });
    });
});