namespace HamzaTex.Api.Models;

public class EmailConfirmationDto
{
    public int UserId { get; set; }
    public string Code { get; set; } = string.Empty;
}