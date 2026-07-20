using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemovalOfUserId1fromTables : Migration
    {
        /// <inheritdoc />
        private static string DropColumnIfExistsSql(string table) => $@"
            SET @dbname = DATABASE();
            SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                           WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = '{table}' AND COLUMN_NAME = 'UserId1');
            SET @sql = IF(@exists > 0, 'ALTER TABLE `{table}` DROP COLUMN `UserId1`', 'SELECT 1');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        ";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(DropColumnIfExistsSql("expenses"));
            migrationBuilder.Sql(DropColumnIfExistsSql("transactions"));
            migrationBuilder.Sql(DropColumnIfExistsSql("clients"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
