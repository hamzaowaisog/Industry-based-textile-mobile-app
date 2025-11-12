using HamzaTex.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace HamzaTex.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Seed UserRoles
        if (!await context.UserRoles.AnyAsync())
        {
            var userRoles = new[]
            {
                new UserRole { Id = Guid.NewGuid(), Name = "Admin", CreatedAt = DateTime.UtcNow },
                new UserRole { Id = Guid.NewGuid(), Name = "Manager", CreatedAt = DateTime.UtcNow },
                new UserRole { Id = Guid.NewGuid(), Name = "User", CreatedAt = DateTime.UtcNow }
            };
            await context.UserRoles.AddRangeAsync(userRoles);
        }

        // Seed ClientTypes
        if (!await context.ClientTypes.AnyAsync())
        {
            var clientTypes = new[]
            {
                new ClientType { Id = Guid.NewGuid(), Name = "Customer", CreatedAt = DateTime.UtcNow },
                new ClientType { Id = Guid.NewGuid(), Name = "Supplier", CreatedAt = DateTime.UtcNow },
                new ClientType { Id = Guid.NewGuid(), Name = "Both", CreatedAt = DateTime.UtcNow }
            };
            await context.ClientTypes.AddRangeAsync(clientTypes);
        }

        // Seed OrderStatuses
        if (!await context.OrderStatuses.AnyAsync())
        {
            var orderStatuses = new[]
            {
                new OrderStatus { Id = Guid.NewGuid(), Name = "Pending", CreatedAt = DateTime.UtcNow },
                new OrderStatus { Id = Guid.NewGuid(), Name = "Processing", CreatedAt = DateTime.UtcNow },
                new OrderStatus { Id = Guid.NewGuid(), Name = "Completed", CreatedAt = DateTime.UtcNow },
                new OrderStatus { Id = Guid.NewGuid(), Name = "Cancelled", CreatedAt = DateTime.UtcNow }
            };
            await context.OrderStatuses.AddRangeAsync(orderStatuses);
        }

        // Seed PaymentTypes
        if (!await context.PaymentTypes.AnyAsync())
        {
            var paymentTypes = new[]
            {
                new PaymentType { Id = Guid.NewGuid(), Name = "Cash", CreatedAt = DateTime.UtcNow },
                new PaymentType { Id = Guid.NewGuid(), Name = "Credit Card", CreatedAt = DateTime.UtcNow },
                new PaymentType { Id = Guid.NewGuid(), Name = "Bank Transfer", CreatedAt = DateTime.UtcNow },
                new PaymentType { Id = Guid.NewGuid(), Name = "Cheque", CreatedAt = DateTime.UtcNow }
            };
            await context.PaymentTypes.AddRangeAsync(paymentTypes);
        }

        // Seed PaymentDirections
        if (!await context.PaymentDirections.AnyAsync())
        {
            var paymentDirections = new[]
            {
                new PaymentDirection { Id = Guid.NewGuid(), Name = "Incoming", CreatedAt = DateTime.UtcNow },
                new PaymentDirection { Id = Guid.NewGuid(), Name = "Outgoing", CreatedAt = DateTime.UtcNow }
            };
            await context.PaymentDirections.AddRangeAsync(paymentDirections);
        }

        // Seed TransTypes
        if (!await context.TransTypes.AnyAsync())
        {
            var transTypes = new[]
            {
                new TransType { Id = Guid.NewGuid(), Name = "Income", CreatedAt = DateTime.UtcNow },
                new TransType { Id = Guid.NewGuid(), Name = "Expense", CreatedAt = DateTime.UtcNow },
                new TransType { Id = Guid.NewGuid(), Name = "Transfer", CreatedAt = DateTime.UtcNow }
            };
            await context.TransTypes.AddRangeAsync(transTypes);
        }

        // Seed TransModes
        if (!await context.TransModes.AnyAsync())
        {
            var transModes = new[]
            {
                new TransMode { Id = Guid.NewGuid(), Name = "Cash", CreatedAt = DateTime.UtcNow },
                new TransMode { Id = Guid.NewGuid(), Name = "Bank", CreatedAt = DateTime.UtcNow },
                new TransMode { Id = Guid.NewGuid(), Name = "Credit", CreatedAt = DateTime.UtcNow }
            };
            await context.TransModes.AddRangeAsync(transModes);
        }

        // Seed TransCategories
        if (!await context.TransCategories.AnyAsync())
        {
            var transCategories = new[]
            {
                new TransCategory { Id = Guid.NewGuid(), Name = "Sales", CreatedAt = DateTime.UtcNow },
                new TransCategory { Id = Guid.NewGuid(), Name = "Purchase", CreatedAt = DateTime.UtcNow },
                new TransCategory { Id = Guid.NewGuid(), Name = "Expense", CreatedAt = DateTime.UtcNow },
                new TransCategory { Id = Guid.NewGuid(), Name = "Payment", CreatedAt = DateTime.UtcNow }
            };
            await context.TransCategories.AddRangeAsync(transCategories);
        }

        // Seed ExpenseTypes
        if (!await context.ExpenseTypes.AnyAsync())
        {
            var expenseTypes = new[]
            {
                new ExpenseType { Id = Guid.NewGuid(), Name = "Office Supplies", CreatedAt = DateTime.UtcNow },
                new ExpenseType { Id = Guid.NewGuid(), Name = "Utilities", CreatedAt = DateTime.UtcNow },
                new ExpenseType { Id = Guid.NewGuid(), Name = "Rent", CreatedAt = DateTime.UtcNow },
                new ExpenseType { Id = Guid.NewGuid(), Name = "Salary", CreatedAt = DateTime.UtcNow },
                new ExpenseType { Id = Guid.NewGuid(), Name = "Other", CreatedAt = DateTime.UtcNow }
            };
            await context.ExpenseTypes.AddRangeAsync(expenseTypes);
        }

        // Seed MovementTypes
        if (!await context.MovementTypes.AnyAsync())
        {
            var movementTypes = new[]
            {
                new MovementType { Id = Guid.NewGuid(), Name = "In", CreatedAt = DateTime.UtcNow },
                new MovementType { Id = Guid.NewGuid(), Name = "Out", CreatedAt = DateTime.UtcNow },
                new MovementType { Id = Guid.NewGuid(), Name = "Adjustment", CreatedAt = DateTime.UtcNow }
            };
            await context.MovementTypes.AddRangeAsync(movementTypes);
        }

        // Seed MovementSources
        if (!await context.MovementSources.AnyAsync())
        {
            var movementSources = new[]
            {
                new MovementSource { Id = Guid.NewGuid(), Name = "Purchase", CreatedAt = DateTime.UtcNow },
                new MovementSource { Id = Guid.NewGuid(), Name = "Sale", CreatedAt = DateTime.UtcNow },
                new MovementSource { Id = Guid.NewGuid(), Name = "Return", CreatedAt = DateTime.UtcNow },
                new MovementSource { Id = Guid.NewGuid(), Name = "Adjustment", CreatedAt = DateTime.UtcNow }
            };
            await context.MovementSources.AddRangeAsync(movementSources);
        }

        await context.SaveChangesAsync();
    }
}

