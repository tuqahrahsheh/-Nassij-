namespace Naseej_Project.DTOs
{
    // DTO for search results
    public class RequestSearchResultDto
    {
        public int RequestId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string ServiceName { get; set; }
        public DateTime RequestDate { get; set; }
        public string Description { get; set; }
    }
}
