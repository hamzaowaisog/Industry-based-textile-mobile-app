using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using MimeKit;

public sealed class EmailSenderService : IEmailSender
{
    private readonly SmtpOptionsDto _smtp;
    private readonly ILogger<EmailSenderService> _logger;

    public EmailSenderService(IOptions<SmtpOptionsDto> smtpOptions, ILogger<EmailSenderService> logger)
    {
        _smtp   = smtpOptions.Value ?? throw new ArgumentNullException(nameof(smtpOptions));
        _logger = logger;
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_smtp.FromName, _smtp.FromEmail));
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlMessage }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            client.CheckCertificateRevocation = _smtp.CheckCertificateRevocation;
            // SecureSocketOptions.Auto lets MailKit negotiate the best option
            // for both port 587 (STARTTLS) and port 465 (SSL/TLS).
            await client.ConnectAsync(_smtp.Host, _smtp.Port, SecureSocketOptions.Auto);
            await client.AuthenticateAsync(_smtp.User, _smtp.Password);
            await client.SendAsync(message);
            _logger.LogInformation("Email sent to {Email} — subject: {Subject}", email, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "SMTP send failed — host:{Host} port:{Port} to:{Email}",
                _smtp.Host, _smtp.Port, email);
            throw new InvalidOperationException(
                $"Failed to send email to {email}. " +
                $"Check SMTP settings (host: {_smtp.Host}, port: {_smtp.Port}).", ex);
        }
        finally
        {
            await client.DisconnectAsync(true);
        }
    }
}
