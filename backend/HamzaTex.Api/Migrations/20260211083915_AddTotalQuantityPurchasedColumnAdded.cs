using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTotalQuantityPurchasedColumnAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TotalQuantitySold",
                table: "products",
                newName: "total_quantity_sold");

            migrationBuilder.AlterColumn<decimal>(
                name: "total_quantity_sold",
                table: "products",
                type: "decimal(14,2)",
                precision: 14,
                scale: 2,
                nullable: true,
                defaultValueSql: "0",
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)",
                oldNullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "total_quantity_purchased",
                table: "products",
                type: "decimal(14,2)",
                precision: 14,
                scale: 2,
                nullable: true,
                defaultValueSql: "0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "total_quantity_purchased",
                table: "products");

            migrationBuilder.RenameColumn(
                name: "total_quantity_sold",
                table: "products",
                newName: "TotalQuantitySold");

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalQuantitySold",
                table: "products",
                type: "decimal(65,30)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(14,2)",
                oldPrecision: 14,
                oldScale: 2,
                oldNullable: true,
                oldDefaultValueSql: "0");
        }
    }
}
