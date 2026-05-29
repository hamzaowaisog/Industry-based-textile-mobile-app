using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddedExpensesForeingKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "clients",
                newName: "user_id");

            migrationBuilder.RenameIndex(
                name: "IX_clients_UserId",
                table: "clients",
                newName: "IX_clients_user_id");

            migrationBuilder.AddColumn<int>(
                name: "trans_category_id",
                table: "expenses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "transaction_id",
                table: "expenses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "user_id",
                table: "expenses",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_expenses_trans_category_id",
                table: "expenses",
                column: "trans_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_transaction_id",
                table: "expenses",
                column: "transaction_id");

            migrationBuilder.CreateIndex(
                name: "IX_expenses_user_id",
                table: "expenses",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "expenses_trans_category_id_fkey",
                table: "expenses",
                column: "trans_category_id",
                principalTable: "trans_categories",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "expenses_transaction_id_fkey",
                table: "expenses",
                column: "transaction_id",
                principalTable: "transactions",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "expenses_user_id_fkey",
                table: "expenses",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "expenses_trans_category_id_fkey",
                table: "expenses");

            migrationBuilder.DropForeignKey(
                name: "expenses_transaction_id_fkey",
                table: "expenses");

            migrationBuilder.DropForeignKey(
                name: "expenses_user_id_fkey",
                table: "expenses");

            migrationBuilder.DropIndex(
                name: "IX_expenses_trans_category_id",
                table: "expenses");

            migrationBuilder.DropIndex(
                name: "IX_expenses_transaction_id",
                table: "expenses");

            migrationBuilder.DropIndex(
                name: "IX_expenses_user_id",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "trans_category_id",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "transaction_id",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "expenses");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "clients",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_clients_user_id",
                table: "clients",
                newName: "IX_clients_UserId");
        }
    }
}
