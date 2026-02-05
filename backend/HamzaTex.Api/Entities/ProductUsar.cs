using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HamzaTex.Api.Entities;

public partial class ProductUser
{
    public int? ProductId { get; set; }
    public int? UserId { get; set; }
    public DateOnly Date { get; set; }
    public virtual Product? Product { get; set; } = null!;
    public virtual ApplicationUser? User { get; set; } = null!;
}