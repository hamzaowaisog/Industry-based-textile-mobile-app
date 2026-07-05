using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOpeningBalanceLedgerCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed the lookup row directly (rather than relying on SeedData at app startup) so this
            // migration is self-contained if `dotnet ef database update` runs before the app ever starts.
            // SeedData.EnsureSeedDataAsync keys upserts by Id, so this is a no-op once it also runs.
            migrationBuilder.Sql(@"
INSERT INTO trans_categories (id, name, created_at)
VALUES (9, 'Opening Balance', CURDATE())
ON DUPLICATE KEY UPDATE name = name;
");

            // Backfill: give every existing non-zero opening balance a real ledger entry
            // (trans_category_id = 9, seeded as "Opening Balance") so it has an audit trail
            // instead of living only as a bare column on clients.
            migrationBuilder.Sql(@"
INSERT INTO transactions (client_id, trans_type_id, trans_mode_id, trans_category_id, amount, trans_date, notes, created_at)
SELECT
    c.id,
    CASE WHEN c.client_type_id = 1 THEN 2 ELSE 1 END,
    3,
    9,
    c.opening_balance,
    COALESCE(c.created_at, CURDATE()),
    CONCAT('Backfilled opening balance — Client #', c.id),
    CURDATE()
FROM clients c
WHERE c.opening_balance IS NOT NULL
  AND c.opening_balance <> 0
  AND NOT EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.client_id = c.id AND t.trans_category_id = 9
  );
");

            // v_client_balance now sums the ledger instead of reading the flat opening_balance
            // column directly, so subsequent adjustments (posted as further trans_category_id = 9
            // rows by ClientService) are reflected without redefining the view again.
            migrationBuilder.Sql("DROP VIEW IF EXISTS v_client_balance;");
            migrationBuilder.Sql(@"
CREATE VIEW v_client_balance AS
SELECT
    c.id AS client_id,
    c.name,
    COALESCE(ob.opening_balance_total, 0)
    + COALESCE(t.order_total, 0)
    - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS opening_balance_total
    FROM transactions
    WHERE trans_category_id = 9
    GROUP BY client_id
) ob ON ob.client_id = c.id
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
    COALESCE(ob.opening_balance_total, 0)
    + COALESCE(t.purchase_total, 0)
    - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS opening_balance_total
    FROM transactions
    WHERE trans_category_id = 9
    GROUP BY client_id
) ob ON ob.client_id = c.id
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
    c.id AS client_id,
    c.name,
    COALESCE(c.opening_balance, 0)
    + COALESCE(t.order_total, 0)
    - COALESCE(p.paid_total, 0) AS balance
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
    COALESCE(c.opening_balance, 0)
    + COALESCE(t.purchase_total, 0)
    - COALESCE(p.paid_total, 0) AS balance
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

            migrationBuilder.Sql(@"
DELETE FROM transactions
WHERE trans_category_id = 9
  AND notes LIKE 'Backfilled opening balance%';
");
        }
    }
}
