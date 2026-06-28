using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class BackfillStockMovementDimensionOverride : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Manual Out (source=3, type=2) = purchase cancellation reversal → Cost (1)
            migrationBuilder.Sql(@"
                UPDATE stock_movements
                SET AverageDimensionOverride = 1
                WHERE movement_source_id = 3 AND movement_type_id = 2;");

            // Manual In (source=3, type=1) = order cancellation reversal → Price (2)
            migrationBuilder.Sql(@"
                UPDATE stock_movements
                SET AverageDimensionOverride = 2
                WHERE movement_source_id = 3 AND movement_type_id = 1;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE stock_movements
                SET AverageDimensionOverride = NULL
                WHERE movement_source_id = 3;");
        }
    }
}
