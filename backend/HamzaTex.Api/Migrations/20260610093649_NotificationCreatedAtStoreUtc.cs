using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class NotificationCreatedAtStoreUtc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Reverts NotificationCreatedAtLocalTime (+5h PKT shift); store UTC wall clock again.
            migrationBuilder.Sql(
                "UPDATE notifications SET created_at = DATE_SUB(created_at, INTERVAL 5 HOUR)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE notifications SET created_at = DATE_ADD(created_at, INTERVAL 5 HOUR)");
        }
    }
}
