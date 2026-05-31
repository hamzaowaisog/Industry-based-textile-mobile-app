namespace HamzaTex.Api.Models;

public class SendOtpResponseDto
{
    public DateTime NextResendAt { get; set; }
}

public class VerifyOtpDto
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class VerifyOtpResponseDto
{
    public string ResetToken { get; set; } = string.Empty;
}

public class ResetPasswordWithTokenDto
{
    public string Email { get; set; } = string.Empty;
    public string ResetToken { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
