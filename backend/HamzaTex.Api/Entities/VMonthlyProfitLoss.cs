using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Entities;

public partial class VMonthlyProfitLoss
{
    public DateTime? Month { get; set; }

    public decimal? TotalSales { get; set; }

    public decimal? TotalPurchases { get; set; }

    public decimal? TotalExpenses { get; set; }

    public decimal? GrossProfit { get; set; }

    public decimal? NetProfit { get; set; }
}
