using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixProfitLossViewCategoryMatching : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix v_monthly_profit_loss: seed data uses "Sales" (id=1) and "Purchases" (id=2),
            // but the old view matched on tt.name = 'Sale' / 'Purchase' (singular).
            // Switch to trans_category_id matching for correctness.
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_profit_loss;");
            migrationBuilder.Sql(@"
                CREATE VIEW v_monthly_profit_loss AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY month) AS id,
                    month,
                    total_sales,
                    total_purchases,
                    total_expenses,
                    (total_sales - total_purchases)                  AS gross_profit,
                    (total_sales - total_purchases - total_expenses)  AS net_profit
                FROM (
                    SELECT
                        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
                        SUM(CASE WHEN t.trans_category_id = 1 THEN t.amount ELSE 0 END) AS total_sales,
                        SUM(CASE WHEN t.trans_category_id = 2 THEN t.amount ELSE 0 END) AS total_purchases,
                        SUM(CASE WHEN t.trans_category_id IN (3, 4) THEN t.amount ELSE 0 END) AS total_expenses
                    FROM transactions t
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore previous version that used name matching via trans_categories join
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_profit_loss;");
            migrationBuilder.Sql(@"
                CREATE VIEW v_monthly_profit_loss AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY month) AS id,
                    month,
                    total_sales,
                    total_purchases,
                    total_expenses,
                    (total_sales - total_purchases)                  AS gross_profit,
                    (total_sales - total_purchases - total_expenses)  AS net_profit
                FROM (
                    SELECT
                        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
                        SUM(CASE WHEN tt.name = 'Sale'     THEN t.amount ELSE 0 END) AS total_sales,
                        SUM(CASE WHEN tt.name = 'Purchase' THEN t.amount ELSE 0 END) AS total_purchases,
                        SUM(CASE WHEN tt.name like '%Expense%' THEN t.amount ELSE 0 END) AS total_expenses
                    FROM transactions t
                    LEFT JOIN trans_categories tt ON t.trans_category_id = tt.id
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;
            ");
        }
    }
}
