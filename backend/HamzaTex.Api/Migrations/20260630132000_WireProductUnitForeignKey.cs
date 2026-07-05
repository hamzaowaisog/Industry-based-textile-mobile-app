using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class WireProductUnitForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add nullable first so existing rows don't violate NOT NULL before we backfill
            migrationBuilder.AddColumn<int>(
                name: "unit_id",
                table: "products",
                type: "int",
                nullable: true);

            // Map existing string values → unit IDs (seed IDs: m=1, kg=2, pcs=3, yard=4, roll=5, bale=6, cone=7)
            migrationBuilder.Sql("UPDATE products SET unit_id = 1 WHERE LOWER(unit) IN ('m','metre','meter','metres','meters')");
            migrationBuilder.Sql("UPDATE products SET unit_id = 2 WHERE LOWER(unit) IN ('kg','kilogram','kilograms','kgs')");
            migrationBuilder.Sql("UPDATE products SET unit_id = 3 WHERE LOWER(unit) IN ('pcs','piece','pieces','pc')");
            migrationBuilder.Sql("UPDATE products SET unit_id = 4 WHERE LOWER(unit) IN ('yard','yards','yd','yds')");
            migrationBuilder.Sql("UPDATE products SET unit_id = 5 WHERE LOWER(unit) IN ('roll','rolls')");
            migrationBuilder.Sql("UPDATE products SET unit_id = 6 WHERE LOWER(unit) IN ('bale','bales')");
            migrationBuilder.Sql("UPDATE products SET unit_id = 7 WHERE LOWER(unit) IN ('cone','cones')");
            // Default: anything unrecognised falls back to m (id=1) so no row is left null
            migrationBuilder.Sql("UPDATE products SET unit_id = 1 WHERE unit_id IS NULL");

            // Enforce NOT NULL now that every row has a value
            migrationBuilder.AlterColumn<int>(
                name: "unit_id",
                table: "products",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_products_unit_id",
                table: "products",
                column: "unit_id");

            migrationBuilder.AddForeignKey(
                name: "FK_products_units_unit_id",
                table: "products",
                column: "unit_id",
                principalTable: "units",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            // Drop the old free-text column after migration is complete
            migrationBuilder.DropColumn(
                name: "unit",
                table: "products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_products_units_unit_id",
                table: "products");

            migrationBuilder.DropIndex(
                name: "IX_products_unit_id",
                table: "products");

            // Restore unit string from the unit name before dropping the FK column
            migrationBuilder.AddColumn<string>(
                name: "unit",
                table: "products",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.Sql("UPDATE products p JOIN units u ON p.unit_id = u.id SET p.unit = u.name");

            migrationBuilder.AlterColumn<string>(
                name: "unit",
                table: "products",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.DropColumn(
                name: "unit_id",
                table: "products");
        }
    }
}
