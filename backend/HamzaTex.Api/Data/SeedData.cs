using HamzaTex.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HamzaTex.Api.Data;

public static class SeedData
{
    private static readonly IReadOnlyList<PurchaseStatus> PurchaseStatusSeeds =
    [
        new PurchaseStatus { Id = 1, Name = "Pending",      CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new PurchaseStatus { Id = 2, Name = "InProgressed", CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new PurchaseStatus { Id = 3, Name = "Delivered",    CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new PurchaseStatus { Id = 4, Name = "Cancelled",    CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
    ];

    private static readonly IReadOnlyList<OrderStatus> OrderStatusSeeds =
    [
        new OrderStatus
        {
            Id = 1,
            Name = "Pending",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new OrderStatus
        {
            Id = 2,
            Name = "InProgressed",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new OrderStatus
        {
            Id = 3,
            Name = "Delivered",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new OrderStatus
        {
            Id = 4,
            Name = "Cancelled",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<PaymentType> PaymentTypeSeeds =
    [
        new PaymentType
        {
            Id = 1,
            Name = "Cash",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new PaymentType
        {
            Id = 2,
            Name = "Credit",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<UserRole> UserRoleSeeds =
    [
        new UserRole
        {
            Id = 1,
            Name = "Admin",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new UserRole
        {
            Id = 2,
            Name = "Staff",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];
    
    private static readonly IReadOnlyList<ClientType> ClientTypeSeeds =
    [
        new ClientType
        {
            Id = 1,
            Name = "Customer",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new ClientType
        {
            Id = 2,
            Name = "Supplier",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<TransType> TransTypeSeeds =
    [
        new TransType
        {
            Id = 1,
            Name = "Debit",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransType
        {
            Id = 2,
            Name = "Credit",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<TransMode> TransModeSeeds =
    [
        new TransMode
        {
            Id = 1,
            Name = "Cash",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransMode
        {
            Id = 2,
            Name = "Bank",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransMode
        {
            Id = 3,
            Name = "Credit",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<TransCategory> TransCategorySeeds =
    [
        new TransCategory
        {
            Id = 1,
            Name = "Sales",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransCategory
        {
            Id = 2,
            Name = "Purchases",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransCategory
        {
            Id = 3,
            Name = "Office Expenses",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransCategory
        {
            Id = 4,
            Name = "Home Expenses",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransCategory
        {
            Id = 5,
            Name = "Cash In",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransCategory
        {
            Id = 6,
            Name = "Cash Out",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransCategory
        {
            Id = 7,
            Name = "Bank In",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new TransCategory
        {
            Id = 8,
            Name = "Bank Out",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<ExpenseType> ExpenseTypeSeeds =
    [
        new ExpenseType
        {
            Id = 1,
            Name = "Office Expenses",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new ExpenseType
        {
            Id = 2,
            Name = "Home Expenses",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<MovementType> MovementTypeSeeds =
    [
        new MovementType
        {
            Id = 1,
            Name = "In",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new MovementType
        {
            Id = 2,
            Name = "Out",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new MovementType
        {
            Id = 3,
            Name = "Adjustment",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<MovementSource> MovementSourceSeeds =
    [
        new MovementSource
        {
            Id = 1,
            Name = "Purchase",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new MovementSource
        {
            Id = 2,
            Name = "Sale",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new MovementSource
        {
            Id = 3,
            Name = "Manual",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<PaymentDirection> PaymentDirectionSeeds =
    [
        new PaymentDirection
        {
            Id = 1,
            Name = "Received",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new PaymentDirection
        {
            Id = 2,
            Name = "Paid",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        },
        new PaymentDirection
        {
            Id = 3,
            Name = "Adjustment",
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        }
    ];

    private static readonly IReadOnlyList<InvoiceStatus> InvoiceStatusSeeds =
    [
        new InvoiceStatus { Id = 1, Name = "Draft",     CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new InvoiceStatus { Id = 2, Name = "Issued",    CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new InvoiceStatus { Id = 3, Name = "Paid",      CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new InvoiceStatus { Id = 4, Name = "Cancelled", CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
    ];

    public static async Task EnsureSeedDataAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        await SeedStatusesAsync(context, cancellationToken);
    }

    private static async Task SeedStatusesAsync(ApplicationDbContext context, CancellationToken cancellationToken)
    {
        await SeedLookupAsync(
            context,
            context.PurchaseStatuses,
            status => status.Name!,
            PurchaseStatusSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.OrderStatuses,
            status => status.Name!,
            OrderStatusSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.PaymentTypes,
            type => type.Name!, 
            PaymentTypeSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.UserRoles,
            role => role.Name!,
            UserRoleSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.ClientTypes,
            type => type.Name!,
            ClientTypeSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.TransTypes,
            type => type.Name!,
            TransTypeSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.TransModes,
            mode => mode.Name!,
            TransModeSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.TransCategories,
            category => category.Name!,
            TransCategorySeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.ExpenseTypes,
            type => type.Name!,
            ExpenseTypeSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.MovementTypes,
            type => type.Name!,
            MovementTypeSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.MovementSources,
            source => source.Name!,
            MovementSourceSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.PaymentDirections,
            direction => direction.Name!,
            PaymentDirectionSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);

        await SeedLookupAsync(
            context,
            context.InvoiceStatuses,
            status => status.Name!,
            InvoiceStatusSeeds,
            StringComparer.OrdinalIgnoreCase,
            cancellationToken);
    }

    private static async Task SeedLookupAsync<TEntity, TKey>(
        ApplicationDbContext context,
        DbSet<TEntity> dbSet,
        Func<TEntity, TKey> keySelector,
        IEnumerable<TEntity> seeds,
        IEqualityComparer<TKey>? keyComparer,
        CancellationToken cancellationToken)
        where TEntity : class
    {
        var comparer = keyComparer ?? EqualityComparer<TKey>.Default;

        var existingKeys = (await dbSet
            .AsNoTracking()
            .ToListAsync(cancellationToken))
            .Select(keySelector);

        var existingKeySet = new HashSet<TKey>(existingKeys, comparer);

        var missingEntities = seeds
            .Where(seed => !existingKeySet.Contains(keySelector(seed)))
            .ToList();

        if (missingEntities.Count == 0)
        {
            return;
        }

        await dbSet.AddRangeAsync(missingEntities, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}

