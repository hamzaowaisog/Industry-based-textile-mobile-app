using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IProductService
{
    Task<Response<ProductDto>> CreateWithUserIdAsync(CreateProductDto model, int userId);
    // Task<Response<ProductDto>> GetByIdAsync(int id);
    // Task<Response<List<ProductDto>>> GetAllAsync();
    // Task<Response<ProductDto>> UpdateByIdAsync(int id, UpdateProductByIdDto model);
    // Task<Response> DeleteByIdAsync(int id);
}

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _dbContext;

    public ProductService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

   public async Task<Response<ProductDto>> CreateWithUserIdAsync(CreateProductDto model, int userId)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try 
        {
            var entity = ToEntity(model);
            if (entity is null)
            {
                await transaction.RollbackAsync();
                return Response<ProductDto>.ErrorResponse("Validation failed", "Product is required.");
            }

            var existingProductSku = await _dbContext.Products
                                     .AsNoTracking()
                                     .FirstOrDefaultAsync(p => p.Sku == entity.Sku 
                                     && p.ProductUsers.Any(pu => pu.UserId == userId));
                                     
            if (existingProductSku != null)
            {
                await transaction.RollbackAsync();
                return Response<ProductDto>.ErrorResponse("Duplication error", "This SKU is already in use by another user or this user already has this product.");
            }

            await _dbContext.Products.AddAsync(entity);
            await _dbContext.SaveChangesAsync();

            var existingProductUser = await _dbContext.ProductUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(pu => pu.ProductId == entity.Id && pu.UserId == userId);
            
            if (existingProductUser != null)
            {
                await transaction.RollbackAsync();
                return Response<ProductDto>.ErrorResponse("Duplication error", "This user already has this product.");
            }

            var productUserEntity = ToEntity(new CreateProductUserDto
            {
                ProductId = entity.Id,
                UserId = userId
            });
            
            await _dbContext.ProductUsers.AddAsync(productUserEntity);

            await _dbContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return Response<ProductDto>.SuccessResponse(ToDto(entity), "Product created successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return Response<ProductDto>.ErrorResponse("Internal server error", ex.Message);
        }
    }


    private static ProductDto ToDto(Product entity) =>
    new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Sku = entity.Sku,
        Unit = entity.Unit,
        DefaultCost = entity.DefaultCost,
        DefaultPrice = entity.DefaultPrice,
        Quantity = entity.Quantity,
        ReorderLevel = entity.ReorderLevel,
        IsActive = entity.IsActive,
        CreatedAt = entity.CreatedAt
    };

    private static Product ToEntity(CreateProductDto model) =>
    new()
    {
        Name = model.Name.Trim(),
        Sku = model.Sku.Trim(),
        Unit = model.Unit.Trim(),
        DefaultCost = model.DefaultCost,
        DefaultPrice = model.DefaultPrice,
        Quantity = model.Quantity,
        ReorderLevel = model.ReorderLevel,
        IsActive = model.IsActive,
        CreatedAt = DateTime.UtcNow
    };

    private static ProductUser ToEntity(CreateProductUserDto model) =>
    new()
    {
        ProductId = model.ProductId,
        UserId = model.UserId,
        Date = DateOnly.FromDateTime(DateTime.UtcNow)
    };
}