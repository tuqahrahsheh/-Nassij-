// JWT token parsing functions remain the same
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return null;
    }
}

function getEmployeeIdFromToken() {
    const token = sessionStorage.getItem("Token");
    if (token) {
        const payload = parseJwt(token);
        return payload ? payload.sub : null;
    }
    return null;
}

// Fetch and display blogs
function isTrue(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return false;
}

// Function to check if user is Super Admin
function loadEmployeeData() {
    const jwt = sessionStorage.getItem('Token');

    if (jwt) {
        try {
            const decodedJWT = JSON.parse(atob(jwt.split('.')[1]));
            const employeeName = decodedJWT.fullName;
            const isSuperAdmin = isTrue(decodedJWT.isAdmin); // Check if the user is a super admin

            // Use employeeRole if needed
            const employeeRole = isSuperAdmin ? 'Super Admin' : 'Admin';

            // You can save or use this information as needed
            console.log(`Logged in as: ${employeeName}, Role: ${employeeRole}`);

            return {
                employeeId: decodedJWT.sub, // Assuming 'sub' holds employeeId
                isSuperAdmin: isSuperAdmin,   // Super admin status
                employeeName: employeeName
            };
        } catch (error) {
            console.error("Error decoding JWT:", error);
        }
    }
    return null; // Return null if no JWT is found
}

// Example of using loadEmployeeData in your fetchBlogs function
async function fetchBlogs() {
    try {
        const url = "http://localhost:25025/api/Blogs";
        const response = await fetch(url);
        const data = await response.json();

        const userData = loadEmployeeData();
        if (!userData) return; // If user data is not found, exit the function

        const { employeeId, isSuperAdmin } = userData; // Destructure user data

        if (employeeId) {
            document.getElementById("EmployeeId").value = employeeId;
        }

        const cardContainer = document.getElementById("container");
        cardContainer.innerHTML = "";

        data.forEach((blog) => {
            const blogDate = new Date(blog.blogDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Check if the user is the author or a super admin
            const canEditOrDelete = isSuperAdmin || blog.employeeId.toString() === employeeId;

            cardContainer.innerHTML += `
                <div class="col-xl-4 col-md-6 mb-4">
                    <div class="card service-card shadow h-100" style="background-color:#191c24">
                        <img src="http://localhost:25025/${blog.image}" class="card-img-top" alt="Blog Image">
                        <div class="card-body">
                            <h5 class="card-title" style="color:#fff">${blog.title}</h5>
                            <p class="card-text"><strong>Description:</strong> ${blog.description}</p>
                            <p class="card-text"><strong>Date:</strong> ${blogDate}</p>
                            <p class="card-text"><strong>Admin:</strong> ${blog.fullName}</p>
                        </div>
                        <div class="card-footer text-center">
                            ${canEditOrDelete ? `
                                <a href="#" class="btn btn-success" onclick="editBlog(${blog.blogId})">
                                    <i class="fas fa-edit"></i> Edit
                                </a>
                                <a href="#" class="btn btn-danger" onclick="deleteBlog(${blog.blogId})">
                                    <i class="fas fa-trash"></i> Delete
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        Swal.fire({
            title: "Error!",
            text: "Failed to load blogs",
            icon: "error"
        });
    }
}






// Add new blog
document.getElementById("addBlogForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const employeeId = getEmployeeIdFromToken();
    if (!employeeId) {
        Swal.fire({
            title: "Error!",
            text: "Employee ID not found",
            icon: "error"
        });
        return;
    }

    try {
        const formData = new FormData(this);

        // إضافة EmployeeId
        formData.append("EmployeeId", employeeId);

        const response = await fetch("http://localhost:25025/api/Blogs", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            Swal.fire({
                title: "Success!",
                text: "Blog has been added successfully",
                icon: "success",
                timer: 3000
            });
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            const errorData = await response.text();
            throw new Error(errorData);
        }
    } catch (error) {
        Swal.fire({
            title: "Error!",
            text: `Failed to add blog: ${error.message}`,
            icon: "error"
        });
    }
});



// Delete blog
async function deleteBlog(id) {
    const result = await Swal.fire({
        title: "Are you sure?",
        text: "This blog will be deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:25025/api/Blogs/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                await Swal.fire({
                    title: "Deleted!",
                    text: "Blog has been deleted successfully",
                    icon: "success"
                });
                location.reload();
            } else {
                const errorData = await response.text();
                throw new Error(errorData);
            }
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: `Failed to delete blog: ${error.message}`,
                icon: "error"
            });
        }
    }
}

// Edit blog - fetch blog data
async function editBlog(id) {
    try {
        const response = await fetch(`http://localhost:25025/api/Blogs/${id}`);
        const blog = await response.json();

        document.getElementById("editBlogId").value = blog.blogId;
        document.getElementById("BlogName2").value = blog.title;
        document.getElementById("BlogDescription2").value = blog.description;

        // Format date for input
        const blogDate = new Date(blog.blogDate).toISOString().split('T')[0];
        document.getElementById("BlogDate2").value = blogDate;

        if (blog.image) {
            document.getElementById("batool").src = `http://localhost:25025/${blog.image}`;
        }

        $("#editBlogModal").modal("show");
    } catch (error) {
        Swal.fire({
            title: "Error!",
            text: "Failed to load blog details",
            icon: "error"
        });
    }
}

// Update blog
async function updateBlog() {
    const id = document.getElementById("editBlogId").value;
    try {
        const formData = new FormData();

        // Add blog data
        formData.append("BlogId", id);
        formData.append("Title", document.getElementById("BlogName2").value);
        formData.append("BlogDate", document.getElementById("BlogDate2").value);
        formData.append("Description", document.getElementById("BlogDescription2").value);
        formData.append("EmployeeId", getEmployeeIdFromToken());

        // Add image file if selected
        const imageFile = document.getElementById("BlogImg2").files[0];
        if (imageFile) {
            formData.append("imageFile", imageFile);
        }

        const response = await fetch(`http://localhost:25025/api/Blogs/${id}`, {
            method: "PUT",
            body: formData
        });

        if (response.ok) {
            await Swal.fire({
                title: "Success!",
                text: "Blog updated successfully",
                icon: "success"
            });

            $("#editBlogModal").modal("hide");
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            const errorData = await response.text();
            throw new Error(errorData);
        }
    } catch (error) {
        Swal.fire({
            title: "Error!",
            text: `Failed to update blog: ${error.message}`,
            icon: "error"
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', fetchBlogs);