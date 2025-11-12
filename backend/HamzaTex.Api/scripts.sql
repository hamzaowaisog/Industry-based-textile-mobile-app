CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;
ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `client_types` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `client_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `expense_types` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `expense_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `movement_sources` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `movement_sources_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `movement_types` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `movement_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `order_statuses` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `order_statuses_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `payment_directions` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `payment_directions_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `payment_types` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `payment_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `products` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `sku` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `unit` longtext CHARACTER SET utf8mb4 NOT NULL,
    `default_cost` decimal(14,2) NULL DEFAULT 0,
    `default_price` decimal(14,2) NULL DEFAULT 0,
    `reorder_level` int NULL DEFAULT 0,
    `is_active` tinyint(1) NULL DEFAULT TRUE,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `products_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `trans_categories` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `trans_categories_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `trans_modes` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `trans_modes_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `trans_types` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `trans_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `user_roles` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `user_roles_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `clients` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `client_type_id` char(36) COLLATE ascii_general_ci NULL,
    `phone` int NOT NULL,
    `address` longtext CHARACTER SET utf8mb4 NULL,
    `credit_limit` decimal(14,2) NULL,
    `opening_balance` decimal(14,2) NULL DEFAULT 0,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT TRUE,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `clients_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `clients_client_type_id_fkey` FOREIGN KEY (`client_type_id`) REFERENCES `client_types` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `stock_movements` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `product_id` char(36) COLLATE ascii_general_ci NULL,
    `movement_type_id` char(36) COLLATE ascii_general_ci NULL,
    `movement_source_id` char(36) COLLATE ascii_general_ci NULL,
    `qty` int NOT NULL,
    `unit_cost` decimal(14,4) NULL,
    `unit_price` decimal(14,4) NULL,
    `movement_date` date NOT NULL,
    CONSTRAINT `stock_movements_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `stock_movements_movement_source_id_fkey` FOREIGN KEY (`movement_source_id`) REFERENCES `movement_sources` (`id`) ON DELETE SET NULL,
    CONSTRAINT `stock_movements_movement_type_id_fkey` FOREIGN KEY (`movement_type_id`) REFERENCES `movement_types` (`id`) ON DELETE SET NULL,
    CONSTRAINT `stock_movements_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `expenses` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `expense_type_id` char(36) COLLATE ascii_general_ci NULL,
    `amount` decimal(14,2) NOT NULL,
    `trans_mode_id` char(36) COLLATE ascii_general_ci NULL,
    `expense_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `expenses_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `expenses_expense_type_id_fkey` FOREIGN KEY (`expense_type_id`) REFERENCES `expense_types` (`id`) ON DELETE SET NULL,
    CONSTRAINT `expenses_trans_mode_id_fkey` FOREIGN KEY (`trans_mode_id`) REFERENCES `trans_modes` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `users` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `name` varchar(255) CHARACTER SET utf8mb4 NULL,
    `email` longtext CHARACTER SET utf8mb4 NULL,
    `role_id` char(36) COLLATE ascii_general_ci NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT TRUE,
    `created_at` datetime NOT NULL DEFAULT NOW(),
    CONSTRAINT `users_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `orders` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `client_id` char(36) COLLATE ascii_general_ci NULL,
    `status_id` char(36) COLLATE ascii_general_ci NULL,
    `payment_type_id` char(36) COLLATE ascii_general_ci NULL,
    `order_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `orders_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `orders_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_payment_type_id_fkey` FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `order_statuses` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `payments` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `party_client_id` char(36) COLLATE ascii_general_ci NULL,
    `payment_direction_id` char(36) COLLATE ascii_general_ci NULL,
    `trans_mode_id` char(36) COLLATE ascii_general_ci NULL,
    `amount` decimal(14,2) NOT NULL,
    `payment_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    `PaymentTypeId` char(36) COLLATE ascii_general_ci NULL,
    CONSTRAINT `payments_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `FK_payments_payment_types_PaymentTypeId` FOREIGN KEY (`PaymentTypeId`) REFERENCES `payment_types` (`id`),
    CONSTRAINT `payments_party_client_id_fkey` FOREIGN KEY (`party_client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `payments_payment_direction_id_fkey` FOREIGN KEY (`payment_direction_id`) REFERENCES `payment_directions` (`id`) ON DELETE SET NULL,
    CONSTRAINT `payments_trans_mode_id_fkey` FOREIGN KEY (`trans_mode_id`) REFERENCES `trans_modes` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `purchases` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `supplier_id` char(36) COLLATE ascii_general_ci NULL,
    `payment_type_id` char(36) COLLATE ascii_general_ci NULL,
    `purchase_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `purchases_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `purchases_payment_type_id_fkey` FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) ON DELETE SET NULL,
    CONSTRAINT `purchases_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `logins` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `user_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `username` longtext CHARACTER SET utf8mb4 NULL,
    `password` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `logins_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `logins_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `transactions` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `client_id` char(36) COLLATE ascii_general_ci NULL,
    `product_id` char(36) COLLATE ascii_general_ci NULL,
    `user_id` char(36) COLLATE ascii_general_ci NULL,
    `trans_type_id` char(36) COLLATE ascii_general_ci NULL,
    `trans_mode_id` char(36) COLLATE ascii_general_ci NULL,
    `trans_category_id` char(36) COLLATE ascii_general_ci NULL,
    `amount` decimal(14,2) NOT NULL,
    `trans_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `transactions_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `transactions_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `transactions_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
    CONSTRAINT `transactions_trans_category_id_fkey` FOREIGN KEY (`trans_category_id`) REFERENCES `trans_categories` (`id`) ON DELETE SET NULL,
    CONSTRAINT `transactions_trans_mode_id_fkey` FOREIGN KEY (`trans_mode_id`) REFERENCES `trans_modes` (`id`) ON DELETE SET NULL,
    CONSTRAINT `transactions_trans_type_id_fkey` FOREIGN KEY (`trans_type_id`) REFERENCES `trans_types` (`id`) ON DELETE SET NULL,
    CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `order_lines` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `order_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `product_id` char(36) COLLATE ascii_general_ci NULL,
    `qty` int NOT NULL,
    `unit_price` decimal(14,2) NOT NULL,
    CONSTRAINT `order_lines_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `order_lines_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_lines_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `purchase_lines` (
    `id` char(36) COLLATE ascii_general_ci NOT NULL,
    `purchase_id` char(36) COLLATE ascii_general_ci NOT NULL,
    `product_id` char(36) COLLATE ascii_general_ci NULL,
    `qty` int NOT NULL,
    `unit_cost` decimal(14,2) NOT NULL,
    CONSTRAINT `purchase_lines_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `purchase_lines_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
    CONSTRAINT `purchase_lines_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_clients_client_type_id` ON `clients` (`client_type_id`);

CREATE INDEX `IX_expenses_expense_type_id` ON `expenses` (`expense_type_id`);

CREATE INDEX `IX_expenses_trans_mode_id` ON `expenses` (`trans_mode_id`);

CREATE UNIQUE INDEX `IX_logins_user_id` ON `logins` (`user_id`);

CREATE INDEX `IX_order_lines_order_id` ON `order_lines` (`order_id`);

CREATE INDEX `IX_order_lines_product_id` ON `order_lines` (`product_id`);

CREATE INDEX `IX_orders_client_id` ON `orders` (`client_id`);

CREATE INDEX `IX_orders_payment_type_id` ON `orders` (`payment_type_id`);

CREATE INDEX `IX_orders_status_id` ON `orders` (`status_id`);

CREATE INDEX `IX_payments_party_client_id` ON `payments` (`party_client_id`);

CREATE INDEX `IX_payments_payment_direction_id` ON `payments` (`payment_direction_id`);

CREATE INDEX `IX_payments_PaymentTypeId` ON `payments` (`PaymentTypeId`);

CREATE INDEX `IX_payments_trans_mode_id` ON `payments` (`trans_mode_id`);

CREATE UNIQUE INDEX `products_sku_key` ON `products` (`sku`);

CREATE INDEX `IX_purchase_lines_product_id` ON `purchase_lines` (`product_id`);

CREATE INDEX `IX_purchase_lines_purchase_id` ON `purchase_lines` (`purchase_id`);

CREATE INDEX `IX_purchases_payment_type_id` ON `purchases` (`payment_type_id`);

CREATE INDEX `IX_purchases_supplier_id` ON `purchases` (`supplier_id`);

CREATE INDEX `IX_stock_movements_movement_source_id` ON `stock_movements` (`movement_source_id`);

CREATE INDEX `IX_stock_movements_movement_type_id` ON `stock_movements` (`movement_type_id`);

CREATE INDEX `IX_stock_movements_product_id` ON `stock_movements` (`product_id`);

CREATE INDEX `IX_transactions_client_id` ON `transactions` (`client_id`);

CREATE INDEX `IX_transactions_product_id` ON `transactions` (`product_id`);

CREATE INDEX `IX_transactions_trans_category_id` ON `transactions` (`trans_category_id`);

CREATE INDEX `IX_transactions_trans_mode_id` ON `transactions` (`trans_mode_id`);

CREATE INDEX `IX_transactions_trans_type_id` ON `transactions` (`trans_type_id`);

CREATE INDEX `IX_transactions_user_id` ON `transactions` (`user_id`);

CREATE INDEX `IX_users_role_id` ON `users` (`role_id`);

CREATE INDEX `users_name_key` ON `users` (`name`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251112134038_InitialMySqlMigration', '9.0.10');

ALTER TABLE `clients` MODIFY COLUMN `phone` longtext CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251112214843_ChangePhoneNumberColumnType', '9.0.10');

COMMIT;


