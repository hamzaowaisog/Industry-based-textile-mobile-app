namespace HamzaTex.Api.Entities;

public partial class ExpenseType
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}