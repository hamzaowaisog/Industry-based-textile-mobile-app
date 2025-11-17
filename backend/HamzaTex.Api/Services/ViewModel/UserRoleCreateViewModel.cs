using HamzaTex.Api.Models;

public class UserRoleCreateViewModel
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UpdateUserRoleViewModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
public class GetUserRoleByIdViewModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
public class GetAllUserRolesViewModel
{
    public List<UserRoleDto> UserRoles { get; set; } = new List<UserRoleDto>();
}