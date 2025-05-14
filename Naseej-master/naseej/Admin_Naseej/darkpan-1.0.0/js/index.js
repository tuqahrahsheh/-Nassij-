// recent booking 

document.addEventListener('DOMContentLoaded', function () {
    // Fetch and populate requests
    fetch('http://localhost:25025/api/services/GetAllRequest')
        .then(response => response.json())
        .then(requests => {
            const tableBody = document.getElementById('requestsTableBody');
            tableBody.innerHTML = ''; // Clear existing rows

            // Get the last 4 requests
            const lastRequests = requests.slice(-4);  // Slice the last 4 items from the requests array

            lastRequests.forEach(request => {
                const row = `
                    <tr>
                        <td>${new Date(request.requestDate).toLocaleDateString()}</td>
                        <td>${request.fullName}</td>
                        <td>${request.email}</td>
                        <td>${request.serviceName}</td>
                        <td>${request.nationality}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="showRequestDetails(${JSON.stringify(request).replace(/"/g, '&quot;')})">
                                Details
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Error fetching requests:', error);
            const tableBody = document.getElementById('requestsTableBody');
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger">
                        Failed to load requests. Please try again later.
                    </td>
                </tr>
            `;
        });
});

function showRequestDetails(request) {
    const modalBody = document.getElementById('requestDetailsModalBody');
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Personal Information</h6>
                <p><strong>Full Name:</strong> ${request.fullName}</p>
                <p><a href="mailto:${request.email}"><strong>Email:</strong> ${request.email}</a></p>
                <a href="tel:${request.phoneNumber}"> <strong>Phone Number: </strong>${request.phoneNumber}</a>
                <p><strong>Age:</strong> ${request.age}</p>
                <p><strong>Nationality:</strong> ${request.nationality}</p>
                <p><strong>Degree:</strong> ${request.degree}</p>
            </div>
            <div class="col-md-6">
                <h6>Service Details</h6>
                <p><strong>Service Name:</strong> ${request.serviceName}</p>
                <p><strong>Service Description:</strong> ${request.serviceDescription}</p>
                <p><strong>Request Date:</strong> ${new Date(request.requestDate).toLocaleString()}</p>
                <p><strong>Age Range:</strong> ${request.fromage} - ${request.toage}</p>
            </div>
            <div class="col-12 mt-3">
                <h6>Request Description</h6>
                <p>${request.description}</p>
            </div>
        </div>
    `;

    // Show the modal
    const requestDetailsModal = new bootstrap.Modal(document.getElementById('requestDetailsModal'));
    requestDetailsModal.show();
}

//////////////////////



// recent services 
document.addEventListener('DOMContentLoaded', function () {
    // Create modal HTML once
    const modalHtml = `
        <div class="modal fade" id="serviceDetailsModal" tabindex="-1" aria-labelledby="serviceDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-secondary">
                    <div class="modal-header">
                        <h5 class="modal-title" id="serviceDetailsModalLabel">Service Details</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="serviceDetailsModalBody">
                        <!-- Service details will be inserted here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    async function fetchUnacceptedServices() {
        try {
            // Fetch services and employees concurrently
            const [servicesResponse, employeesResponse] = await Promise.all([
                fetch('http://localhost:25025/api/services/getallservices'),
                fetch('http://localhost:25025/api/Empolyees')
            ]);

            // Parse JSON responses
            const services = await servicesResponse.json();
            const employees = await employeesResponse.json();

            // Filter out unaccepted services
            const unacceptedServices = services.filter(service => service.isAccept !== "Accept");

            // Display only the last 3 unaccepted services
            const lastThreeUnacceptedServices = unacceptedServices.slice(-2);

            const unacceptedServicesList = document.getElementById('unacceptedServicesList');
            unacceptedServicesList.innerHTML = ''; // Clear previous content

            // If no unaccepted services
            if (lastThreeUnacceptedServices.length === 0) {
                unacceptedServicesList.innerHTML = `
                <div class="text-center text-muted py-3">
                    No pending services
                </div>
            `;
                return;
            }

            // Create a mapping of employee IDs to employees for faster lookup
            const employeeMap = employees.reduce((map, emp) => {
                map[emp.employeeId] = emp;
                return map;
            }, {});

            // Iterate over the last 3 unaccepted services and display them
            lastThreeUnacceptedServices.forEach(service => {
                // Find employee details for the service
                const employee = employeeMap[service.employeeId];

                // Construct the service row
                const serviceElement = document.createElement('div');
                serviceElement.className = 'd-flex align-items-center border-bottom py-3';

                // Safely handle service image
                const serviceImageUrl = service.serviceImage
                    ? `http://localhost:25025/Uploads/${service.serviceImage}`
                    : 'path/to/default/image.jpg';

                serviceElement.innerHTML = `
                    <img class="rounded-circle flex-shrink-0" 
                        src="${serviceImageUrl}" 
                        alt="${service.serviceName}" 
                        style="width: 60px; height: 60px; object-fit: cover;">
                    <div class="w-100 ms-3">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-0">${service.serviceName.length > 30 ? service.serviceName.substring(0, 30) + '...' : service.serviceName}</h6>
                            <small>${new Date(service.serviceDate).toLocaleDateString()}</small>
                        </div>
                        <span class="text-truncate d-block">${service.serviceDescription.length > 30 ? service.serviceDescription.substring(0, 30) + '...' : service.serviceDescription}</span>
                        <div class="d-flex justify-content-between pt-2">
                            <small>
                                Employee: ${employee.fullName ? employee.fullName : 'Not assigned'}
                            </small>
                            <button class="btn btn-sm btn-info" onclick="showServiceDetails(${service.serviceId})">
                                View Details
                            </button>
                        </div>
                    </div>
                `;

                // Attach the full service data to the element for easy access
                serviceElement.dataset.serviceDetails = JSON.stringify(service);

                // Append to the list
                unacceptedServicesList.appendChild(serviceElement);
            });
        } catch (error) {
            console.error('Error fetching services or employees:', error);

            // Display error message in the UI
            const unacceptedServicesList = document.getElementById('unacceptedServicesList');
            unacceptedServicesList.innerHTML = `
            <div class="text-center text-danger py-3">
                Failed to load services. Please try again later.
            </div>
        `;
        }
    }


    // Global function to show service details
    window.showServiceDetails = function (serviceId) {
        // Find the service element
        const serviceElements = document.querySelectorAll('#unacceptedServicesList > div');
        const serviceElement = Array.from(serviceElements).find(el =>
            JSON.parse(el.dataset.serviceDetails).serviceId === serviceId
        );

        if (!serviceElement) return;

        // Parse the service details
        const service = JSON.parse(serviceElement.dataset.serviceDetails);

        // Get modal body
        const modalBody = document.getElementById('serviceDetailsModalBody');

        // Construct detailed service information
        // Construct detailed service information
        modalBody.innerHTML = `
                <div class="d-flex flex-column h-100">
                    <div class="text-center mb-3">
                        <img src="http://localhost:25025/Uploads/${service.serviceImage}" 
                            alt="${service.serviceName}" 
                            class="img-fluid rounded mb-3" 
                            style="max-height: 200px; object-fit: cover;">
                    </div>
                    <div class="service-details d-flex flex-column flex-grow-1">
                        <h5 class="text-center mb-3">${service.serviceName}</h5>
                        
                        <div class="detail-group mb-2">
                            <strong>Description:</strong>
                            <p>${service.serviceDescription}</p>
                        </div>
                        
                        <div class="detail-group mb-2">
                            <strong>Age Range:</strong>
                            <p>${service.fromage} - ${service.toage} years</p>
                        </div>
                        
                        <div class="detail-group mb-2">
                            <strong>Service Date:</strong>
                            <p>${new Date(service.serviceDate).toLocaleString()}</p>
                        </div>
                        
                    </div>
                </div>
            `;


        // Show the modal
        const serviceDetailsModal = new bootstrap.Modal(document.getElementById('serviceDetailsModal'));
        serviceDetailsModal.show();
    };

    // Call the function to fetch and display services
    fetchUnacceptedServices();
});















document.addEventListener("DOMContentLoaded", async () => {
    try {
        const servicesResponse = await fetch("http://localhost:25025/api/services/getallservices");
        const services = await servicesResponse.json();

        const requestsResponse = await fetch("http://localhost:25025/api/services/GetAllRequest");
        const requests = await requestsResponse.json();

        const totalServices = services.length;
        const totalRequests = requests.length;

        const servicePopularity = {};
        requests.forEach(request => {
            servicePopularity[request.serviceName] = (servicePopularity[request.serviceName] || 0) + 1;
        });
        const popularService = Object.keys(servicePopularity).reduce((a, b) =>
            servicePopularity[a] > servicePopularity[b] ? a : b, "N/A");

        const ageGroups = {};
        requests.forEach(request => {
            const group = `${Math.floor(request.age / 10) * 10}-${Math.floor(request.age / 10) * 10 + 9}`;
            ageGroups[group] = (ageGroups[group] || 0) + 1;
        });
        const topAgeGroup = Object.keys(ageGroups).reduce((a, b) => ageGroups[a] > ageGroups[b] ? a : b, "N/A");

        // تحديث واجهة المستخدم
        document.getElementById("total-services").textContent = `${totalServices} Service`;
        document.getElementById("total-requests").textContent = `${totalRequests} Service`;
        document.getElementById("popular-service").textContent = popularService;
        document.getElementById("top-age-group").textContent = topAgeGroup;

    } catch (error) {
        console.error("Error fetching or processing data:", error);
    }
});
