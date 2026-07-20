using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemovalOfUserId1fromTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE `expenses` DROP COLUMN IF EXISTS `UserId1`;");
            migrationBuilder.Sql("ALTER TABLE `transactions` DROP COLUMN IF EXISTS `UserId1`;");
            migrationBuilder.Sql("ALTER TABLE `clients` DROP COLUMN IF EXISTS `UserId1`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
