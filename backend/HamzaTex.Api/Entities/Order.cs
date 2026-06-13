using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(ClientId), Name = "IX_orders_client_id")]
[Index(nameof(StatusId), Name = "IX_orders_status_id")]
[Index(nameof(PaymentTypeId), Name = "IX_orders_payment_type_id")]
[Index(nameof(OrderDate), Name = "IX_orders_order_date")]
[Index(nameof(ClientId), nameof(OrderDate), Name = "IX_orders_client_date")]
[Index(nameof(StatusId), nameof(OrderDate), Name = "IX_orders_status_date")]
public partial class Order
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int? ClientId { get; set; }

    public int? UserId { get; set; }

    public int? StatusId { get; set; }
    
    public int? PaymentTypeId { get; set; }

    public DateOnly OrderDate { get; set; }

    public string? Notes { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public virtual Client? Client { get; set; }
    public virtual OrderStatus? Status { get; set; }
    public virtual PaymentType? PaymentType { get; set; }

    public virtual ICollection<OrderLine> OrderLines { get; set; } = new List<OrderLine>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public virtual ICollection<PaymentAllocation> PaymentAllocations { get; set; } = new List<PaymentAllocation>();
}
