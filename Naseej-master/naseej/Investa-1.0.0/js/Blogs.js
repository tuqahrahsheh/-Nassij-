// Function to fetch and display blogs
async function fetchAndDisplayBlogs() {
    try {
        const response = await fetch('http://localhost:25025/api/Blogs', {
            headers: {
                'accept': 'text/plain'
            }
        });
        const blogs = await response.json();

        // Get the container where blogs will be displayed
        const blogsContainer = document.getElementById('blogs-container');

        // Clear existing content
        blogsContainer.innerHTML = '';

        // Loop through each blog and create HTML
        blogs.forEach(blog => {
            // Format the date
            const blogDate = new Date(blog.blogDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Create blog HTML
            const blogHTML = `
                <div class="col-md-6 col-lg-6 col-xl-4 wow fadeInUp" data-wow-delay="0.1s">
                    <div class="blog-item bg-light rounded p-4" style="background-image: url(img/bg.png);">
                        <div class="mb-4">
                            <h4 class="text-primary mb-2">${blog.title}</h4>
                            <div class="d-flex justify-content-between">
                                <p class="mb-0"><span class="text-dark fw-bold">On</span> ${blogDate}</p>
                                <p class="mb-0"><span class="text-dark fw-bold">By</span> ${blog.fullName}</p>
                            </div>
                        </div>
                        <div class="project-img">
                            <img src="http://localhost:25025/${blog.image}" class="img-fluid w-100 rounded" alt="${blog.title}" style="height: 35vh;">
                            <div class="blog-plus-icon">
                                <a href="http://localhost:25025/${blog.image}" data-lightbox="blog-${blog.blogId}" 
                                   class="btn btn-primary btn-md-square rounded-pill">
                                    <i class="fas fa-plus fa-1x"></i>
                                </a>
                            </div>
                        </div>
                        <div class="my-4">
                            <a href="#" class="h6">${blog.description}</a>
                        </div>
                        <a class="btn btn-primary rounded-pill py-2 px-4" href="#">Explore More</a>
                    </div>
                </div>
            `;

            // Add the blog to the container
            blogsContainer.innerHTML += blogHTML;
        });

    } catch (error) {
        console.error('Error fetching blogs:', error);
        document.getElementById('blogs-container').innerHTML =
            '<div class="alert alert-danger">Error loading blogs. Please try again later.</div>';
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayBlogs);