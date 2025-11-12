using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

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
