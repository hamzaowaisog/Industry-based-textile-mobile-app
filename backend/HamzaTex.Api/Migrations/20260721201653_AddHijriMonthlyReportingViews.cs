using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHijriMonthlyReportingViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE VIEW v_monthly_profit_loss_hijri AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY hijri_month) AS id,
                    hijri_month,
                    total_sales,
                    total_purchases,
                    total_expenses,
                    (total_sales - total_purchases) AS gross_profit,
                    (total_sales - total_purchases - total_expenses) AS net_profit
                FROM (
                    SELECT
                        SUBSTRING(t.trans_date_hijri, 1, 7) AS hijri_month,
                        SUM(CASE WHEN t.trans_category_id = 1 THEN t.amount ELSE 0 END) AS total_sales,
                        SUM(CASE WHEN t.trans_category_id = 2 THEN t.amount ELSE 0 END) AS total_purchases,
                        SUM(CASE WHEN t.trans_category_id IN (3, 4) THEN t.amount ELSE 0 END) AS total_expenses
                    FROM transactions t
                    WHERE t.trans_date_hijri IS NOT NULL
                    GROUP BY SUBSTRING(t.trans_date_hijri, 1, 7)
                ) x;
            ");

            migrationBuilder.Sql(@"
                CREATE VIEW v_monthly_credit_debit_hijri AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY hijri_month) AS id,
                    hijri_month,
                    total_credit,
                    total_debit,
                    (total_credit - total_debit) AS balance
                FROM (
                    SELECT
                        SUBSTRING(t.trans_date_hijri, 1, 7) AS hijri_month,
                        SUM(CASE WHEN t.trans_type_id = 2 THEN t.amount ELSE 0 END) AS total_credit,
                        SUM(CASE WHEN t.trans_type_id = 1 THEN t.amount ELSE 0 END) AS total_debit
                    FROM transactions t
                    WHERE t.trans_category_id IN (5, 6, 7, 8) AND t.trans_date_hijri IS NOT NULL
                    GROUP BY SUBSTRING(t.trans_date_hijri, 1, 7)
                ) x;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_profit_loss_hijri;");
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_monthly_credit_debit_hijri;");
        }
    }
}
