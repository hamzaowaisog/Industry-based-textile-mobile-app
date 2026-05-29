using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseStatusAndStatusId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_purchases_PurchaseId",
                table: "transactions");

            migrationBuilder.AddColumn<int>(
                name: "status_id",
                table: "purchases",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "purchase_statuses",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("purchase_statuses_pkey", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_purchases_status_id",
                table: "purchases",
                column: "status_id");

            migrationBuilder.AddForeignKey(
                name: "purchases_status_id_fkey",
                table: "purchases",
                column: "status_id",
                principalTable: "purchase_statuses",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_purchases_PurchaseId",
                table: "transactions",
                column: "PurchaseId",
                principalTable: "purchases",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "purchases_status_id_fkey",
                table: "purchases");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_purchases_PurchaseId",
                table: "transactions");

            migrationBuilder.DropTable(
                name: "purchase_statuses");

            migrationBuilder.DropIndex(
                name: "IX_purchases_status_id",
                table: "purchases");

            migrationBuilder.DropColumn(
                name: "status_id",
                table: "purchases");

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions",
                column: "OrderId",
                principalTable: "orders",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_purchases_PurchaseId",
                table: "transactions",
                column: "PurchaseId",
                principalTable: "purchases",
                principalColumn: "id");
        }
    }
}
