using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddedIndexingForEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "users",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "products",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "logins",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "phone",
                table: "clients",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "clients",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "IX_users_is_active",
                table: "users",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_users_is_active_created_at",
                table: "users",
                columns: new[] { "is_active", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_transactions_client_date",
                table: "transactions",
                columns: new[] { "client_id", "trans_date" });

            migrationBuilder.CreateIndex(
                name: "IX_transactions_trans_date",
                table: "transactions",
                column: "trans_date");

            migrationBuilder.CreateIndex(
                name: "IX_transactions_type_date",
                table: "transactions",
                columns: new[] { "trans_type_id", "trans_date" });

            migrationBuilder.CreateIndex(
                name: "IX_transactions_user_date",
                table: "transactions",
                columns: new[] { "user_id", "trans_date" });

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_movement_date",
                table: "stock_movements",
                column: "movement_date");

            migrationBuilder.CreateIndex(
                name: "IX_stock_movements_product_date",
                table: "stock_movements",
                columns: new[] { "product_id", "movement_date" });

            migrationBuilder.CreateIndex(
                name: "IX_purchases_purchase_date",
                table: "purchases",
                column: "purchase_date");

            migrationBuilder.CreateIndex(
                name: "IX_purchases_supplier_date",
                table: "purchases",
                columns: new[] { "supplier_id", "purchase_date" });

            migrationBuilder.CreateIndex(
                name: "IX_products_is_active",
                table: "products",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_products_is_active_name",
                table: "products",
                columns: new[] { "is_active", "name" });

            migrationBuilder.CreateIndex(
                name: "IX_products_name",
                table: "products",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_payments_client_date",
                table: "payments",
                columns: new[] { "party_client_id", "payment_date" });

            migrationBuilder.CreateIndex(
                name: "IX_payments_payment_date",
                table: "payments",
                column: "payment_date");

            migrationBuilder.CreateIndex(
                name: "IX_orders_client_date",
                table: "orders",
                columns: new[] { "client_id", "order_date" });

            migrationBuilder.CreateIndex(
                name: "IX_orders_order_date",
                table: "orders",
                column: "order_date");

            migrationBuilder.CreateIndex(
                name: "IX_orders_status_date",
                table: "orders",
                columns: new[] { "status_id", "order_date" });

            migrationBuilder.CreateIndex(
                name: "IX_logins_username",
                table: "logins",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_expenses_expense_date",
                table: "expenses",
                column: "expense_date");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_type_date",
                table: "expenses",
                columns: new[] { "expense_type_id", "expense_date" });

            migrationBuilder.CreateIndex(
                name: "IX_clients_is_active",
                table: "clients",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "IX_clients_name",
                table: "clients",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_clients_phone",
                table: "clients",
                column: "phone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_email",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_is_active",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_users_is_active_created_at",
                table: "users");

            migrationBuilder.DropIndex(
                name: "IX_transactions_client_date",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_transactions_trans_date",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_transactions_type_date",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_transactions_user_date",
                table: "transactions");

            migrationBuilder.DropIndex(
                name: "IX_stock_movements_movement_date",
                table: "stock_movements");

            migrationBuilder.DropIndex(
                name: "IX_stock_movements_product_date",
                table: "stock_movements");

            migrationBuilder.DropIndex(
                name: "IX_purchases_purchase_date",
                table: "purchases");

            migrationBuilder.DropIndex(
                name: "IX_purchases_supplier_date",
                table: "purchases");

            migrationBuilder.DropIndex(
                name: "IX_products_is_active",
                table: "products");

            migrationBuilder.DropIndex(
                name: "IX_products_is_active_name",
                table: "products");

            migrationBuilder.DropIndex(
                name: "IX_products_name",
                table: "products");

            migrationBuilder.DropIndex(
                name: "IX_payments_client_date",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_payments_payment_date",
                table: "payments");

            migrationBuilder.DropIndex(
                name: "IX_orders_client_date",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_order_date",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_status_date",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_logins_username",
                table: "logins");

            migrationBuilder.DropIndex(
                name: "IX_expenses_expense_date",
                table: "expenses");

            migrationBuilder.DropIndex(
                name: "IX_expenses_type_date",
                table: "expenses");

            migrationBuilder.DropIndex(
                name: "IX_clients_is_active",
                table: "clients");

            migrationBuilder.DropIndex(
                name: "IX_clients_name",
                table: "clients");

            migrationBuilder.DropIndex(
                name: "IX_clients_phone",
                table: "clients");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "users",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "products",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "logins",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "phone",
                table: "clients",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "clients",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
