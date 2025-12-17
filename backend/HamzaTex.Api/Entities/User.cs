using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HamzaTex.Api.Entities;

[Index(nameof(Name), Name = "users_name_key")]
[Index(nameof(Email), Name = "IX_users_email")]
[Index(nameof(IsActive), Name = "IX_users_is_active")]
[Index(nameof(IsActive), nameof(CreatedAt), Name = "IX_users_is_active_created_at")]
public partial class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string? Name { get; set; }

    public string? UserName { get; set; }

    public string? Password { get; set; }

    public string? Email { get; set; }

    public int? RoleId { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual UserRole? Role { get; set; }

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
