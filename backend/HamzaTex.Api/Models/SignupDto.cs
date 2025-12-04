namespace HamzaTex.Api.Models;

public class SignupDto {
    public String Name { get; set; } = string.Empty;
    public String UserName { get; set; } = string.Empty;
    public String Email { get; set; } = string.Empty;
    public String Password { get; set; } = string.Empty;
    public String ConfirmPassword { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}