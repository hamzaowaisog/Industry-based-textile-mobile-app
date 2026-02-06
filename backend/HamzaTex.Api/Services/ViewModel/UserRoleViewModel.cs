using HamzaTex.Api.Models;

public class UserRoleCreateViewModel
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UpdateUserRoleViewModel
{
    public string Name { get; set; } = string.Empty;
}