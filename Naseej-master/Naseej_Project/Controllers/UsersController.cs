using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Naseej_Project.DTOs;
using Naseej_Project.Interfaces;
using Naseej_Project.Models;

namespace Naseej_Project.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly MyDbContext _context;

        public UsersController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }


        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetUser", new { id = user.UserId }, user);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.UserId == id);
        }









        // Controller endpoint
        [HttpGet("search")]
        public async Task<ActionResult<ApiResponse<List<RequestSearchResultDto>>>> SearchRequests([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return Ok(new ApiResponse<List<RequestSearchResultDto>>
                    {
                        Success = true,
                        Data = new List<RequestSearchResultDto>(),
                        Message = "Please enter a search term"
                    });
                }

                searchTerm = searchTerm.ToLower().Trim();

                var requests = await _context.Requests
                    .Include(r => r.User)
                    .Include(r => r.Service)
                    .Where(r => r.User != null &&
                        (string.Concat(r.User.FirstName, " ", r.User.LastName).ToLower().Contains(searchTerm) ||
                         r.User.Email.ToLower().Contains(searchTerm)))
                    .Select(r => new RequestSearchResultDto
                    {
                        RequestId = r.RequestId,
                        UserName = $"{r.User.FirstName} {r.User.LastName}",
                        UserEmail = r.User.Email,
                        ServiceName = r.Service.ServiceName ?? "Unknown Service",
                        RequestDate = r.RequestDate ?? DateTime.MinValue,
                        Description = r.Description ?? "No description"
                    })
                    .OrderByDescending(r => r.RequestDate)
                    .ToListAsync();

                return Ok(new ApiResponse<List<RequestSearchResultDto>>
                {
                    Success = true,
                    Data = requests,
                    Message = requests.Any() ? null : "No requests found"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<List<RequestSearchResultDto>>
                {
                    Success = false,
                    Message = "An error occurred while searching requests"
                });
            }
        }


        // Alternative endpoint with pagination
        [HttpGet("search/paged")]
        public async Task<ActionResult<PagedResult<RequestSearchResultDto>>> SearchRequestsPaged(
            [FromQuery] string searchTerm,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest("Search term cannot be empty");
                }

                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                searchTerm = searchTerm.ToLower().Trim();

                // Get total count
                var totalCount = await _context.Requests
                    .Include(r => r.User)
                    .Where(r => r.User.FirstName.ToLower().Contains(searchTerm) ||
                               r.User.LastName.ToLower().Contains(searchTerm) ||
                               r.User.Email.ToLower().Contains(searchTerm))
                    .CountAsync();

                // Get paged results
                var requests = await _context.Requests
                    .Include(r => r.User)
                    .Include(r => r.Service)
                    .Where(r => r.User.FirstName.ToLower().Contains(searchTerm) ||
                               r.User.LastName.ToLower().Contains(searchTerm) ||
                               r.User.Email.ToLower().Contains(searchTerm))
                    .Select(r => new RequestSearchResultDto
                    {
                        RequestId = r.RequestId,
                        UserName = $"{r.User.FirstName} {r.User.LastName}",
                        UserEmail = r.User.Email,
                        ServiceName = r.Service.ServiceName,
                        RequestDate = r.RequestDate ?? DateTime.MinValue,
                        Description = r.Description ?? "No description"
                    })
                    .OrderByDescending(r => r.RequestDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var result = new PagedResult<RequestSearchResultDto>
                {
                    Data = requests,
                    TotalItems = totalCount,
                    PageSize = pageSize,
                    CurrentPage = page,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while searching requests");
            }
        }


    }
}
