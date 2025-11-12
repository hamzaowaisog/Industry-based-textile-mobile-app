using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(ExpenseTypeId), Name = "IX_expenses_expense_type_id")]
[Index(nameof(TransModeId), Name = "IX_expenses_trans_mode_id")]
[Index(nameof(ExpenseDate), Name = "IX_expenses_expense_date")]
[Index(nameof(ExpenseTypeId), nameof(ExpenseDate), Name = "IX_expenses_type_date")]
public partial class Expense
{
    public Guid Id { get; set; }

    public Guid? ExpenseTypeId { get; set; }

    public decimal Amount { get; set; }

    public Guid? TransModeId { get; set; }

    public DateOnly ExpenseDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ExpenseType? ExpenseType { get; set; }

    public virtual TransMode? TransMode { get; set; }

}
