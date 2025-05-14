using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Humanizer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Naseej_Project.DTOs;
using Naseej_Project.Models;

namespace Naseej_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogsController : ControllerBase
    {
        private readonly MyDbContext _context;

        public BlogsController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/Blogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogInputDto>>> GetBlogs()
        {
            var blogs = await _context.Blogs.Include(b => b.Employee).ToListAsync();

            var blogDtos = blogs.Select(b => new
            {
                BlogId = b.BlogId,
                Title = b.Title,
                BlogDate = b.BlogDate,
                Image = b.Image,
                Description = b.Description,
                EmployeeId = b.EmployeeId,
                FullName = b.Employee.FullName,
            }).ToList();

            return Ok(blogDtos);
        }


        // GET: api/Blogs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Blog>> GetBlog(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);

            if (blog == null)
            {
                return NotFound();
            }

            return blog;
        }


        [HttpPost]
        public async Task<ActionResult<BlogInputDto>> PostBlog([FromForm] BlogInputDto blogInput)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var newBlog = new Blog
                {
                    Title = blogInput.Title,
                    BlogDate = blogInput.BlogDate,
                    Description = blogInput.Description,
                    EmployeeId = blogInput.EmployeeId,
                    
                    Image = null
                };

                // معالجة الصورة إذا كانت مرفوعة
                if (blogInput.ImageFile != null && blogInput.ImageFile.Length > 0)
                {
                    var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "BlogsImages");
                    Directory.CreateDirectory(uploadsFolderPath);

                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(blogInput.ImageFile.FileName);
                    var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await blogInput.ImageFile.CopyToAsync(fileStream);
                    }

                    newBlog.Image = Path.Combine("BlogsImages", uniqueFileName).Replace("\\", "/");
                }


                _context.Blogs.Add(newBlog);
                await _context.SaveChangesAsync();

                var blogResponse = new BlogInputDto
                {
                    Title = newBlog.Title,
                    BlogDate = newBlog.BlogDate,
                    Description = newBlog.Description,
                    EmployeeId = newBlog.EmployeeId,
                };

                return CreatedAtAction(nameof(PostBlog), new { id = newBlog.BlogId }, blogResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // PUT: api/Blogs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBlog(int id, [FromForm] BlogInputDto blogDto)
        {
            if (id != blogDto.BlogId)
            {
                return BadRequest("Blog ID does not match.");
            }

            var existingBlog = await _context.Blogs.FindAsync(id);
            if (existingBlog == null)
            {
                return NotFound("Blog not found.");
            }

            
            existingBlog.Title = blogDto.Title;
            existingBlog.BlogDate = blogDto.BlogDate;
            existingBlog.Description = blogDto.Description;
            existingBlog.EmployeeId = blogDto.EmployeeId;

            if (blogDto.ImageFile != null)
            {
                if (!string.IsNullOrEmpty(existingBlog.Image))
                {
                    var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", existingBlog.Image);
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                var uploadsFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "BlogsImages");
                Directory.CreateDirectory(uploadsFolderPath);

                var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(blogDto.ImageFile.FileName);
                var filePath = Path.Combine(uploadsFolderPath, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await blogDto.ImageFile.CopyToAsync(fileStream);
                }

                existingBlog.Image = Path.Combine("BlogsImages", uniqueFileName).Replace("\\", "/");
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BlogExists(id))
                {
                    return NotFound("Concurrency issue: Blog no longer exists.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }



        // DELETE: api/Blogs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
            {
                return NotFound();
            }

            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BlogExists(int id)
        {
            return _context.Blogs.Any(e => e.BlogId == id);
        }
    }
}
