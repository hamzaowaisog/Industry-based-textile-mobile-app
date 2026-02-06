namespace HamzaTex.Api.Models;

public class ClientTypeDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CreateClientTypeDto
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UpdateClientTypeByIdDto
{
    public string Name { get; set; } = string.Empty;
}