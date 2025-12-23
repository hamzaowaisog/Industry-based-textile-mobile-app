namespace HamzaTex.Api.Services.ViewModel;

public class ClientTypeCreateViewModel
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ClientTypeUpdateViewModel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
