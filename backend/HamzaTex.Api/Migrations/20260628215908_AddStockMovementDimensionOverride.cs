using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStockMovementDimensionOverride : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AverageDimensionOverride",
                table: "stock_movements",
                type: "int",
                nullable: true);

            // Backfill existing cancellation-reversal movements so replays resolve
            // the correct average dimension without needing the runtime override.
            //
            // Manual Out (source=3, type=2) = purchase cancellation → Cost (1)
            migrationBuilder.Sql(@"
                UPDATE stock_movements
                SET AverageDimensionOverride = 1
                WHERE movement_source_id = 3 AND movement_type_id = 2;");

            // Manual In (source=3, type=1) = order cancellation → Price (2)
            migrationBuilder.Sql(@"
                UPDATE stock_movements
                SET AverageDimensionOverride = 2
                WHERE movement_source_id = 3 AND movement_type_id = 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AverageDimensionOverride",
                table: "stock_movements");
        }
    }
}
