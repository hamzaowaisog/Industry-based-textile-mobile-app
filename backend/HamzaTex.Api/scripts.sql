CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;
ALTER DATABASE CHARACTER SET utf8mb4;

CREATE TABLE `client_types` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `client_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `expense_types` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `expense_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `movement_sources` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `movement_sources_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `movement_types` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `movement_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `order_statuses` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `order_statuses_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `payment_directions` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `payment_directions_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `payment_types` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `payment_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `products` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
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
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `trans_categories_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `trans_modes` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `trans_modes_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `trans_types` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `trans_types_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `user_roles` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `user_roles_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `clients` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `client_type_id` int NULL,
    `phone` varchar(255) CHARACTER SET utf8mb4 NULL,
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
    `id` int NOT NULL AUTO_INCREMENT,
    `product_id` int NULL,
    `movement_type_id` int NULL,
    `movement_source_id` int NULL,
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
    `id` int NOT NULL AUTO_INCREMENT,
    `expense_type_id` int NULL,
    `amount` decimal(14,2) NOT NULL,
    `trans_mode_id` int NULL,
    `expense_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `expenses_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `expenses_expense_type_id_fkey` FOREIGN KEY (`expense_type_id`) REFERENCES `expense_types` (`id`) ON DELETE SET NULL,
    CONSTRAINT `expenses_trans_mode_id_fkey` FOREIGN KEY (`trans_mode_id`) REFERENCES `trans_modes` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) CHARACTER SET utf8mb4 NULL,
    `email` varchar(255) CHARACTER SET utf8mb4 NULL,
    `role_id` int NULL,
    `is_active` tinyint(1) NOT NULL DEFAULT TRUE,
    `created_at` datetime NOT NULL DEFAULT NOW(),
    CONSTRAINT `users_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `orders` (
    `id` int NOT NULL AUTO_INCREMENT,
    `client_id` int NULL,
    `status_id` int NULL,
    `payment_type_id` int NULL,
    `order_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `orders_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `orders_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_payment_type_id_fkey` FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `order_statuses` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `payments` (
    `id` int NOT NULL AUTO_INCREMENT,
    `party_client_id` int NULL,
    `payment_direction_id` int NULL,
    `trans_mode_id` int NULL,
    `amount` decimal(14,2) NOT NULL,
    `payment_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    `PaymentTypeId` int NULL,
    CONSTRAINT `payments_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `FK_payments_payment_types_PaymentTypeId` FOREIGN KEY (`PaymentTypeId`) REFERENCES `payment_types` (`id`),
    CONSTRAINT `payments_party_client_id_fkey` FOREIGN KEY (`party_client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `payments_payment_direction_id_fkey` FOREIGN KEY (`payment_direction_id`) REFERENCES `payment_directions` (`id`) ON DELETE SET NULL,
    CONSTRAINT `payments_trans_mode_id_fkey` FOREIGN KEY (`trans_mode_id`) REFERENCES `trans_modes` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `purchases` (
    `id` int NOT NULL AUTO_INCREMENT,
    `supplier_id` int NULL,
    `payment_type_id` int NULL,
    `purchase_date` date NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `purchases_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `purchases_payment_type_id_fkey` FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types` (`id`) ON DELETE SET NULL,
    CONSTRAINT `purchases_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `logins` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `username` varchar(255) CHARACTER SET utf8mb4 NULL,
    `password` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `logins_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `logins_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `transactions` (
    `id` int NOT NULL AUTO_INCREMENT,
    `client_id` int NULL,
    `product_id` int NULL,
    `user_id` int NULL,
    `trans_type_id` int NULL,
    `trans_mode_id` int NULL,
    `trans_category_id` int NULL,
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
    `id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `product_id` int NULL,
    `qty` int NOT NULL,
    `unit_price` decimal(14,2) NOT NULL,
    CONSTRAINT `order_lines_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `order_lines_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `order_lines_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `purchase_lines` (
    `id` int NOT NULL AUTO_INCREMENT,
    `purchase_id` int NOT NULL,
    `product_id` int NULL,
    `qty` int NOT NULL,
    `unit_cost` decimal(14,2) NOT NULL,
    CONSTRAINT `purchase_lines_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `purchase_lines_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
    CONSTRAINT `purchase_lines_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_clients_client_type_id` ON `clients` (`client_type_id`);

CREATE INDEX `IX_clients_is_active` ON `clients` (`is_active`);

CREATE INDEX `IX_clients_name` ON `clients` (`name`);

CREATE INDEX `IX_clients_phone` ON `clients` (`phone`);

CREATE INDEX `IX_expenses_expense_date` ON `expenses` (`expense_date`);

CREATE INDEX `IX_expenses_expense_type_id` ON `expenses` (`expense_type_id`);

CREATE INDEX `IX_expenses_trans_mode_id` ON `expenses` (`trans_mode_id`);

CREATE INDEX `IX_expenses_type_date` ON `expenses` (`expense_type_id`, `expense_date`);

CREATE UNIQUE INDEX `IX_logins_user_id` ON `logins` (`user_id`);

CREATE UNIQUE INDEX `IX_logins_username` ON `logins` (`username`);

CREATE INDEX `IX_order_lines_order_id` ON `order_lines` (`order_id`);

CREATE INDEX `IX_order_lines_product_id` ON `order_lines` (`product_id`);

CREATE INDEX `IX_orders_client_date` ON `orders` (`client_id`, `order_date`);

CREATE INDEX `IX_orders_client_id` ON `orders` (`client_id`);

CREATE INDEX `IX_orders_order_date` ON `orders` (`order_date`);

CREATE INDEX `IX_orders_payment_type_id` ON `orders` (`payment_type_id`);

CREATE INDEX `IX_orders_status_date` ON `orders` (`status_id`, `order_date`);

CREATE INDEX `IX_orders_status_id` ON `orders` (`status_id`);

CREATE INDEX `IX_payments_client_date` ON `payments` (`party_client_id`, `payment_date`);

CREATE INDEX `IX_payments_party_client_id` ON `payments` (`party_client_id`);

CREATE INDEX `IX_payments_payment_date` ON `payments` (`payment_date`);

CREATE INDEX `IX_payments_payment_direction_id` ON `payments` (`payment_direction_id`);

CREATE INDEX `IX_payments_PaymentTypeId` ON `payments` (`PaymentTypeId`);

CREATE INDEX `IX_payments_trans_mode_id` ON `payments` (`trans_mode_id`);

CREATE INDEX `IX_products_is_active` ON `products` (`is_active`);

CREATE INDEX `IX_products_is_active_name` ON `products` (`is_active`, `name`);

CREATE INDEX `IX_products_name` ON `products` (`name`);

CREATE UNIQUE INDEX `products_sku_key` ON `products` (`sku`);

CREATE INDEX `IX_purchase_lines_product_id` ON `purchase_lines` (`product_id`);

CREATE INDEX `IX_purchase_lines_purchase_id` ON `purchase_lines` (`purchase_id`);

CREATE INDEX `IX_purchases_payment_type_id` ON `purchases` (`payment_type_id`);

CREATE INDEX `IX_purchases_purchase_date` ON `purchases` (`purchase_date`);

CREATE INDEX `IX_purchases_supplier_date` ON `purchases` (`supplier_id`, `purchase_date`);

CREATE INDEX `IX_purchases_supplier_id` ON `purchases` (`supplier_id`);

CREATE INDEX `IX_stock_movements_movement_date` ON `stock_movements` (`movement_date`);

CREATE INDEX `IX_stock_movements_movement_source_id` ON `stock_movements` (`movement_source_id`);

CREATE INDEX `IX_stock_movements_movement_type_id` ON `stock_movements` (`movement_type_id`);

CREATE INDEX `IX_stock_movements_product_date` ON `stock_movements` (`product_id`, `movement_date`);

CREATE INDEX `IX_stock_movements_product_id` ON `stock_movements` (`product_id`);

CREATE INDEX `IX_transactions_client_date` ON `transactions` (`client_id`, `trans_date`);

CREATE INDEX `IX_transactions_client_id` ON `transactions` (`client_id`);

CREATE INDEX `IX_transactions_product_id` ON `transactions` (`product_id`);

CREATE INDEX `IX_transactions_trans_category_id` ON `transactions` (`trans_category_id`);

CREATE INDEX `IX_transactions_trans_date` ON `transactions` (`trans_date`);

CREATE INDEX `IX_transactions_trans_mode_id` ON `transactions` (`trans_mode_id`);

CREATE INDEX `IX_transactions_trans_type_id` ON `transactions` (`trans_type_id`);

CREATE INDEX `IX_transactions_type_date` ON `transactions` (`trans_type_id`, `trans_date`);

CREATE INDEX `IX_transactions_user_date` ON `transactions` (`user_id`, `trans_date`);

CREATE INDEX `IX_transactions_user_id` ON `transactions` (`user_id`);

CREATE INDEX `IX_users_email` ON `users` (`email`);

CREATE INDEX `IX_users_is_active` ON `users` (`is_active`);

CREATE INDEX `IX_users_is_active_created_at` ON `users` (`is_active`, `created_at`);

CREATE INDEX `IX_users_role_id` ON `users` (`role_id`);

CREATE INDEX `users_name_key` ON `users` (`name`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251119124359_InitialMigrations', '9.0.10');

ALTER TABLE `clients` ADD `UserId` int NULL;

CREATE INDEX `IX_clients_UserId` ON `clients` (`UserId`);

ALTER TABLE `clients` ADD CONSTRAINT `clients_user_id_fkey` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251212151946_AddedUserAsaForeignKeyInClient', '9.0.10');

ALTER TABLE `clients` RENAME COLUMN `UserId` TO `user_id`;

ALTER TABLE `clients` RENAME INDEX `IX_clients_UserId` TO `IX_clients_user_id`;

ALTER TABLE `expenses` ADD `trans_category_id` int NULL;

ALTER TABLE `expenses` ADD `transaction_id` int NULL;

ALTER TABLE `expenses` ADD `user_id` int NULL;

CREATE INDEX `IX_expenses_trans_category_id` ON `expenses` (`trans_category_id`);

CREATE INDEX `IX_expenses_transaction_id` ON `expenses` (`transaction_id`);

CREATE INDEX `IX_expenses_user_id` ON `expenses` (`user_id`);

ALTER TABLE `expenses` ADD CONSTRAINT `expenses_trans_category_id_fkey` FOREIGN KEY (`trans_category_id`) REFERENCES `trans_categories` (`id`) ON DELETE SET NULL;

ALTER TABLE `expenses` ADD CONSTRAINT `expenses_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;

ALTER TABLE `expenses` ADD CONSTRAINT `expenses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251212155145_AddedExpensesForeingKeys', '9.0.10');

COMMIT;


