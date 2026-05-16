namespace HamzaTex.Api.Entities;

public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public String? CreatedByIp { get; set; }
    public DateTime? RevokedAt { get; set; }
    public String? RevokedByIp { get; set; }
    public String? ReplacedByToken { get; set; }
    public bool IsBiometric { get; set; } = false;
    public bool IsActive => RevokedAt == null && !IsExpired;
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public virtual ApplicationUser User { get; set; } = null!;
}