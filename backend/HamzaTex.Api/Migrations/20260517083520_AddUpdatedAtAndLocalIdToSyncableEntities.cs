using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdatedAtAndLocalIdToSyncableEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "transactions",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "stock_movements",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "stock_movements",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "purchases",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "purchases",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "purchase_lines",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "products",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "payments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "payments",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "payment_allocations",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "orders",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "orders",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "order_lines",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "invoices",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "invoice_lines",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "expenses",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "expenses",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocalId",
                table: "clients",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "clients",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "stock_movements");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "stock_movements");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "purchases");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "purchases");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "purchase_lines");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "products");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "payment_allocations");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "order_lines");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "invoices");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "invoice_lines");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "LocalId",
                table: "clients");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "clients");
        }
    }
}
