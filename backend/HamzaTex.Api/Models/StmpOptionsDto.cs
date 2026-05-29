public sealed class SmtpOptionsDto
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set;}
    public string User { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;

    /// <summary>
    /// When true (default), MailKit validates TLS certs including revocation (OCSP/CRL).
    /// Set false if connect fails with "incomplete certificate revocation" (common on some macOS/network setups).
    /// </summary>
    public bool CheckCertificateRevocation { get; set; } = true;
}