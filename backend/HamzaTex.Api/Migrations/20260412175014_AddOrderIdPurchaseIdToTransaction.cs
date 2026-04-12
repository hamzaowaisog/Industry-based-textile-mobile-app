using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderIdPurchaseIdToTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "transactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PurchaseId",
                table: "transactions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_transactions_order_id",
                table: "transactions",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_transactions_purchase_id",
                table: "transactions",
                column: "PurchaseId");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_transactions_orders_OrderId",
                table: "transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_purchases_PurchaseId",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_transactions_order_id",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_transactions_purchase_id",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "PurchaseId",
                table: "transactions");
        }
    }
}
