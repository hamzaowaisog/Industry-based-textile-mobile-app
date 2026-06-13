namespace HamzaTex.Api.Models;

public class NotificationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public int? EntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateNotificationDto
{
    public int UserId { get; set; }
    public string Type { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public int? EntityId { get; set; }
}

public class UnreadCountDto
{
    public int Count { get; set; }
}
