namespace HamzaTex.Api.Entities;

public partial class Login
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual User User { get; set; } = null!;
}