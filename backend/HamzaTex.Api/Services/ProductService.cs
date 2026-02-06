using HamzaTex.Api.Data;
using HamzaTex.Api.Entities;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Services;

public interface IProductService
{
    Task<Response<ProductDto>> CreateWithUserIdAsync(CreateProductDto model, int userId);
    Task<Response<ProductDto>> GetByIdAsync(int id , int userId);
    Task<Response<List<ProductDto>>> GetAllAsync(int userId);
    Task<Response<ProductDto>> UpdateByIdAsync(int id, UpdateProductByIdDto model, int userId);
    Task<Response> DeleteByIdAsync(int id, int userId);
    Task<Response<PagedList<ProductDto>>> GetAllPaginatedAsync(int page, int pageSize, int userId);
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

   public async Task<Response<ProductDto>> GetByIdAsync(int id, int userId)
   {
        var product = await _dbContext.Products
                      .Include(p => p.ProductUsers)
                      .FirstOrDefaultAsync(
                        p => p.Id == id && 
                        p.ProductUsers.Any(pu => pu.UserId == userId));

        if (product is null)
        {
            return Response<ProductDto>.ErrorResponse("Not found", "Product not found.");
        }

        return Response<ProductDto>.SuccessResponse(ToDto(product), "Product fetched successfully.");


   }

   public async Task<Response<List<ProductDto>>> GetAllAsync(int userId)
   {
        var products = await _dbContext.Products
                       .Include(p => p.ProductUsers)
                       .Where(p => p.ProductUsers.Any(pu => pu.UserId == userId))
                       .ToListAsync();
        
        if (products is null)
        {
            return Response<List<ProductDto>>.ErrorResponse("Not found", "No products found.");
        }

        var productDtos = products.Select(product => ToDto(product)).ToList();
        return Response<List<ProductDto>>.SuccessResponse(productDtos, "Products fetched successfully.");
   }

   public async Task<Response<ProductDto>> UpdateByIdAsync(int id , UpdateProductByIdDto model , int userId)
   {
        var product = await _dbContext.Products
                     .Include(p => p.ProductUsers)
                     .FirstOrDefaultAsync(
                        p => p.Id == id &&
                        p.ProductUsers.Any(pu => pu.UserId == userId));
        
        if (product is null)
        {
            return Response<ProductDto>.ErrorResponse("Not found", "Product not found.");
        }

        product.Name = model.Name.Trim();
        product.Sku = model.Sku.Trim();
        product.Unit = model.Unit.Trim();
        product.DefaultCost = model.DefaultCost;
        product.DefaultPrice = model.DefaultPrice;
        product.Quantity = model.Quantity;
        product.ReorderLevel = model.ReorderLevel;
        product.IsActive = model.IsActive;

        await _dbContext.SaveChangesAsync();
        return Response<ProductDto>.SuccessResponse(ToDto(product), "Product updated successfully.");
   }

   public async Task<Response> DeleteByIdAsync(int id, int userId)
   {
        var product = await _dbContext.Products
                     .Include(p => p.ProductUsers)
                     .FirstOrDefaultAsync(
                        p => p.Id == id &&
                        p.ProductUsers.Any(pu => pu.UserId == userId));
        
        if (product is null)
        {
            return Response.ErrorResponse("Not found", "Product not found.");
        }

        _dbContext.Products.Remove(product);
        await _dbContext.SaveChangesAsync();
        return Response.SuccessResponse("Product deleted successfully.");
   }

   public async Task<Response<PagedList<ProductDto>>> GetAllPaginatedAsync (int page, int pageSize, int userId)
   {
        var query = _dbContext.Products
                    .Include(p => p.ProductUsers)
                    .Where(p => p.ProductUsers.Any(pu => pu.UserId == userId))
                    .Select(p => ToDto(p));
        
        var pagedList = await PagedList<ProductDto>.CreateAsync(query, page, pageSize);
        return Response<PagedList<ProductDto>>.SuccessResponse(pagedList, "Products fetched successfully.");
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