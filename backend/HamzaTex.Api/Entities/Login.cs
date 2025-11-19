using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(Username), Name = "IX_logins_username")]
public partial class Login
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UserId { get; set; }    
    [ForeignKey(nameof(UserId))]
    public string? Username { get; set; }
    public string? Password { get; set; }
    public DateTime? CreatedAt { get; set; }
    public virtual User User { get; set; } = null!;
}