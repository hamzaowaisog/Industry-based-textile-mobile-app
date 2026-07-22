using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HamzaTex.Api.Entities;

/// <summary>Read-only mapping of the v_monthly_profit_loss_hijri database view — same shape as VMonthlyProfitLoss but grouped by Hijri year-month ("1448-01") instead of a Gregorian DateTime.</summary>
public partial class VMonthlyProfitLossHijri
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string? HijriMonth { get; set; }

    public decimal? TotalSales { get; set; }

    public decimal? TotalPurchases { get; set; }

    public decimal? TotalExpenses { get; set; }

    public decimal? GrossProfit { get; set; }

    public decimal? NetProfit { get; set; }
}
