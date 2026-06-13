using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class SyncUserIdColumnMapping : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Rename only if the PascalCase column still exists (previous migration already handled this via raw SQL)
            migrationBuilder.Sql(@"
                SET @dbname = DATABASE();
                SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'purchases' AND COLUMN_NAME = 'UserId');
                SET @sql = IF(@col > 0, 'ALTER TABLE `purchases` CHANGE COLUMN `UserId` `user_id` INT NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
            ");
            migrationBuilder.Sql(@"
                SET @dbname = DATABASE();
                SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'UserId');
                SET @sql = IF(@col > 0, 'ALTER TABLE `orders` CHANGE COLUMN `UserId` `user_id` INT NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "purchases",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "orders",
                newName: "UserId");
        }
    }
}
