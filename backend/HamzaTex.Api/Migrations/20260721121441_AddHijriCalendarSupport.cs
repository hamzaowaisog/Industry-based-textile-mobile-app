using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHijriCalendarSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "trans_date_hijri",
                table: "transactions",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "movement_date_hijri",
                table: "stock_movements",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "purchase_date_hijri",
                table: "purchases",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "payment_date_hijri",
                table: "payments",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "order_date_hijri",
                table: "orders",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "due_date_hijri",
                table: "invoices",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "issue_date_hijri",
                table: "invoices",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "expense_date_hijri",
                table: "expenses",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    HijriOffsetDays = table.Column<int>(type: "int", nullable: false),
                    LastHijriReminderSentDate = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropColumn(
                name: "trans_date_hijri",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "movement_date_hijri",
                table: "stock_movements");

            migrationBuilder.DropColumn(
                name: "purchase_date_hijri",
                table: "purchases");

            migrationBuilder.DropColumn(
                name: "payment_date_hijri",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "order_date_hijri",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "due_date_hijri",
                table: "invoices");

            migrationBuilder.DropColumn(
                name: "issue_date_hijri",
                table: "invoices");

            migrationBuilder.DropColumn(
                name: "expense_date_hijri",
                table: "expenses");
        }
    }
}
