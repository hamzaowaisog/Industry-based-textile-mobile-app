using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToOrdersAndPurchases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add user_id to purchases if missing; rename PascalCase column from partial run if present
            migrationBuilder.Sql(@"
                SET @dbname = DATABASE();
                SET @has_snake = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                                  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'purchases' AND COLUMN_NAME = 'user_id');
                SET @has_pascal = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                                   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'purchases' AND COLUMN_NAME = 'UserId');
                SET @sql = IF(@has_snake > 0, 'SELECT 1',
                           IF(@has_pascal > 0,
                              'ALTER TABLE `purchases` CHANGE COLUMN `UserId` `user_id` INT NULL',
                              'ALTER TABLE `purchases` ADD COLUMN `user_id` INT NULL'));
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Add user_id to orders if missing; rename PascalCase column from partial run if present
            migrationBuilder.Sql(@"
                SET @dbname = DATABASE();
                SET @has_snake = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                                  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'user_id');
                SET @has_pascal = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                                   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'UserId');
                SET @sql = IF(@has_snake > 0, 'SELECT 1',
                           IF(@has_pascal > 0,
                              'ALTER TABLE `orders` CHANGE COLUMN `UserId` `user_id` INT NULL',
                              'ALTER TABLE `orders` ADD COLUMN `user_id` INT NULL'));
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            // Patch null client.user_id records — assign to the first admin user as fallback
            migrationBuilder.Sql(@"
                UPDATE clients
                SET user_id = (SELECT MIN(id) FROM users)
                WHERE user_id IS NULL
                  AND EXISTS (SELECT 1 FROM users);
            ");

            // Backfill orders.user_id from their client's user_id
            migrationBuilder.Sql(@"
                UPDATE orders o
                INNER JOIN clients c ON c.id = o.client_id
                SET o.user_id = c.user_id
                WHERE o.user_id IS NULL AND c.user_id IS NOT NULL;
            ");

            // Backfill purchases.user_id from their supplier's user_id
            migrationBuilder.Sql(@"
                UPDATE purchases p
                INNER JOIN clients c ON c.id = p.supplier_id
                SET p.user_id = c.user_id
                WHERE p.user_id IS NULL AND c.user_id IS NOT NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "UserId", table: "purchases");
            migrationBuilder.DropColumn(name: "UserId", table: "orders");
        }
    }
}
