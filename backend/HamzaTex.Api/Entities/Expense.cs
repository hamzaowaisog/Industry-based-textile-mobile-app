using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(ExpenseTypeId), Name = "IX_expenses_expense_type_id")]
[Index(nameof(TransModeId), Name = "IX_expenses_trans_mode_id")]
[Index(nameof(ExpenseDate), Name = "IX_expenses_expense_date")]
[Index(nameof(ExpenseTypeId), nameof(ExpenseDate), Name = "IX_expenses_type_date")]
public partial class Expense
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    
    public int Id { get; set; }

    public int? ExpenseTypeId { get; set; }

    public decimal Amount { get; set; }

    public int? TransModeId { get; set; }

    public int? UserId { get; set; }

    public int? TransCategoryId { get; set; }

    public int? TransactionId { get; set; }

    public DateOnly ExpenseDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ExpenseType? ExpenseType { get; set; }

    public virtual TransMode? TransMode { get; set; }

    public virtual User? User { get; set; }

    public virtual TransCategory? TransCategory { get; set; }

    public virtual Transaction? Transaction { get; set; }


}
