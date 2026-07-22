using HamzaTex.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace HamzaTex.Api.Data;

public static class SeedData
{
    private static readonly IReadOnlyList<PurchaseStatus> PurchaseStatusSeeds =
    [
        new PurchaseStatus { Id = 1, Name = "Pending",      CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new PurchaseStatus { Id = 2, Name = "InProgressed", CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new PurchaseStatus { Id = 3, Name = "Received",    CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
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
        },
        new TransCategory
        {
            Id = 9,
            Name = "Opening Balance",
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

    private static readonly IReadOnlyList<Unit> UnitSeeds =
    [
        new Unit { Id = 1, Name = "m",    CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new Unit { Id = 2, Name = "kg",   CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new Unit { Id = 3, Name = "pcs",  CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new Unit { Id = 4, Name = "yard", CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new Unit { Id = 5, Name = "roll", CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new Unit { Id = 6, Name = "bale", CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
        new Unit { Id = 7, Name = "cone", CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow) },
    ];

    public static async Task EnsureSeedDataAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        await SeedStatusesAsync(context, cancellationToken);
        await SeedSystemSettingAsync(context, cancellationToken);
    }

    /// <summary>Ensures exactly one SystemSetting row exists. No-op if one already exists (safe to re-run on every startup).</summary>
    private static async Task SeedSystemSettingAsync(ApplicationDbContext context, CancellationToken cancellationToken)
    {
        if (!await context.SystemSettings.AnyAsync(cancellationToken))
        {
            context.SystemSettings.Add(new SystemSetting { HijriOffsetDays = 0, LastHijriReminderSentDate = null });
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    /// <summary>
    /// Creates the single seed admin user if no admin (RoleId = 1) exists yet. Safe to call on every
    /// startup — a no-op once an admin exists. Credentials come from configuration
    /// (Admin:Email / Admin:Username / Admin:Password, e.g. Railway env vars
    /// Admin__Email / Admin__Username / Admin__Password) so nothing is hardcoded in source.
    /// </summary>
    public static async Task EnsureAdminUserAsync(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        if (userManager.Users.Any(u => u.RoleId == 1))
        {
            return;
        }

        var email = configuration["Admin:Email"];
        var username = configuration["Admin:Username"] ?? email;
        var password = configuration["Admin:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning("No admin user exists and Admin:Email/Admin:Password are not configured — skipping admin seed.");
            return;
        }

        var admin = new ApplicationUser
        {
            UserName = username,
            Email = email,
            Name = "Admin",
            RoleId = 1,
            IsActive = true,
            EmailConfirmed = true,
            CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
        };

        var result = await userManager.CreateAsync(admin, password);
        if (!result.Succeeded)
        {
            logger.LogError("Failed to seed admin user: {Errors}", string.Join("; ", result.Errors.Select(e => e.Description)));
            return;
        }

        logger.LogInformation("Seeded admin user {Email}.", email);
    }

    private static async Task SeedStatusesAsync(ApplicationDbContext context, CancellationToken cancellationToken)
    {
        await SeedLookupAsync(context, context.PurchaseStatuses, PurchaseStatusSeeds, cancellationToken);
        await SeedLookupAsync(context, context.OrderStatuses, OrderStatusSeeds, cancellationToken);
        await SeedLookupAsync(context, context.PaymentTypes, PaymentTypeSeeds, cancellationToken);
        await SeedLookupAsync(context, context.UserRoles, UserRoleSeeds, cancellationToken);
        await SeedLookupAsync(context, context.ClientTypes, ClientTypeSeeds, cancellationToken);
        await SeedLookupAsync(context, context.TransTypes, TransTypeSeeds, cancellationToken);
        await SeedLookupAsync(context, context.TransModes, TransModeSeeds, cancellationToken);
        await SeedLookupAsync(context, context.TransCategories, TransCategorySeeds, cancellationToken);
        await SeedLookupAsync(context, context.ExpenseTypes, ExpenseTypeSeeds, cancellationToken);
        await SeedLookupAsync(context, context.MovementTypes, MovementTypeSeeds, cancellationToken);
        await SeedLookupAsync(context, context.MovementSources, MovementSourceSeeds, cancellationToken);
        await SeedLookupAsync(context, context.PaymentDirections, PaymentDirectionSeeds, cancellationToken);
        await SeedLookupAsync(context, context.InvoiceStatuses, InvoiceStatusSeeds, cancellationToken);
        await SeedLookupAsync(context, context.Units, UnitSeeds, cancellationToken);
    }

    private static async Task SeedLookupAsync<TEntity>(
        ApplicationDbContext context,
        DbSet<TEntity> dbSet,
        IEnumerable<TEntity> seeds,
        CancellationToken cancellationToken)
        where TEntity : class
    {
        var existing = await dbSet.ToListAsync(cancellationToken);

        var existingById = existing
            .ToDictionary(e => context.Entry(e).Property<int>("Id").CurrentValue);

        foreach (var seed in seeds)
        {
            var seedId = context.Entry(seed).Property<int>("Id").CurrentValue;

            if (existingById.TryGetValue(seedId, out var row))
            {
                var entry = context.Entry(row);
                var hasCreatedAt = entry.Metadata.FindProperty("CreatedAt") is not null;
                DateOnly? createdAt = hasCreatedAt
                    ? entry.Property<DateOnly?>("CreatedAt").CurrentValue
                    : null;

                entry.CurrentValues.SetValues(seed);

                if (hasCreatedAt)
                {
                    entry.Property<DateOnly?>("CreatedAt").CurrentValue = createdAt;
                }
            }
            else
            {
                await dbSet.AddAsync(seed, cancellationToken);
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}

