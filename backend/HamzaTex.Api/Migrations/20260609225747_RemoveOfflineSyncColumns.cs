using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOfflineSyncColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "stock_movements");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "stock_movements");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "stock_movements");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "purchases");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "purchases");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "purchases");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "purchase_lines");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "purchase_lines");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "products");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "products");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "products");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "payment_allocations");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "payment_allocations");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "payment_allocations");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "order_lines");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "order_lines");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "invoices");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "invoices");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "invoices");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "invoice_lines");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "invoice_lines");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "clients");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "transactions",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "transactions",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "stock_movements",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "stock_movements",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "stock_movements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "purchases",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "purchases",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "purchases",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "purchase_lines",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "purchase_lines",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "products",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "products",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "payments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "payments",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "payments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "payment_allocations",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "payment_allocations",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "payment_allocations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "orders",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "orders",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "order_lines",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "order_lines",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "invoices",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "invoices",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "invoices",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "invoice_lines",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "invoice_lines",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "expenses",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "expenses",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "expenses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "clients",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "clients",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "clients",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
