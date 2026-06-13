using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Entities;

[Index(nameof(UserId), Name = "IX_notifications_user_id")]
[Index(nameof(IsRead), Name = "IX_notifications_is_read")]
[Index(nameof(UserId), nameof(IsRead), Name = "IX_notifications_user_is_read")]
public class Notification
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Type { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Body { get; set; } = null!;

    public int? EntityId { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ApplicationUser User { get; set; } = null!;
}
