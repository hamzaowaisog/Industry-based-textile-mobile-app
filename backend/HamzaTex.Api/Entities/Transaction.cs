using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(ClientId), Name = "IX_transactions_client_id")]
[Index(nameof(ProductId), Name = "IX_transactions_product_id")]
[Index(nameof(UserId), Name = "IX_transactions_user_id")]
[Index(nameof(TransTypeId), Name = "IX_transactions_trans_type_id")]
[Index(nameof(TransModeId), Name = "IX_transactions_trans_mode_id")]
[Index(nameof(TransCategoryId), Name = "IX_transactions_trans_category_id")]
[Index(nameof(TransDate), Name = "IX_transactions_trans_date")]
[Index(nameof(ClientId), nameof(TransDate), Name = "IX_transactions_client_date")]
[Index(nameof(TransTypeId), nameof(TransDate), Name = "IX_transactions_type_date")]
[Index(nameof(UserId), nameof(TransDate), Name = "IX_transactions_user_date")]
[Index(nameof(OrderId), Name = "IX_transactions_order_id")]
[Index(nameof(PurchaseId), Name = "IX_transactions_purchase_id")]
public partial class Transaction
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int? ClientId { get; set; }

    public int? ProductId { get; set; }

    public int? UserId { get; set; }

    /// <summary>Set when this transaction was created by an order (sale). Null for payments, expenses, and manual entries.</summary>
    public int? OrderId { get; set; }

    /// <summary>Set when this transaction was created by a purchase. Null for sales, payments, expenses, and manual entries.</summary>
    public int? PurchaseId { get; set; }

    public int? TransTypeId { get; set; }

    public int? TransModeId { get; set; }

    public int? TransCategoryId { get; set; }

    public decimal Amount { get; set; }

    public DateOnly TransDate { get; set; }

    public string? Notes { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public virtual Client? Client { get; set; }

    public virtual Product? Product { get; set; }

    public virtual ApplicationUser? User { get; set; }

    public virtual TransType? TransType { get; set; }

    public virtual TransMode? TransMode { get; set; }

    public virtual TransCategory? TransCategory { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Purchase? Purchase { get; set; }

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}
