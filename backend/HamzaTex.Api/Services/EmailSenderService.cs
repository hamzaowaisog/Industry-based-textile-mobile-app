using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using MimeKit;

public sealed class EmailSenderService : IEmailSender
{
    private readonly SmtpOptionsDto _smtpOptions;

    public EmailSenderService(IOptions<SmtpOptionsDto> smtpOptions)
    {
        _smtpOptions = smtpOptions.Value ?? throw new ArgumentNullException(nameof(smtpOptions));
    }

    public async Task SendEmailAsync(string email , string subject, string htmlMessage)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtpOptions.FromName, _smtpOptions.FromEmail));
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = subject;

        message.Body = new BodyBuilder { HtmlBody = htmlMessage}.ToMessageBody();

        using var client = new SmtpClient();
        try{
        await client.ConnectAsync(_smtpOptions.Host , _smtpOptions.Port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_smtpOptions.User, _smtpOptions.Password);
        await client.SendAsync(message);
        }
        catch (Exception ex){
            throw new Exception("Failed to send email", ex);
        }
        finally{
            await client.DisconnectAsync(true);
        }
    }
}