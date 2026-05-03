using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(Name), Name = "IX_clients_name")]
[Index(nameof(IsActive), Name = "IX_clients_is_active")]
[Index(nameof(Phone), Name = "IX_clients_phone")]
public partial class Client
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int? ClientTypeId { get; set; }

    public int? UserId { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public decimal? CreditLimit { get; set; }

    public decimal? OpeningBalance { get; set; }

    public string? Notes { get; set; }

    public bool IsActive { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public virtual ClientType? ClientType { get; set; }

    public virtual ApplicationUser? User { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
