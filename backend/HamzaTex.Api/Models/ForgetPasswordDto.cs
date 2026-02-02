namespace HamzaTex.Api.Models;

public class ForgetPasswordDto
{
    public string Email { get; set; } = string.Empty;
}

public class ForgetPasswordResponseDto
{
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}