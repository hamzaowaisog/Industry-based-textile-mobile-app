namespace HamzaTex.Api.Entities;

public partial class TransMode
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}