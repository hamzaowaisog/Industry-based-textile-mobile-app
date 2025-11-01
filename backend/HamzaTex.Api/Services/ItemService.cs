using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public class ItemService : IItemService
{
    private readonly ApplicationDbContext _context;

    public ItemService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Item>> GetAllItemsAsync()
    {
        return await _context.Items.ToListAsync();
    }

    public async Task<Item?> GetItemByIdAsync(int id)
    {
        return await _context.Items.FindAsync(id);
    }

    public async Task<Item> CreateItemAsync(Item item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        
        _context.Items.Add(item);
        await _context.SaveChangesAsync();
        
        return item;
    }

    public async Task<Item?> UpdateItemAsync(int id, Item item)
    {
        var existingItem = await _context.Items.FindAsync(id);
        if (existingItem == null)
        {
            return null;
        }

        existingItem.Name = item.Name;
        existingItem.Description = item.Description;
        existingItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        
        return existingItem;
    }

    public async Task<bool> DeleteItemAsync(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
        {
            return false;
        }

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();
        
        return true;
    }
}
