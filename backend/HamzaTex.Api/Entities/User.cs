using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(Name), Name = "users_name_key")]
[Index(nameof(Email), Name = "IX_users_email")]
[Index(nameof(IsActive), Name = "IX_users_is_active")]
[Index(nameof(IsActive), nameof(CreatedAt), Name = "IX_users_is_active_created_at")]
public partial class User
{
    public Guid Id { get; set; }

    public string? Name { get; set; }

    public string? Email { get; set; }

    public Guid? RoleId { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual UserRole? Role { get; set; }

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
