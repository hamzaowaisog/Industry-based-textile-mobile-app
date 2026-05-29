using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddViews : Migration
    {
                /// <inheritdoc />
            protected override void Up(MigrationBuilder migrationBuilder)
        {
            // v_client_balance
            migrationBuilder.Sql(@"
                CREATE VIEW v_client_balance AS
                SELECT
                    c.id                             AS client_id,
                    c.name                           AS name,
                    (COALESCE(c.opening_balance, 0)
                    + COALESCE(SUM(t.amount), 0))   AS balance
                FROM clients c
                LEFT JOIN transactions t
                    ON t.client_id = c.id
                GROUP BY c.id, c.name, c.opening_balance;
            ");

            // v_monthly_profit_loss  (example - adjust to your business rules)
            migrationBuilder.Sql(@"
                CREATE VIEW v_monthly_profit_loss AS
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
                        0 AS total_expenses  -- or join expenses table if you want
                    FROM transactions t
                    LEFT JOIN trans_types tt ON t.trans_type_id = tt.id
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_client_balance;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_profit_loss;");
        }
    }
}
