namespace HamzaTex.Api.Models;

public class UserRoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public class CreateUserRoleDto
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UpdateUserRoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}