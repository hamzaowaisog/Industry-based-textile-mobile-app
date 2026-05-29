using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMonthlyProfitLossView : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_profit_loss;");
            migrationBuilder.Sql(@"CREATE VIEW v_monthly_profit_loss AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY month)                AS id,
                    month,
                    total_sales,
                    total_purchases,
                    total_expenses,
                    (total_sales - total_purchases)                   AS gross_profit,
                    (total_sales - total_purchases - total_expenses)  AS net_profit
                FROM (
                    SELECT
                        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
                        SUM(CASE WHEN tt.name = 'Sale'     THEN t.amount ELSE 0 END) AS total_sales,
                        SUM(CASE WHEN tt.name = 'Purchase' THEN t.amount ELSE 0 END) AS total_purchases,
                        SUM(CASE WHEN tt.name like '%Expense%' THEN t.amount ELSE 0 END) AS total_expenses  -- or join expenses table if you want
                    FROM transactions t
                    LEFT JOIN trans_categories tt ON t.trans_category_id = tt.id
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;");
                migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_credit_debit;");
                migrationBuilder.Sql(@"CREATE VIEW v_monthly_credit_debit AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY month)                AS id,
                    month,
                    total_credit,
                    total_debit,
                    (total_credit - total_debit)                   AS balance
                FROM (
                    SELECT
                        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
                        SUM(CASE WHEN tt.name = 'Credit'     THEN t.amount ELSE 0 END) AS total_credit,
                        SUM(CASE WHEN tt.name = 'Debit' THEN t.amount ELSE 0 END) AS total_debit
                    FROM transactions t
                    LEFT JOIN trans_types tt ON t.trans_type_id = tt.id
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_profit_loss;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_credit_debit;");
        }
    }
}
