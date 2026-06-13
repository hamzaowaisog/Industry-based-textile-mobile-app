using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class NotificationCreatedAtLocalTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Prior inserts used DateTime.UtcNow; shift existing rows to business-local (PKT, UTC+5).
            migrationBuilder.Sql(
                "UPDATE notifications SET created_at = DATE_ADD(created_at, INTERVAL 5 HOUR)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE notifications SET created_at = DATE_SUB(created_at, INTERVAL 5 HOUR)");
        }
    }
}
