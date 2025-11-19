using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HamzaTex.Api.Entities;

public partial class VMonthlyProfitLoss
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public DateTime? Month { get; set; }

    public decimal? TotalSales { get; set; }

    public decimal? TotalPurchases { get; set; }

    public decimal? TotalExpenses { get; set; }

    public decimal? GrossProfit { get; set; }

    public decimal? NetProfit { get; set; }
}
