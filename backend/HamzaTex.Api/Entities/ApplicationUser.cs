using Microsoft.AspNetCore.Identity;

namespace HamzaTex.Api.Entities;

/// <summary>
/// Custom ApplicationUser extending IdentityUser with integer ID and custom properties
/// </summary>
public class ApplicationUser : IdentityUser<int>
{
    /// <summary>
    /// Full name of the user
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Custom role ID reference to UserRole table
    /// </summary>
    public int? RoleId { get; set; }

    /// <summary>
    /// Indicates if the user account is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Timestamp when the user was created
    /// </summary>
    public DateOnly CreatedAt { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    // Navigation properties
    public virtual UserRole? Role { get; set; }
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public virtual ICollection<ProductUser> ProductUsers { get; set; } = new List<ProductUser>();
}

