using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddInvoiceTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "invoice_id",
                table: "transactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "invoice_id",
                table: "payment_allocations",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "invoice_statuses",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("invoice_statuses_pkey", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "invoices",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    invoice_number = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    purchase_id = table.Column<int>(type: "int", nullable: true),
                    client_id = table.Column<int>(type: "int", nullable: true),
                    invoice_status_id = table.Column<int>(type: "int", nullable: false),
                    issue_date = table.Column<DateTime>(type: "date", nullable: true),
                    due_date = table.Column<DateTime>(type: "date", nullable: true),
                    total_amount = table.Column<decimal>(type: "decimal(14,2)", nullable: false),
                    notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_by_user_id = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("invoices_pkey", x => x.id);
                    table.ForeignKey(
                        name: "FK_invoices_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_invoices_invoice_statuses_invoice_status_id",
                        column: x => x.invoice_status_id,
                        principalTable: "invoice_statuses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_invoices_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_invoices_purchases_purchase_id",
                        column: x => x.purchase_id,
                        principalTable: "purchases",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_invoices_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "invoice_lines",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    invoice_id = table.Column<int>(type: "int", nullable: false),
                    product_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    qty = table.Column<decimal>(type: "decimal(14,2)", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(14,4)", nullable: false),
                    line_total = table.Column<decimal>(type: "decimal(14,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("invoice_lines_pkey", x => x.id);
                    table.ForeignKey(
                        name: "FK_invoice_lines_invoices_invoice_id",
                        column: x => x.invoice_id,
                        principalTable: "invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_transactions_invoice_id",
                table: "transactions",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_payment_allocations_invoice_id",
                table: "payment_allocations",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoice_lines_invoice_id",
                table: "invoice_lines",
                column: "invoice_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_client_id",
                table: "invoices",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_created_by_user_id",
                table: "invoices",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_number",
                table: "invoices",
                column: "invoice_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_invoices_order_id",
                table: "invoices",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_purchase_id",
                table: "invoices",
                column: "purchase_id");

            migrationBuilder.CreateIndex(
                name: "IX_invoices_status_id",
                table: "invoices",
                column: "invoice_status_id");

            migrationBuilder.AddForeignKey(
                name: "FK_payment_allocations_invoices_invoice_id",
                table: "payment_allocations",
                column: "invoice_id",
                principalTable: "invoices",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_transactions_invoices_invoice_id",
                table: "transactions",
                column: "invoice_id",
                principalTable: "invoices",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_payment_allocations_invoices_invoice_id",
                table: "payment_allocations");

            migrationBuilder.DropForeignKey(
                name: "FK_transactions_invoices_invoice_id",
                table: "transactions");

            migrationBuilder.DropTable(
                name: "invoice_lines");

            migrationBuilder.DropTable(
                name: "invoices");

            migrationBuilder.DropTable(
                name: "invoice_statuses");

            migrationBuilder.DropIndex(
                name: "IX_transactions_invoice_id",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_payment_allocations_invoice_id",
                table: "payment_allocations");

            migrationBuilder.DropColumn(
                name: "invoice_id",
                table: "transactions");

            migrationBuilder.DropColumn(
                name: "invoice_id",
                table: "payment_allocations");
        }
    }
}
