using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class Expense
{
    public Guid Id { get; set; }

    public string? SubCategory { get; set; }

    public decimal Amount { get; set; }

    public DateOnly ExpenseDate { get; set; }

    public string? Notes { get; set; }

    public DateTime? CreatedAt { get; set; }
}
