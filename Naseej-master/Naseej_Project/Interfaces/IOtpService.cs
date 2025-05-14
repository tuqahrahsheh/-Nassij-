using Microsoft.EntityFrameworkCore;
using Naseej_Project.DTOs;
using Naseej_Project.Models;

namespace Naseej_Project.Interfaces
{
    public interface IOtpService
    {
        Task<bool> GenerateAndSendOtpAsync(string email);
        Task<bool> VerifyOtpAsync(string email, string otp);
    }

    public class OtpService : IOtpService
    {
        private readonly MyDbContext _context;
        private readonly IEmailService _emailService;

        public OtpService(MyDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<bool> GenerateAndSendOtpAsync(string email)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);
            if (employee == null) return false;

            // Generate 6-digit OTP
            var otp = GenerateOtp();

            // Update employee record
            employee.Otp = otp;
            employee.IsUsed = "false";
            await _context.SaveChangesAsync();

            // Send email
            var emailBody = $"Your OTP is: {otp}. This code will expire in 10 minutes.";
            await _emailService.SendEmailAsync(email, "Your OTP Code", emailBody);

            return true;
        }

        public async Task<bool> VerifyOtpAsync(string email, string otp)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);
            if (employee == null) return false;

            if (employee.Otp == otp && employee.IsUsed == "false")
            {
                employee.IsUsed = "true";
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        private string GenerateOtp()
        {
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }
    }

}
