using System;
using System.Collections.Generic;
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
public partial class Transaction
{
    public Guid Id { get; set; }

    public Guid? ClientId { get; set; }

    public Guid? ProductId { get; set; }

    public Guid? UserId { get; set; }

    public Guid? TransTypeId { get; set; }

    public Guid? TransModeId { get; set; }

    public Guid? TransCategoryId { get; set; }

    public decimal Amount { get; set; }

    public DateOnly TransDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Client? Client { get; set; }

    public virtual Product? Product { get; set; }

    public virtual User? User { get; set; }

    public virtual TransType? TransType { get; set; }

    public virtual TransMode? TransMode { get; set; }

    public virtual TransCategory? TransCategory { get; set; }
}
