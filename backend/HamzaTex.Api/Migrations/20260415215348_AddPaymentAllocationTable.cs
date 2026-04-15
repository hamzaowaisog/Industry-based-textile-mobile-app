using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentAllocationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_reversed",
                table: "payments",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "original_payment_id",
                table: "payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "reversed_by_payment_id",
                table: "payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "transaction_id",
                table: "payments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "user_id",
                table: "payments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "payment_allocations",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    payment_id = table.Column<int>(type: "int", nullable: false),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    purchase_id = table.Column<int>(type: "int", nullable: true),
                    allocated_amount = table.Column<decimal>(type: "decimal(14,2)", precision: 14, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("payment_allocations_pkey", x => x.id);
                    table.ForeignKey(
                        name: "payment_allocations_order_id_fkey",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "payment_allocations_payment_id_fkey",
                        column: x => x.payment_id,
                        principalTable: "payments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "payment_allocations_purchase_id_fkey",
                        column: x => x.purchase_id,
                        principalTable: "purchases",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_payments_is_reversed",
                table: "payments",
                column: "is_reversed");

            migrationBuilder.CreateIndex(
                name: "IX_payments_original_payment_id",
                table: "payments",
                column: "original_payment_id");

            migrationBuilder.CreateIndex(
                name: "IX_payments_reversed_by_payment_id",
                table: "payments",
                column: "reversed_by_payment_id");

            migrationBuilder.CreateIndex(
                name: "IX_payments_transaction_id",
                table: "payments",
                column: "transaction_id");

            migrationBuilder.CreateIndex(
                name: "IX_payments_user_id",
                table: "payments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_allocations_order_id",
                table: "payment_allocations",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_allocations_payment_id",
                table: "payment_allocations",
                column: "payment_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_allocations_purchase_id",
                table: "payment_allocations",
                column: "purchase_id");

            migrationBuilder.AddForeignKey(
                name: "payments_original_payment_id_fkey",
                table: "payments",
                column: "original_payment_id",
                principalTable: "payments",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "payments_reversed_by_payment_id_fkey",
                table: "payments",
                column: "reversed_by_payment_id",
                principalTable: "payments",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "payments_transaction_id_fkey",
                table: "payments",
                column: "transaction_id",
                principalTable: "transactions",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "payments_user_id_fkey",
                table: "payments",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "payments_original_payment_id_fkey",
                table: "payments");

            migrationBuilder.DropForeignKey(
                name: "payments_reversed_by_payment_id_fkey",
                table: "payments");

            migrationBuilder.DropForeignKey(
                name: "payments_transaction_id_fkey",
                table: "payments");

            migrationBuilder.DropForeignKey(
                name: "payments_user_id_fkey",
                table: "payments");

            migrationBuilder.DropTable(
                name: "payment_allocations");

            migrationBuilder.DropIndex(
                name: "IX_payments_is_reversed",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_payments_original_payment_id",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_payments_reversed_by_payment_id",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_payments_transaction_id",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_payments_user_id",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "is_reversed",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "original_payment_id",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "reversed_by_payment_id",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "transaction_id",
                table: "payments");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "payments");
        }
    }
}
