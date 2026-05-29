namespace HamzaTex.Api.Services.ViewModel;

public class ProfitLossViewModel
{
    public string Month { get; set; } = string.Empty;
    public decimal TotalSales { get; set; }
    public decimal TotalPurchases { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal GrossProfit { get; set; }
    public decimal NetProfit { get; set; }
}

public class ClientBalanceViewModel
{
    public int ClientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ClientTypeName { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}

public class CreditDebitViewModel
{
    public string Month { get; set; } = string.Empty;
    public decimal TotalCredit { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal Balance { get; set; }
}

public class SummaryTotalsViewModel
{
    public decimal TotalSalesAmount { get; set; }
    public decimal TotalPurchasesAmount { get; set; }
    public decimal TotalExpensesAmount { get; set; }
    public int TotalOrderCount { get; set; }
    public int TotalPurchaseCount { get; set; }
    public int TotalClientsCount { get; set; }
}

public class ClientDetailViewModel
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientTypeName { get; set; } = string.Empty;
    public int TotalOrderCount { get; set; }
    public decimal TotalOrderAmount { get; set; }
    public int TotalPurchaseCount { get; set; }
    public decimal TotalPurchaseAmount { get; set; }
    public decimal TotalPaymentsIn { get; set; }
    public decimal TotalPaymentsOut { get; set; }
    public decimal Outstanding { get; set; }
    public decimal Balance { get; set; }
    public List<ClientOrderSummary> Orders { get; set; } = [];
    public List<ClientPurchaseSummary> Purchases { get; set; } = [];
    public List<ClientPaymentSummary> Payments { get; set; } = [];
    public List<ClientTransactionSummary> RecentTransactions { get; set; } = [];
}

public class ClientOrderSummary
{
    public int OrderId { get; set; }
    public DateOnly OrderDate { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal Outstanding { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
}

public class ClientPurchaseSummary
{
    public int PurchaseId { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal Outstanding { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
}

public class ClientPaymentSummary
{
    public int PaymentId { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string DirectionName { get; set; } = string.Empty;
    public string ModeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsReversed { get; set; }
}

public class ClientTransactionSummary
{
    public int TransactionId { get; set; }
    public DateOnly TransDate { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string TypeName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
