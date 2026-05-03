using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace HamzaTex.Api.Entities;

public partial class UserRole
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string? Name { get; set; }
    public DateOnly? CreatedAt { get; set; }
    public virtual ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
}

