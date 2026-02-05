using HamzaTex.Api.Data;
using HamzaTex.Api.Helpers;
using HamzaTex.Api.Models;

namespace HamzaTex.Api.Services;

public interface IProductService
{
    // Task<Response<ProductDto>> CreateAsync(CreateProductDto model);
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
}