using HamzaTex.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace HamzaTex.Api.Data;

public static class SeedData
{
    private static readonly IReadOnlyList<OrderStatus> OrderStatusSeeds =
    [
        new OrderStatus
        {
            Name = "Pending",
            CreatedAt = DateTime.UtcNow
        },
        new OrderStatus
        {
            Name = "InProgressed",
            CreatedAt = DateTime.UtcNow
        },
        new OrderStatus
        {
            Name = "Delivered",
            CreatedAt = DateTime.UtcNow
        },
        new OrderStatus
        {
            Name = "Cancelled",
            CreatedAt = DateTime.UtcNow
        }
    ];

    public static async Task EnsureSeedDataAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        await SeedOrderStatusesAsync(context, cancellationToken);
    }

    private static async Task SeedOrderStatusesAsync(ApplicationDbContext context, CancellationToken cancellationToken)
    {
        await SeedLookupAsync(
            context,
            context.OrderStatuses,
            status => status.Name!,
            OrderStatusSeeds,
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

