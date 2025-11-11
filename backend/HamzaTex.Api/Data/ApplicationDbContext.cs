using HamzaTex.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace HamzaTex.Api.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext()
    {
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<Expense> Expenses { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderLine> OrderLines { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<Purchase> Purchases { get; set; }

    public virtual DbSet<PurchaseLine> PurchaseLines { get; set; }

    public virtual DbSet<StockMovement> StockMovements { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<VClientBalance> VClientBalances { get; set; }

    public virtual DbSet<VMonthlyProfitLoss> VMonthlyProfitLosses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("client_type", new[] { "Customer", "Supplier" })
            .HasPostgresEnum("expense_type", new[] { "Office", "Home" })
            .HasPostgresEnum("movement_sources", new[] { "Purchase", "Sale", "Manual" })
            .HasPostgresEnum("movement_type", new[] { "In", "Out", "Adjust" })
            .HasPostgresEnum("order_status", new[] { "Pending", "Delivered", "Cancelled" })
            .HasPostgresEnum("payment_direction", new[] { "Receive", "Pay" })
            .HasPostgresEnum("payment_type", new[] { "Cash", "Credit" })
            .HasPostgresEnum("trans_category", new[] { "Sales", "Purchase", "OfficeExpense", "HomeExpense", "PaymentIn", "PaymentOut" })
            .HasPostgresEnum("trans_mode", new[] { "Cash", "Credit", "Bank" })
            .HasPostgresEnum("trans_type", new[] { "Debit", "Credit" })
            .HasPostgresEnum("user_role", new[] { "Admin", "Staff" })
            .HasPostgresExtension("pg_trgm")
            .HasPostgresExtension("uuid-ossp");

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("clients_pkey");

            entity.ToTable("clients");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.CreditLimit)
                .HasPrecision(14, 2)
                .HasColumnName("credit_limit");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.OpeningBalance)
                .HasPrecision(14, 2)
                .HasDefaultValueSql("0")
                .HasColumnName("opening_balance");
            entity.Property(e => e.Phone).HasColumnName("phone");
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("expenses_pkey");

            entity.ToTable("expenses");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.Amount)
                .HasPrecision(14, 2)
                .HasColumnName("amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.ExpenseDate).HasColumnName("expense_date");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.SubCategory).HasColumnName("sub_category");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("orders_pkey");

            entity.ToTable("orders");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.OrderDate).HasColumnName("order_date");

            entity.HasOne(d => d.Client).WithMany(p => p.Orders)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("orders_client_id_fkey");
        });

        modelBuilder.Entity<OrderLine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("order_lines_pkey");

            entity.ToTable("order_lines");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Qty).HasColumnName("qty");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(14, 2)
                .HasColumnName("unit_price");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderLines)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("order_lines_order_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderLines)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("order_lines_product_id_fkey");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("payments_pkey");

            entity.ToTable("payments");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.Amount)
                .HasPrecision(14, 2)
                .HasColumnName("amount");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PartyClientId).HasColumnName("party_client_id");
            entity.Property(e => e.PaymentDate).HasColumnName("payment_date");

            entity.HasOne(d => d.PartyClient).WithMany(p => p.Payments)
                .HasForeignKey(d => d.PartyClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("payments_party_client_id_fkey");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("products_pkey");

            entity.ToTable("products");

            entity.HasIndex(e => e.Sku, "products_sku_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.Category).HasColumnName("category");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.DefaultCost)
                .HasPrecision(14, 2)
                .HasDefaultValueSql("0")
                .HasColumnName("default_cost");
            entity.Property(e => e.DefaultPrice)
                .HasPrecision(14, 2)
                .HasDefaultValueSql("0")
                .HasColumnName("default_price");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.ReorderLevel)
                .HasDefaultValue(0)
                .HasColumnName("reorder_level");
            entity.Property(e => e.Sku).HasColumnName("sku");
            entity.Property(e => e.Unit).HasColumnName("unit");
        });

        modelBuilder.Entity<Purchase>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("purchases_pkey");

            entity.ToTable("purchases");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.PurchaseDate).HasColumnName("purchase_date");
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id");

            entity.HasOne(d => d.Supplier).WithMany(p => p.Purchases)
                .HasForeignKey(d => d.SupplierId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("purchases_supplier_id_fkey");
        });

        modelBuilder.Entity<PurchaseLine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("purchase_lines_pkey");

            entity.ToTable("purchase_lines");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.PurchaseId).HasColumnName("purchase_id");
            entity.Property(e => e.Qty).HasColumnName("qty");
            entity.Property(e => e.UnitCost)
                .HasPrecision(14, 2)
                .HasColumnName("unit_cost");

            entity.HasOne(d => d.Product).WithMany(p => p.PurchaseLines)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("purchase_lines_product_id_fkey");

            entity.HasOne(d => d.Purchase).WithMany(p => p.PurchaseLines)
                .HasForeignKey(d => d.PurchaseId)
                .HasConstraintName("purchase_lines_purchase_id_fkey");
        });

        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("stock_movements_pkey");

            entity.ToTable("stock_movements");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.LinkedEntity).HasColumnName("linked_entity");
            entity.Property(e => e.LinkedId)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("linked_id");
            entity.Property(e => e.MovementDate).HasColumnName("movement_date");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.Qty).HasColumnName("qty");
            entity.Property(e => e.UnitCost)
                .HasPrecision(14, 4)
                .HasColumnName("unit_cost");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(14, 4)
                .HasColumnName("unit_price");

            entity.HasOne(d => d.Product).WithMany(p => p.StockMovements)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("stock_movements_product_id_fkey");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("transactions_pkey");

            entity.ToTable("transactions");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.Amount)
                .HasPrecision(14, 2)
                .HasColumnName("amount");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.LinkedEntity).HasColumnName("linked_entity");
            entity.Property(e => e.LinkedId).HasColumnName("linked_id");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.TransDate).HasColumnName("trans_date");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Client).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("transactions_client_id_fkey");

            entity.HasOne(d => d.Product).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("transactions_product_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("transactions_user_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Username, "users_username_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("uuid_generate_v4()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Username).HasColumnName("username");
        });

        modelBuilder.Entity<VClientBalance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_client_balance");

            entity.Property(e => e.Balance).HasColumnName("balance");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<VMonthlyProfitLoss>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_monthly_profit_loss");

            entity.Property(e => e.GrossProfit).HasColumnName("gross_profit");
            entity.Property(e => e.Month).HasColumnName("month");
            entity.Property(e => e.NetProfit).HasColumnName("net_profit");
            entity.Property(e => e.TotalExpenses).HasColumnName("total_expenses");
            entity.Property(e => e.TotalPurchases).HasColumnName("total_purchases");
            entity.Property(e => e.TotalSales).HasColumnName("total_sales");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
