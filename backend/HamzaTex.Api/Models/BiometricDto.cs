namespace HamzaTex.Api.Models;

public class BiometricSetupResponseDto
{
    public string BiometricToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class BiometricLoginViewModel
{
    public string BiometricToken { get; set; } = string.Empty;
}
