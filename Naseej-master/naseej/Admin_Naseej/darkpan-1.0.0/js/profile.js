// Utility function to get the current employee ID from token
function getEmployeeIdFromToken() {
    const token = sessionStorage.getItem("Token");
    if (!token) {
        console.error("No token found in session storage");
        return null;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
}

// Fetch Employee Data from API
async function fetchEmployeeData() {
    const employeeId = getEmployeeIdFromToken();
    if (!employeeId) return;

    const token = sessionStorage.getItem("Token");

    try {
        const response = await fetch(`http://localhost:25025/api/Empolyees/${employeeId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch employee data");
        }

        const data = await response.json();
        updateProfileUI(data);
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to load profile data");
    }
}

// Update Profile UI with fetched data
function updateProfileUI(data) {
    document.getElementById("profile-img").src = data.image
        ? `http://localhost:25025/${data.image}`
        : "";
    document.getElementById("username").value = data.fullName || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("profile-username").innerText = data.fullName || "N/A";
    document.getElementById("profile-email").innerText = data.email || "N/A";
}

// Validate form inputs
function validateProfileForm() {
    const fullName = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    // Check for empty fields
    if (!fullName || !email) {
        showWarningNotification("Please fill in all required fields.");
        return false;
    }

    // Check password match if password is provided
    if (password && password !== confirmPassword) {
        showErrorNotification("Passwords do not match. Please re-enter them.");
        return false;
    }

    return true;
}

// Update Employee Data via API
async function updateEmployeeData() {
    // Validate inputs first
    if (!validateProfileForm()) return;

    const employeeId = getEmployeeIdFromToken();
    if (!employeeId) return;

    const token = sessionStorage.getItem("Token");

    // Prepare form data
    const formData = new FormData();
    formData.append("FullName", document.getElementById("username").value);
    formData.append("Email", document.getElementById("email").value);

    const password = document.getElementById("password").value;
    if (password) {
        formData.append("PasswordHash", password);
    }

    const imageFile = document.getElementById("profile-image-input").files[0];
    if (imageFile) {
        formData.append("ImageFile", imageFile);
    }

    try {
        // Show loading state
        toggleLoadingState(true);

        const response = await fetch(`http://localhost:25025/api/Empolyees/${employeeId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to update employee data");
        }

        showSuccessNotification("Profile Updated Successfully!");
        fetchEmployeeData(); // Refresh data
    } catch (error) {
        console.error(error);
        showErrorNotification("Failed to update profile. Please try again.");
    } finally {
        toggleLoadingState(false);
    }
}

// Preview selected profile image
function previewProfileImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("profile-img").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Notification helpers using SweetAlert2
function showSuccessNotification(message) {
    Swal.fire({
        icon: "success",
        title: "Success",
        text: message,
        confirmButtonText: "OK",
    });
}

function showErrorNotification(message) {
    Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonText: "OK",
    });
}

function showWarningNotification(message) {
    Swal.fire({
        icon: "warning",
        title: "Warning",
        text: message,
        confirmButtonText: "OK",
    });
}

// Toggle loading state
function toggleLoadingState(isLoading) {
    const saveButton = document.getElementById("save-profile");
    const spinner = saveButton.querySelector(".spinner-border");

    if (isLoading) {
        spinner.classList.remove("d-none");
    } else {
        spinner.classList.add("d-none");
    }
}

// Initialize Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Fetch initial employee data
    fetchEmployeeData();

    // Add event listeners
    document.getElementById("save-profile").addEventListener("click", updateEmployeeData);
    document.getElementById("profile-image-input").addEventListener("change", previewProfileImage);
});