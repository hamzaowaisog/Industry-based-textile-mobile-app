using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixVClientBalanceExcludeReversalPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_client_balance;");
            migrationBuilder.Sql(@"
CREATE VIEW v_client_balance AS
SELECT
    c.id        AS client_id,
    c.name,
    COALESCE(t.order_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS order_total
    FROM transactions
    WHERE trans_category_id = 1
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 1
      AND is_reversed = 0
      AND original_payment_id IS NULL
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 1

UNION ALL

SELECT
    c.id,
    c.name,
    COALESCE(t.purchase_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS purchase_total
    FROM transactions
    WHERE trans_category_id = 2
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 2
      AND is_reversed = 0
      AND original_payment_id IS NULL
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 2;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_client_balance;");
            migrationBuilder.Sql(@"
CREATE VIEW v_client_balance AS
SELECT
    c.id        AS client_id,
    c.name,
    COALESCE(t.order_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS order_total
    FROM transactions
    WHERE trans_category_id = 1
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 1
      AND is_reversed = 0
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 1

UNION ALL

SELECT
    c.id,
    c.name,
    COALESCE(t.purchase_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS purchase_total
    FROM transactions
    WHERE trans_category_id = 2
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 2
      AND is_reversed = 0
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 2;
");
        }
    }
}
