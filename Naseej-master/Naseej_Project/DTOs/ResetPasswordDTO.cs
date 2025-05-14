using System.ComponentModel.DataAnnotations;

namespace Naseej_Project.DTOs
{
    public class ResetPasswordDTO
    {

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(4)]
        public string NewPassword { get; set; }

    }
}
