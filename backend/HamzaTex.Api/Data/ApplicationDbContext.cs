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

    public virtual DbSet<ClientType> ClientTypes { get; set; }

    public virtual DbSet<Login> Logins { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<ExpenseType> ExpenseTypes { get; set; }
    
    public virtual DbSet<MovementSource> MovementSources { get; set; }
    
    public virtual DbSet<MovementType> MovementTypes { get; set; }

    public virtual DbSet<OrderStatus> OrderStatuses { get; set; }

    public virtual DbSet<PaymentDirection> PaymentDirections { get; set; }

    public virtual DbSet<PaymentType> PaymentTypes { get; set; }

    public virtual DbSet<TransCategory> TransCategories { get; set; }

    public virtual DbSet<TransMode> TransModes { get; set; }

    public virtual DbSet<TransType> TransTypes { get; set; }

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
        // Configure DateOnly to map to MySQL 'date' type
        // EF Core 9.0+ supports DateOnly natively when mapped to 'date' type
        
        // Configure enums to be stored as strings in MySQL
        // EF Core will automatically convert enum values to/from strings

        modelBuilder.Entity<ClientType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("client_types_pkey");

            entity.ToTable("client_types");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("clients_pkey");

            entity.ToTable("clients");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.CreditLimit)
                .HasPrecision(14, 2)
                .HasColumnName("credit_limit");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.ClientTypeId).HasColumnName("client_type_id");
            entity.Property(e => e.Notes).HasColumnName("notes");

            entity.HasOne(d => d.ClientType).WithMany(p => p.Clients)
                .HasForeignKey(d => d.ClientTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("clients_client_type_id_fkey");
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
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.ExpenseTypeId).HasColumnName("expense_type_id");
            entity.Property(e => e.Amount)
                .HasPrecision(14, 2)
                .HasColumnName("amount");
            entity.Property(e => e.TransModeId).HasColumnName("trans_mode_id");
            entity.Property(e => e.ExpenseDate)
                .HasColumnType("date")
                .HasColumnName("expense_date");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");

            entity.HasOne(d => d.ExpenseType).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.ExpenseTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("expenses_expense_type_id_fkey");
            entity.HasOne(d => d.TransMode).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.TransModeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("expenses_trans_mode_id_fkey");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("orders_pkey");

            entity.ToTable("orders");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.StatusId).HasColumnName("status_id");
            entity.Property(e => e.PaymentTypeId).HasColumnName("payment_type_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.OrderDate)
                .HasColumnType("date")
                .HasColumnName("order_date");

            entity.HasOne(d => d.Client).WithMany(p => p.Orders)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("orders_client_id_fkey");
            entity.HasOne(d => d.Status).WithMany(p => p.Orders)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("orders_status_id_fkey");
            entity.HasOne(d => d.PaymentType).WithMany(p => p.Orders)
                .HasForeignKey(d => d.PaymentTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("orders_payment_type_id_fkey");
        });

        modelBuilder.Entity<OrderLine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("order_lines_pkey");

            entity.ToTable("order_lines");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
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
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("order_lines_product_id_fkey");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("payments_pkey");

            entity.ToTable("payments");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.PartyClientId).HasColumnName("party_client_id");
            entity.Property(e => e.PaymentDirectionId).HasColumnName("payment_direction_id");
            entity.Property(e => e.TransModeId).HasColumnName("trans_mode_id");
            entity.Property(e => e.Amount)
                .HasPrecision(14, 2)
                .HasColumnName("amount");
            entity.Property(e => e.PaymentDate)
                .HasColumnType("date")
                .HasColumnName("payment_date");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");

            entity.HasOne(d => d.PartyClient).WithMany(p => p.Payments)
                .HasForeignKey(d => d.PartyClientId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("payments_party_client_id_fkey");
            
            entity.HasOne(d => d.PaymentDirection).WithMany(p => p.Payments)
                .HasForeignKey(d => d.PaymentDirectionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("payments_payment_direction_id_fkey");
            
            entity.HasOne(d => d.TransMode).WithMany(p => p.Payments)
                .HasForeignKey(d => d.TransModeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("payments_trans_mode_id_fkey");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("products_pkey");

            entity.ToTable("products");

            entity.HasIndex(e => e.Sku, "products_sku_key").IsUnique();

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
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
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id");
            entity.Property(e => e.PaymentTypeId).HasColumnName("payment_type_id");
            entity.Property(e => e.PurchaseDate)
                .HasColumnType("date")
                .HasColumnName("purchase_date");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");

            entity.HasOne(d => d.Supplier).WithMany(p => p.Purchases)
                .HasForeignKey(d => d.SupplierId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchases_supplier_id_fkey");
            entity.HasOne(d => d.PaymentType).WithMany(p => p.Purchases)
                .HasForeignKey(d => d.PaymentTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("purchases_payment_type_id_fkey");
        });

        modelBuilder.Entity<PurchaseLine>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("purchase_lines_pkey");

            entity.ToTable("purchase_lines");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.PurchaseId).HasColumnName("purchase_id");
            entity.Property(e => e.Qty).HasColumnName("qty");
            entity.Property(e => e.UnitCost)
                .HasPrecision(14, 2)
                .HasColumnName("unit_cost");

            entity.HasOne(d => d.Product).WithMany(p => p.PurchaseLines)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.SetNull)
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
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.MovementTypeId).HasColumnName("movement_type_id");
            entity.Property(e => e.MovementSourceId).HasColumnName("movement_source_id");
            entity.Property(e => e.Qty).HasColumnName("qty");
            entity.Property(e => e.UnitCost)
                .HasPrecision(14, 4)
                .HasColumnName("unit_cost");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(14, 4)
                .HasColumnName("unit_price");
            entity.Property(e => e.MovementDate)
                .HasColumnType("date")
                .HasColumnName("movement_date");

            entity.HasOne(d => d.Product).WithMany(p => p.StockMovements)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("stock_movements_product_id_fkey");
            
            entity.HasOne(d => d.MovementType).WithMany(p => p.StockMovements)
                .HasForeignKey(d => d.MovementTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("stock_movements_movement_type_id_fkey");
            
            entity.HasOne(d => d.MovementSource).WithMany(p => p.StockMovements)
                .HasForeignKey(d => d.MovementSourceId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("stock_movements_movement_source_id_fkey");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("transactions_pkey");

            entity.ToTable("transactions");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.ProductId).HasColumnName("product_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.TransTypeId).HasColumnName("trans_type_id");
            entity.Property(e => e.TransModeId).HasColumnName("trans_mode_id");
            entity.Property(e => e.TransCategoryId).HasColumnName("trans_category_id");
            entity.Property(e => e.Amount)
                .HasPrecision(14, 2)
                .HasColumnName("amount");
            entity.Property(e => e.TransDate)
                .HasColumnType("date")
                .HasColumnName("trans_date");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");

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

            entity.HasOne(d => d.TransType).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.TransTypeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("transactions_trans_type_id_fkey");

            entity.HasOne(d => d.TransMode).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.TransModeId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("transactions_trans_mode_id_fkey");

            entity.HasOne(d => d.TransCategory).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.TransCategoryId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("transactions_trans_category_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Name, "users_name_key");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("users_role_id_fkey");
        }
        );
        modelBuilder.Entity<UserRole>(entity => {
            entity.HasKey(e => e.Id).HasName("user_roles_pkey");
            entity.ToTable("user_roles");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<Login>(entity => {
            entity.HasKey(e => e.Id).HasName("logins_pkey");
            entity.ToTable("logins");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Username).HasColumnName("username");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.HasOne(d => d.User).WithOne()
                .HasForeignKey<Login>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("logins_user_id_fkey");
        });

        modelBuilder.Entity<OrderStatus>(entity => {
            entity.HasKey(e => e.Id).HasName("order_statuses_pkey");
            entity.ToTable("order_statuses");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<PaymentType>(entity => {
            entity.HasKey(e => e.Id).HasName("payment_types_pkey");
            entity.ToTable("payment_types");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<TransCategory>(entity => {
            entity.HasKey(e => e.Id).HasName("trans_categories_pkey");
            entity.ToTable("trans_categories");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<TransMode>(entity => {
            entity.HasKey(e => e.Id).HasName("trans_modes_pkey");
            entity.ToTable("trans_modes");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<TransType>(entity => {
            entity.HasKey(e => e.Id).HasName("trans_types_pkey");
            entity.ToTable("trans_types");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<PaymentDirection>(entity => {
            entity.HasKey(e => e.Id).HasName("payment_directions_pkey");
            entity.ToTable("payment_directions");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<MovementType>(entity => {
            entity.HasKey(e => e.Id).HasName("movement_types_pkey");
            entity.ToTable("movement_types");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<MovementSource>(entity => {
            entity.HasKey(e => e.Id).HasName("movement_sources_pkey");
            entity.ToTable("movement_sources");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<ExpenseType>(entity => {
            entity.HasKey(e => e.Id).HasName("expense_types_pkey");
            entity.ToTable("expense_types");
            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        modelBuilder.Entity<VClientBalance>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_client_balance");

            entity.Property(e => e.Balance)
                .HasPrecision(14, 2)
                .HasColumnName("balance");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<VMonthlyProfitLoss>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("v_monthly_profit_loss");

            entity.Property(e => e.GrossProfit)
                .HasPrecision(14, 2)
                .HasColumnName("gross_profit");
            entity.Property(e => e.Month).HasColumnName("month");
            entity.Property(e => e.NetProfit)
                .HasPrecision(14, 2)
                .HasColumnName("net_profit");
            entity.Property(e => e.TotalExpenses)
                .HasPrecision(14, 2)
                .HasColumnName("total_expenses");
            entity.Property(e => e.TotalPurchases)
                .HasPrecision(14, 2)
                .HasColumnName("total_purchases");
            entity.Property(e => e.TotalSales)
                .HasPrecision(14, 2)
                .HasColumnName("total_sales");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
