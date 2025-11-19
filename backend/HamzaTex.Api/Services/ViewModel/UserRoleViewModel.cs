using HamzaTex.Api.Models;

public class UserRoleCreateViewModel
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UpdateUserRoleViewModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}