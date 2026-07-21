using HamzaTex.Api.Data;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

/// <summary>Reads and updates global system configuration (currently the Hijri calendar offset).</summary>
public interface ISettingsService
{
    /// <summary>Returns the current system settings.</summary>
    Task<Response<SettingsDto>> GetAsync();

    /// <summary>Updates the Hijri offset (and any future settings) and returns the new state.</summary>
    Task<Response<SettingsDto>> UpdateAsync(UpdateSettingsDto model);
}

public class SettingsService : ISettingsService
{
    private readonly ApplicationDbContext _context;

    public SettingsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Response<SettingsDto>> GetAsync()
    {
        var settings = await _context.SystemSettings.AsNoTracking().FirstOrDefaultAsync();
        if (settings is null)
        {
            return Response<SettingsDto>.ErrorResponse("Settings not found");
        }

        return Response<SettingsDto>.SuccessResponse(new SettingsDto { HijriOffsetDays = settings.HijriOffsetDays }, "Settings retrieved");
    }

    public async Task<Response<SettingsDto>> UpdateAsync(UpdateSettingsDto model)
    {
        var settings = await _context.SystemSettings.FirstOrDefaultAsync();
        if (settings is null)
        {
            return Response<SettingsDto>.ErrorResponse("Settings not found");
        }

        settings.HijriOffsetDays = model.HijriOffsetDays;
        await _context.SaveChangesAsync();

        return Response<SettingsDto>.SuccessResponse(new SettingsDto { HijriOffsetDays = settings.HijriOffsetDays }, "Settings updated");
    }
}
