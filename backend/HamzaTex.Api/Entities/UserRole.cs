namespace HamzaTex.Api.Entities;

public partial class UserRole
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}

