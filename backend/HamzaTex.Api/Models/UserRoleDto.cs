namespace HamzaTex.Api.Models;

public class UserRoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

}

public class CreateUserRoleDto
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UpdateUserRoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

}