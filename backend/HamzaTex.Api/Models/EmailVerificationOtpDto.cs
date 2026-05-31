namespace HamzaTex.Api.Models;

public class SignupOtpResponseDto
{
    public DateTime NextResendAt { get; set; }
}

public class VerifySignupOtpDto
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
