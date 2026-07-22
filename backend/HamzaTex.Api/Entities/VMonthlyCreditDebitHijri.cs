using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HamzaTex.Api.Entities;

/// <summary>Read-only mapping of the v_monthly_credit_debit_hijri database view — same shape as VMonthlyCreditDebit but grouped by Hijri year-month ("1448-01") instead of a Gregorian DateTime.</summary>
public partial class VMonthlyCreditDebitHijri
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public string? HijriMonth { get; set; }

    public decimal? TotalCredit { get; set; }

    public decimal? TotalDebit { get; set; }

    public decimal? Balance { get; set; }
}
