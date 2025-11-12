using HamzaTex.Api.Entities;
using HamzaTex.Api.Models;
using HamzaTex.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HamzaTex.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IItemService _itemService;
    private readonly ILogger<ItemsController> _logger;

    public ItemsController(IItemService itemService, ILogger<ItemsController> logger)
    {
        _itemService = itemService;
        _logger = logger;
    }

    /// <summary>
    /// Get all items
    /// </summary>
    /// <returns>List of all items</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetAllItems()
    {
        var items = await _itemService.GetAllItemsAsync();
        var itemDtos = items.Select(i => new ItemDto
        {
            Id = i.Id,
            Name = i.Name,
            Description = i.Description
        });
        
        return Ok(itemDtos);
    }

    /// <summary>
    /// Get an item by ID
    /// </summary>
    /// <param name="id">Item ID</param>
    /// <returns>Item details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemDto>> GetItem(int id)
    {
        var item = await _itemService.GetItemByIdAsync(id);
        
        if (item == null)
        {
            return NotFound();
        }

        var itemDto = new ItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description
        };
        
        return Ok(itemDto);
    }

    /// <summary>
    /// Create a new item
    /// </summary>
    /// <param name="createItemDto">Item creation data</param>
    /// <returns>Created item</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ItemDto>> CreateItem(CreateItemDto createItemDto)
    {
        if (string.IsNullOrWhiteSpace(createItemDto.Name))
        {
            return BadRequest("Name is required");
        }

        var item = new Item
        {
            Name = createItemDto.Name,
            Description = createItemDto.Description
        };

        var createdItem = await _itemService.CreateItemAsync(item);
        
        var itemDto = new ItemDto
        {
            Id = createdItem.Id,
            Name = createdItem.Name,
            Description = createdItem.Description
        };
        
        return CreatedAtAction(nameof(GetItem), new { id = itemDto.Id }, itemDto);
    }

    /// <summary>
    /// Update an existing item
    /// </summary>
    /// <param name="id">Item ID</param>
    /// <param name="updateItemDto">Item update data</param>
    /// <returns>Updated item</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemDto>> UpdateItem(int id, UpdateItemDto updateItemDto)
    {
        if (string.IsNullOrWhiteSpace(updateItemDto.Name))
        {
            return BadRequest("Name is required");
        }

        var item = new Item
        {
            Name = updateItemDto.Name,
            Description = updateItemDto.Description
        };

        var updatedItem = await _itemService.UpdateItemAsync(id, item);
        
        if (updatedItem == null)
        {
            return NotFound();
        }

        var itemDto = new ItemDto
        {
            Id = updatedItem.Id,
            Name = updatedItem.Name,
            Description = updatedItem.Description
        };
        
        return Ok(itemDto);
    }

    /// <summary>
    /// Delete an item
    /// </summary>
    /// <param name="id">Item ID</param>
    /// <returns>No content</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var result = await _itemService.DeleteItemAsync(id);
        
        if (!result)
        {
            return NotFound();
        }
        
        return NoContent();
    }
}
