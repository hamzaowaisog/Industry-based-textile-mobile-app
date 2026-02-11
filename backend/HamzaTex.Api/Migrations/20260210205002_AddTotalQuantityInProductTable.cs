using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTotalQuantityInProductTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "average_cost_at_movement",
                table: "stock_movements",
                type: "decimal(14,4)",
                precision: 14,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "average_price_at_movement",
                table: "stock_movements",
                type: "decimal(14,4)",
                precision: 14,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalQuantitySold",
                table: "products",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "average_cost",
                table: "products",
                type: "decimal(14,4)",
                precision: 14,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "average_price",
                table: "products",
                type: "decimal(14,4)",
                precision: 14,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "cost_change_count",
                table: "products",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "price_change_count",
                table: "products",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "average_cost_at_movement",
                table: "stock_movements");

            migrationBuilder.DropColumn(
                name: "average_price_at_movement",
                table: "stock_movements");

            migrationBuilder.DropColumn(
                name: "TotalQuantitySold",
                table: "products");

            migrationBuilder.DropColumn(
                name: "average_cost",
                table: "products");

            migrationBuilder.DropColumn(
                name: "average_price",
                table: "products");

            migrationBuilder.DropColumn(
                name: "cost_change_count",
                table: "products");

            migrationBuilder.DropColumn(
                name: "price_change_count",
                table: "products");
        }
    }
}
