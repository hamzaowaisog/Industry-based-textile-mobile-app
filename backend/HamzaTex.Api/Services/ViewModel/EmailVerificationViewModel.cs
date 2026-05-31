namespace HamzaTex.Api.Services.ViewModel;

public class VerifySignupOtpViewModel
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class ResendSignupOtpViewModel
{
    public string Email { get; set; } = string.Empty;
}
