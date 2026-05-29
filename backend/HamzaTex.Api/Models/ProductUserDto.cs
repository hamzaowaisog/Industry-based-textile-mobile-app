namespace HamzaTex.Api.Models;

public class ProductUserDto
{
    public int ProductId { get; set; }
    public int UserId { get; set; }
    public DateOnly Date { get; set; }
}

public class CreateProductUserDto
{
    public int ProductId { get; set; }
    public int UserId { get; set; }
}