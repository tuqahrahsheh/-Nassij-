namespace Naseej_Project.DTOs
{
    public class BlogInputDto
    {
        public int BlogId { get; set; }
        public string Title { get; set; } = null!;
        public DateTime BlogDate { get; set; }
        public string? Description { get; set; }
        public int EmployeeId { get; set; }
        public string? FullName { get; set; }
        public IFormFile? ImageFile { get; set; } 
    }
}
