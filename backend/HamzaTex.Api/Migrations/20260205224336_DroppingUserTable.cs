using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HamzaTex.Api.Migrations
{
    /// <inheritdoc />
    public partial class DroppingUserTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS `user`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
