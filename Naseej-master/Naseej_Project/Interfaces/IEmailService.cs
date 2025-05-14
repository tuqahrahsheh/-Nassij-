using System.Net.Mail;
using System.Net;

namespace Naseej_Project.Interfaces
{
    public interface IEmailService2
    {
        Task SendEmailAsync(string to, string subject, string body);

    }
    public class EmailService2 : IEmailService2
    {
        private readonly IConfiguration _configuration;

        public EmailService2(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            using var message = new MailMessage();
            message.From = new MailAddress(_configuration["ahmadonizata@gmail.com\r\n"]);
            message.Subject = subject;
            message.To.Add(new MailAddress(to));
            message.Body = body;
            message.IsBodyHtml = false;

            using var client = new SmtpClient(_configuration["Email:SmtpServer"])
            {
                Port = int.Parse(_configuration["465"]),
                Credentials = new NetworkCredential(_configuration["ahmadonizata@gmail.com\r\n"], _configuration["smoj cmlr tebi xxhy\r\n"]),
                EnableSsl = true,
            };

            await client.SendMailAsync(message);
        }
    }


}
