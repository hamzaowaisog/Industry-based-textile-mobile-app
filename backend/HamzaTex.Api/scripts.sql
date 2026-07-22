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


                CREATE VIEW v_client_balance AS
                SELECT
                    c.id                             AS client_id,
                    c.name                           AS name,
                    (COALESCE(c.opening_balance, 0)
                    + COALESCE(SUM(t.amount), 0))   AS balance
                FROM clients c
                LEFT JOIN transactions t
                    ON t.client_id = c.id
                GROUP BY c.id, c.name, c.opening_balance;
            


                CREATE VIEW v_monthly_profit_loss AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY month)                AS id,
                    month,
                    total_sales,
                    total_purchases,
                    total_expenses,
                    (total_sales - total_purchases)                   AS gross_profit,
                    (total_sales - total_purchases - total_expenses)  AS net_profit
                FROM (
                    SELECT
                        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
                        SUM(CASE WHEN tt.name = 'Sale'     THEN t.amount ELSE 0 END) AS total_sales,
                        SUM(CASE WHEN tt.name = 'Purchase' THEN t.amount ELSE 0 END) AS total_purchases,
                        0 AS total_expenses  -- or join expenses table if you want
                    FROM transactions t
                    LEFT JOIN trans_types tt ON t.trans_type_id = tt.id
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;
            

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251215131335_AddViews', '9.0.10');

DROP TABLE `logins`;

ALTER TABLE `users` ADD `password` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` ADD `user_name` longtext CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251217152509_removeLoginTable', '9.0.10');

DROP PROCEDURE IF EXISTS `POMELO_BEFORE_DROP_PRIMARY_KEY`;
DELIMITER //
CREATE PROCEDURE `POMELO_BEFORE_DROP_PRIMARY_KEY`(IN `SCHEMA_NAME_ARGUMENT` VARCHAR(255), IN `TABLE_NAME_ARGUMENT` VARCHAR(255))
BEGIN
	DECLARE HAS_AUTO_INCREMENT_ID TINYINT(1);
	DECLARE PRIMARY_KEY_COLUMN_NAME VARCHAR(255);
	DECLARE PRIMARY_KEY_TYPE VARCHAR(255);
	DECLARE SQL_EXP VARCHAR(1000);
	SELECT COUNT(*)
		INTO HAS_AUTO_INCREMENT_ID
		FROM `information_schema`.`COLUMNS`
		WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
			AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
			AND `Extra` = 'auto_increment'
			AND `COLUMN_KEY` = 'PRI'
			LIMIT 1;
	IF HAS_AUTO_INCREMENT_ID THEN
		SELECT `COLUMN_TYPE`
			INTO PRIMARY_KEY_TYPE
			FROM `information_schema`.`COLUMNS`
			WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
				AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
				AND `COLUMN_KEY` = 'PRI'
			LIMIT 1;
		SELECT `COLUMN_NAME`
			INTO PRIMARY_KEY_COLUMN_NAME
			FROM `information_schema`.`COLUMNS`
			WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
				AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
				AND `COLUMN_KEY` = 'PRI'
			LIMIT 1;
		SET SQL_EXP = CONCAT('ALTER TABLE `', (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA())), '`.`', TABLE_NAME_ARGUMENT, '` MODIFY COLUMN `', PRIMARY_KEY_COLUMN_NAME, '` ', PRIMARY_KEY_TYPE, ' NOT NULL;');
		SET @SQL_EXP = SQL_EXP;
		PREPARE SQL_EXP_EXECUTE FROM @SQL_EXP;
		EXECUTE SQL_EXP_EXECUTE;
		DEALLOCATE PREPARE SQL_EXP_EXECUTE;
	END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS `POMELO_AFTER_ADD_PRIMARY_KEY`;
DELIMITER //
CREATE PROCEDURE `POMELO_AFTER_ADD_PRIMARY_KEY`(IN `SCHEMA_NAME_ARGUMENT` VARCHAR(255), IN `TABLE_NAME_ARGUMENT` VARCHAR(255), IN `COLUMN_NAME_ARGUMENT` VARCHAR(255))
BEGIN
	DECLARE HAS_AUTO_INCREMENT_ID INT(11);
	DECLARE PRIMARY_KEY_COLUMN_NAME VARCHAR(255);
	DECLARE PRIMARY_KEY_TYPE VARCHAR(255);
	DECLARE SQL_EXP VARCHAR(1000);
	SELECT COUNT(*)
		INTO HAS_AUTO_INCREMENT_ID
		FROM `information_schema`.`COLUMNS`
		WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
			AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
			AND `COLUMN_NAME` = COLUMN_NAME_ARGUMENT
			AND `COLUMN_TYPE` LIKE '%int%'
			AND `COLUMN_KEY` = 'PRI';
	IF HAS_AUTO_INCREMENT_ID THEN
		SELECT `COLUMN_TYPE`
			INTO PRIMARY_KEY_TYPE
			FROM `information_schema`.`COLUMNS`
			WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
				AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
				AND `COLUMN_NAME` = COLUMN_NAME_ARGUMENT
				AND `COLUMN_TYPE` LIKE '%int%'
				AND `COLUMN_KEY` = 'PRI';
		SELECT `COLUMN_NAME`
			INTO PRIMARY_KEY_COLUMN_NAME
			FROM `information_schema`.`COLUMNS`
			WHERE `TABLE_SCHEMA` = (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA()))
				AND `TABLE_NAME` = TABLE_NAME_ARGUMENT
				AND `COLUMN_NAME` = COLUMN_NAME_ARGUMENT
				AND `COLUMN_TYPE` LIKE '%int%'
				AND `COLUMN_KEY` = 'PRI';
		SET SQL_EXP = CONCAT('ALTER TABLE `', (SELECT IFNULL(SCHEMA_NAME_ARGUMENT, SCHEMA())), '`.`', TABLE_NAME_ARGUMENT, '` MODIFY COLUMN `', PRIMARY_KEY_COLUMN_NAME, '` ', PRIMARY_KEY_TYPE, ' NOT NULL AUTO_INCREMENT;');
		SET @SQL_EXP = SQL_EXP;
		PREPARE SQL_EXP_EXECUTE FROM @SQL_EXP;
		EXECUTE SQL_EXP_EXECUTE;
		DEALLOCATE PREPARE SQL_EXP_EXECUTE;
	END IF;
END //
DELIMITER ;

ALTER TABLE `clients` DROP FOREIGN KEY `clients_user_id_fkey`;

ALTER TABLE `expenses` DROP FOREIGN KEY `expenses_user_id_fkey`;

ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_user_id_fkey`;

CALL POMELO_BEFORE_DROP_PRIMARY_KEY(NULL, 'users');
ALTER TABLE `users` DROP PRIMARY KEY;

ALTER TABLE `users` DROP COLUMN `password`;

ALTER TABLE `users` MODIFY COLUMN `user_name` varchar(256) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` MODIFY COLUMN `email` varchar(256) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` ADD `access_failed_count` int NOT NULL DEFAULT 0;

ALTER TABLE `users` ADD `concurrency_stamp` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` ADD `email_confirmed` tinyint(1) NOT NULL DEFAULT FALSE;

ALTER TABLE `users` ADD `lockout_enabled` tinyint(1) NOT NULL DEFAULT FALSE;

ALTER TABLE `users` ADD `lockout_end` datetime(6) NULL;

ALTER TABLE `users` ADD `normalized_email` varchar(256) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` ADD `normalized_user_name` varchar(256) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` ADD `password_hash` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` ADD `security_stamp` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` ADD `phone_number` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `users` ADD `phone_number_confirmed` tinyint(1) NOT NULL DEFAULT FALSE;

ALTER TABLE `users` ADD `two_factor_enabled` tinyint(1) NOT NULL DEFAULT FALSE;

ALTER TABLE `users` ADD CONSTRAINT `PK_users` PRIMARY KEY (`id`);
CALL POMELO_AFTER_ADD_PRIMARY_KEY(NULL, 'users', 'id');

CREATE TABLE `aspnet_roles` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Name` varchar(256) CHARACTER SET utf8mb4 NULL,
    `NormalizedName` varchar(256) CHARACTER SET utf8mb4 NULL,
    `ConcurrencyStamp` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_aspnet_roles` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `aspnet_user_claims` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `ClaimType` longtext CHARACTER SET utf8mb4 NULL,
    `ClaimValue` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_aspnet_user_claims` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_aspnet_user_claims_users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `aspnet_user_logins` (
    `LoginProvider` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `ProviderKey` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `ProviderDisplayName` longtext CHARACTER SET utf8mb4 NULL,
    `UserId` int NOT NULL,
    CONSTRAINT `PK_aspnet_user_logins` PRIMARY KEY (`LoginProvider`, `ProviderKey`),
    CONSTRAINT `FK_aspnet_user_logins_users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `aspnet_user_tokens` (
    `UserId` int NOT NULL,
    `LoginProvider` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `Name` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `Value` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_aspnet_user_tokens` PRIMARY KEY (`UserId`, `LoginProvider`, `Name`),
    CONSTRAINT `FK_aspnet_user_tokens_users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `aspnet_role_claims` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `RoleId` int NOT NULL,
    `ClaimType` longtext CHARACTER SET utf8mb4 NULL,
    `ClaimValue` longtext CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `PK_aspnet_role_claims` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_aspnet_role_claims_aspnet_roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `aspnet_roles` (`Id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE TABLE `aspnet_user_roles` (
    `UserId` int NOT NULL,
    `RoleId` int NOT NULL,
    CONSTRAINT `PK_aspnet_user_roles` PRIMARY KEY (`UserId`, `RoleId`),
    CONSTRAINT `FK_aspnet_user_roles_aspnet_roles_RoleId` FOREIGN KEY (`RoleId`) REFERENCES `aspnet_roles` (`Id`) ON DELETE CASCADE,
    CONSTRAINT `FK_aspnet_user_roles_users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `EmailIndex` ON `users` (`normalized_email`);

CREATE UNIQUE INDEX `UserNameIndex` ON `users` (`normalized_user_name`);

CREATE INDEX `IX_aspnet_role_claims_RoleId` ON `aspnet_role_claims` (`RoleId`);

CREATE UNIQUE INDEX `RoleNameIndex` ON `aspnet_roles` (`NormalizedName`);

CREATE INDEX `IX_aspnet_user_claims_UserId` ON `aspnet_user_claims` (`UserId`);

CREATE INDEX `IX_aspnet_user_logins_UserId` ON `aspnet_user_logins` (`UserId`);

CREATE INDEX `IX_aspnet_user_roles_RoleId` ON `aspnet_user_roles` (`RoleId`);

ALTER TABLE `clients` ADD CONSTRAINT `clients_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `expenses` ADD CONSTRAINT `expenses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251218141453_UpdatedUserTable', '9.0.10');

DROP PROCEDURE `POMELO_BEFORE_DROP_PRIMARY_KEY`;

DROP PROCEDURE `POMELO_AFTER_ADD_PRIMARY_KEY`;

CREATE TABLE `refresh_tokens` (
    `id` int NOT NULL AUTO_INCREMENT,
    `token` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `user_id` int NOT NULL,
    `expires_at` datetime NOT NULL,
    `CreatedAt` datetime NOT NULL DEFAULT NOW(),
    `revoked_at` datetime(6) NOT NULL,
    `revoked_by_ip` longtext CHARACTER SET utf8mb4 NULL,
    `replaced_by_token` varchar(255) CHARACTER SET utf8mb4 NULL,
    CONSTRAINT `refresh_tokens_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `idx_refresh_tokens_token` ON `refresh_tokens` (`token`);

CREATE INDEX `idx_refresh_tokens_user_id` ON `refresh_tokens` (`user_id`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251229140200_RefreshTokenTable', '9.0.10');

ALTER TABLE `refresh_tokens` MODIFY COLUMN `revoked_at` datetime(6) NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251229142101_MakeRevokedAtNullable', '9.0.10');

ALTER TABLE `refresh_tokens` ADD `created_by_ip` longtext CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20251230072829_AddCreatedByIpToRefreshToken', '9.0.10');

ALTER TABLE `users` MODIFY COLUMN `email_confirmed` tinyint(1) NOT NULL DEFAULT FALSE;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260202123952_AddedDefaultValueForEmailConfirmation', '9.0.10');

DROP VIEW IF EXISTS v_monthly_profit_loss;

CREATE VIEW v_monthly_profit_loss AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY month)                AS id,
                    month,
                    total_sales,
                    total_purchases,
                    total_expenses,
                    (total_sales - total_purchases)                   AS gross_profit,
                    (total_sales - total_purchases - total_expenses)  AS net_profit
                FROM (
                    SELECT
                        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
                        SUM(CASE WHEN tt.name = 'Sale'     THEN t.amount ELSE 0 END) AS total_sales,
                        SUM(CASE WHEN tt.name = 'Purchase' THEN t.amount ELSE 0 END) AS total_purchases,
                        SUM(CASE WHEN tt.name like '%Expense%' THEN t.amount ELSE 0 END) AS total_expenses  -- or join expenses table if you want
                    FROM transactions t
                    LEFT JOIN trans_categories tt ON t.trans_category_id = tt.id
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;

DROP VIEW IF EXISTS v_monthly_credit_debit;

CREATE VIEW v_monthly_credit_debit AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY month)                AS id,
                    month,
                    total_credit,
                    total_debit,
                    (total_credit - total_debit)                   AS balance
                FROM (
                    SELECT
                        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
                        SUM(CASE WHEN tt.name = 'Credit'     THEN t.amount ELSE 0 END) AS total_credit,
                        SUM(CASE WHEN tt.name = 'Debit' THEN t.amount ELSE 0 END) AS total_debit
                    FROM transactions t
                    LEFT JOIN trans_types tt ON t.trans_type_id = tt.id
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260204131656_UpdateMonthlyProfitLossView', '9.0.10');

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260204140443_UpdateMonthlyCreditDebit', '9.0.10');

CREATE TABLE `product_users` (
    `product_id` int NOT NULL,
    `user_id` int NOT NULL,
    `date` date NOT NULL,
    CONSTRAINT `product_users_pkey` PRIMARY KEY (`product_id`, `user_id`),
    CONSTRAINT `product_users_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `product_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_product_users_user_id` ON `product_users` (`user_id`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260205223359_ProductUserTableCreated', '9.0.10');

DROP TABLE IF EXISTS `user`;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260205224336_DroppingUserTable', '9.0.10');


            SET @dbname = DATABASE();
            SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                           WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'expenses' AND COLUMN_NAME = 'UserId1');
            SET @sql = IF(@exists > 0, 'ALTER TABLE `expenses` DROP COLUMN `UserId1`', 'SELECT 1');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        


            SET @dbname = DATABASE();
            SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                           WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'transactions' AND COLUMN_NAME = 'UserId1');
            SET @sql = IF(@exists > 0, 'ALTER TABLE `transactions` DROP COLUMN `UserId1`', 'SELECT 1');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        


            SET @dbname = DATABASE();
            SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                           WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'clients' AND COLUMN_NAME = 'UserId1');
            SET @sql = IF(@exists > 0, 'ALTER TABLE `clients` DROP COLUMN `UserId1`', 'SELECT 1');
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260206144641_RemovalOfUserId1fromTables', '9.0.10');

ALTER TABLE `products` ADD `quantity` decimal(14,2) NULL DEFAULT 0;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260206191253_ProductQuantityAdded', '9.0.10');

ALTER TABLE `stock_movements` MODIFY COLUMN `qty` decimal(14,2) NULL DEFAULT 0;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260210103142_ChangedQuantityColumnType', '9.0.10');

ALTER TABLE `stock_movements` ADD `average_cost_at_movement` decimal(14,4) NULL;

ALTER TABLE `stock_movements` ADD `average_price_at_movement` decimal(14,4) NULL;

ALTER TABLE `products` ADD `TotalQuantitySold` decimal(65,30) NULL;

ALTER TABLE `products` ADD `average_cost` decimal(14,4) NULL;

ALTER TABLE `products` ADD `average_price` decimal(14,4) NULL;

ALTER TABLE `products` ADD `cost_change_count` int NOT NULL DEFAULT 0;

ALTER TABLE `products` ADD `price_change_count` int NOT NULL DEFAULT 0;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260210205002_AddTotalQuantityInProductTable', '9.0.10');

ALTER TABLE `products` RENAME COLUMN `TotalQuantitySold` TO `total_quantity_sold`;

ALTER TABLE `products` MODIFY COLUMN `total_quantity_sold` decimal(14,2) NULL DEFAULT 0;

ALTER TABLE `products` ADD `total_quantity_purchased` decimal(14,2) NULL DEFAULT 0;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260211083915_AddTotalQuantityPurchasedColumnAdded', '9.0.10');

DROP VIEW IF EXISTS v_monthly_profit_loss;


                CREATE VIEW v_monthly_profit_loss AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY month) AS id,
                    month,
                    total_sales,
                    total_purchases,
                    total_expenses,
                    (total_sales - total_purchases)                  AS gross_profit,
                    (total_sales - total_purchases - total_expenses)  AS net_profit
                FROM (
                    SELECT
                        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
                        SUM(CASE WHEN t.trans_category_id = 1 THEN t.amount ELSE 0 END) AS total_sales,
                        SUM(CASE WHEN t.trans_category_id = 2 THEN t.amount ELSE 0 END) AS total_purchases,
                        SUM(CASE WHEN t.trans_category_id IN (3, 4) THEN t.amount ELSE 0 END) AS total_expenses
                    FROM transactions t
                    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
                ) x;
            

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260412100000_FixProfitLossViewCategoryMatching', '9.0.10');

ALTER TABLE `transactions` ADD `OrderId` int NULL;

ALTER TABLE `transactions` ADD `PurchaseId` int NULL;

CREATE INDEX `IX_transactions_order_id` ON `transactions` (`OrderId`);

CREATE INDEX `IX_transactions_purchase_id` ON `transactions` (`PurchaseId`);

ALTER TABLE `transactions` ADD CONSTRAINT `FK_transactions_orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`id`);

ALTER TABLE `transactions` ADD CONSTRAINT `FK_transactions_purchases_PurchaseId` FOREIGN KEY (`PurchaseId`) REFERENCES `purchases` (`id`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260412175014_AddOrderIdPurchaseIdToTransaction', '9.0.10');

ALTER TABLE `transactions` DROP FOREIGN KEY `FK_transactions_orders_OrderId`;

ALTER TABLE `transactions` DROP FOREIGN KEY `FK_transactions_purchases_PurchaseId`;

ALTER TABLE `purchases` ADD `status_id` int NULL;

CREATE TABLE `purchase_statuses` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` datetime NULL DEFAULT NOW(),
    CONSTRAINT `purchase_statuses_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_purchases_status_id` ON `purchases` (`status_id`);

ALTER TABLE `purchases` ADD CONSTRAINT `purchases_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `purchase_statuses` (`id`) ON DELETE SET NULL;

ALTER TABLE `transactions` ADD CONSTRAINT `FK_transactions_orders_OrderId` FOREIGN KEY (`OrderId`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

ALTER TABLE `transactions` ADD CONSTRAINT `FK_transactions_purchases_PurchaseId` FOREIGN KEY (`PurchaseId`) REFERENCES `purchases` (`id`) ON DELETE SET NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260412203724_AddPurchaseStatusAndStatusId', '9.0.10');

ALTER TABLE `purchase_lines` MODIFY COLUMN `qty` decimal(14,2) NOT NULL;

ALTER TABLE `order_lines` MODIFY COLUMN `qty` decimal(14,2) NOT NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260412204527_ChangeQtyToDecimalOnOrderAndPurchaseLines', '9.0.10');

ALTER TABLE `purchase_lines` MODIFY COLUMN `unit_cost` decimal(14,4) NOT NULL;

ALTER TABLE `order_lines` MODIFY COLUMN `unit_price` decimal(14,4) NOT NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260412204830_ChangeUnitCostAndPriceToDecimal14x4OnLines', '9.0.10');

ALTER TABLE `payments` ADD `is_reversed` tinyint(1) NOT NULL DEFAULT FALSE;

ALTER TABLE `payments` ADD `original_payment_id` int NULL;

ALTER TABLE `payments` ADD `reversed_by_payment_id` int NULL;

ALTER TABLE `payments` ADD `transaction_id` int NULL;

ALTER TABLE `payments` ADD `user_id` int NULL;

CREATE TABLE `payment_allocations` (
    `id` int NOT NULL AUTO_INCREMENT,
    `payment_id` int NOT NULL,
    `order_id` int NULL,
    `purchase_id` int NULL,
    `allocated_amount` decimal(14,2) NOT NULL,
    CONSTRAINT `payment_allocations_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `payment_allocations_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `payment_allocations_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `payment_allocations_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_payments_is_reversed` ON `payments` (`is_reversed`);

CREATE INDEX `IX_payments_original_payment_id` ON `payments` (`original_payment_id`);

CREATE INDEX `IX_payments_reversed_by_payment_id` ON `payments` (`reversed_by_payment_id`);

CREATE INDEX `IX_payments_transaction_id` ON `payments` (`transaction_id`);

CREATE INDEX `IX_payments_user_id` ON `payments` (`user_id`);

CREATE INDEX `IX_payment_allocations_order_id` ON `payment_allocations` (`order_id`);

CREATE INDEX `IX_payment_allocations_payment_id` ON `payment_allocations` (`payment_id`);

CREATE INDEX `IX_payment_allocations_purchase_id` ON `payment_allocations` (`purchase_id`);

ALTER TABLE `payments` ADD CONSTRAINT `payments_original_payment_id_fkey` FOREIGN KEY (`original_payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL;

ALTER TABLE `payments` ADD CONSTRAINT `payments_reversed_by_payment_id_fkey` FOREIGN KEY (`reversed_by_payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL;

ALTER TABLE `payments` ADD CONSTRAINT `payments_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL;

ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260415215348_AddPaymentAllocationTable', '9.0.10');

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260415215411_AddFieldsToPayment', '9.0.10');

DROP VIEW IF EXISTS v_client_balance;


CREATE VIEW v_client_balance AS
SELECT
    c.id        AS client_id,
    c.name,
    COALESCE(t.order_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS order_total
    FROM transactions
    WHERE trans_category_id = 1
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 1
      AND is_reversed = 0
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 1

UNION ALL

SELECT
    c.id,
    c.name,
    COALESCE(t.purchase_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS purchase_total
    FROM transactions
    WHERE trans_category_id = 2
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 2
      AND is_reversed = 0
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 2;


INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260415215422_UpdateVClientBalanceView', '9.0.10');

DROP VIEW IF EXISTS v_monthly_credit_debit;


CREATE VIEW v_monthly_credit_debit AS
SELECT
    ROW_NUMBER() OVER (ORDER BY month) AS id,
    month,
    total_credit,
    total_debit,
    (total_credit - total_debit) AS balance
FROM (
    SELECT
        DATE_FORMAT(t.trans_date, '%Y-%m-01') AS month,
        SUM(CASE WHEN t.trans_type_id = 2 THEN t.amount ELSE 0 END) AS total_credit,
        SUM(CASE WHEN t.trans_type_id = 1 THEN t.amount ELSE 0 END) AS total_debit
    FROM transactions t
    WHERE t.trans_category_id IN (5, 6, 7, 8)
    GROUP BY DATE_FORMAT(t.trans_date, '%Y-%m-01')
) x;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260415224000_FixMonthlyCreditDebitView', '9.0.10');

DROP VIEW IF EXISTS v_client_balance;


CREATE VIEW v_client_balance AS
SELECT
    c.id        AS client_id,
    c.name,
    COALESCE(t.order_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS order_total
    FROM transactions
    WHERE trans_category_id = 1
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 1
      AND is_reversed = 0
      AND original_payment_id IS NULL
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 1

UNION ALL

SELECT
    c.id,
    c.name,
    COALESCE(t.purchase_total, 0) - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS purchase_total
    FROM transactions
    WHERE trans_category_id = 2
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 2
      AND is_reversed = 0
      AND original_payment_id IS NULL
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 2;


INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260418191031_FixVClientBalanceExcludeReversalPayments', '9.0.10');

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260503033103_ChangeCreatedAtToDateOnly', '9.0.10');

ALTER TABLE `transactions` ADD `invoice_id` int NULL;

ALTER TABLE `payment_allocations` ADD `invoice_id` int NULL;

CREATE TABLE `invoice_statuses` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` date NULL,
    CONSTRAINT `invoice_statuses_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

CREATE TABLE `invoices` (
    `id` int NOT NULL AUTO_INCREMENT,
    `invoice_number` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
    `order_id` int NULL,
    `purchase_id` int NULL,
    `client_id` int NULL,
    `invoice_status_id` int NOT NULL,
    `issue_date` date NULL,
    `due_date` date NULL,
    `total_amount` decimal(14,2) NOT NULL,
    `notes` longtext CHARACTER SET utf8mb4 NULL,
    `created_by_user_id` int NULL,
    `created_at` date NOT NULL,
    CONSTRAINT `invoices_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `FK_invoices_clients_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_invoices_invoice_statuses_invoice_status_id` FOREIGN KEY (`invoice_status_id`) REFERENCES `invoice_statuses` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_invoices_orders_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_invoices_purchases_purchase_id` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_invoices_users_created_by_user_id` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) CHARACTER SET=utf8mb4;

CREATE TABLE `invoice_lines` (
    `id` int NOT NULL AUTO_INCREMENT,
    `invoice_id` int NOT NULL,
    `product_name` longtext CHARACTER SET utf8mb4 NOT NULL,
    `qty` decimal(14,2) NOT NULL,
    `unit_price` decimal(14,4) NOT NULL,
    `line_total` decimal(14,2) NOT NULL,
    CONSTRAINT `invoice_lines_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `FK_invoice_lines_invoices_invoice_id` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_transactions_invoice_id` ON `transactions` (`invoice_id`);

CREATE INDEX `IX_payment_allocations_invoice_id` ON `payment_allocations` (`invoice_id`);

CREATE INDEX `IX_invoice_lines_invoice_id` ON `invoice_lines` (`invoice_id`);

CREATE INDEX `IX_invoices_client_id` ON `invoices` (`client_id`);

CREATE INDEX `IX_invoices_created_by_user_id` ON `invoices` (`created_by_user_id`);

CREATE UNIQUE INDEX `IX_invoices_number` ON `invoices` (`invoice_number`);

CREATE INDEX `IX_invoices_order_id` ON `invoices` (`order_id`);

CREATE INDEX `IX_invoices_purchase_id` ON `invoices` (`purchase_id`);

CREATE INDEX `IX_invoices_status_id` ON `invoices` (`invoice_status_id`);

ALTER TABLE `payment_allocations` ADD CONSTRAINT `FK_payment_allocations_invoices_invoice_id` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL;

ALTER TABLE `transactions` ADD CONSTRAINT `FK_transactions_invoices_invoice_id` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260508234017_AddInvoiceTables', '9.0.10');

ALTER TABLE `refresh_tokens` ADD `IsBiometric` tinyint(1) NOT NULL DEFAULT FALSE;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260516201033_AddBiometricToRefreshTokens', '9.0.10');

ALTER TABLE `transactions` ADD `UpdatedAt` date NULL;

ALTER TABLE `stock_movements` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `stock_movements` ADD `UpdatedAt` date NULL;

ALTER TABLE `purchases` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `purchases` ADD `UpdatedAt` date NULL;

ALTER TABLE `purchase_lines` ADD `UpdatedAt` date NULL;

ALTER TABLE `products` ADD `UpdatedAt` date NULL;

ALTER TABLE `payments` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `payments` ADD `UpdatedAt` date NULL;

ALTER TABLE `payment_allocations` ADD `UpdatedAt` date NULL;

ALTER TABLE `orders` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `orders` ADD `UpdatedAt` date NULL;

ALTER TABLE `order_lines` ADD `UpdatedAt` date NULL;

ALTER TABLE `invoices` ADD `UpdatedAt` date NULL;

ALTER TABLE `invoice_lines` ADD `UpdatedAt` date NULL;

ALTER TABLE `expenses` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `expenses` ADD `UpdatedAt` date NULL;

ALTER TABLE `clients` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `clients` ADD `UpdatedAt` date NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260517083520_AddUpdatedAtAndLocalIdToSyncableEntities', '9.0.10');

ALTER TABLE `transactions` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `transactions` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `stock_movements` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `stock_movements` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `purchases` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `purchases` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `purchase_lines` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `purchase_lines` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `products` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `products` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `payments` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `payments` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `payment_allocations` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `payment_allocations` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `orders` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `orders` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `order_lines` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `order_lines` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `invoices` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `invoices` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `invoice_lines` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `invoice_lines` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `expenses` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `expenses` ADD `Version` int NOT NULL DEFAULT 0;

ALTER TABLE `clients` MODIFY COLUMN `UpdatedAt` datetime(6) NULL;

ALTER TABLE `clients` ADD `Version` int NOT NULL DEFAULT 0;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260517101727_AddVersionAndDateTimeUpdatedAt', '9.0.10');

ALTER TABLE `transactions` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `products` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

ALTER TABLE `invoices` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260517103944_AddLocalIdToProductTransactionInvoice', '9.0.10');

CREATE TABLE `DeviceTokens` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `PushToken` longtext CHARACTER SET utf8mb4 NOT NULL,
    `DeviceType` longtext CHARACTER SET utf8mb4 NOT NULL,
    `AppVersion` longtext CHARACTER SET utf8mb4 NULL,
    `RegisteredAt` datetime(6) NOT NULL,
    `LastUsedAt` datetime(6) NULL,
    `IsActive` tinyint(1) NOT NULL,
    CONSTRAINT `PK_DeviceTokens` PRIMARY KEY (`Id`),
    CONSTRAINT `FK_DeviceTokens_users_UserId` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_DeviceTokens_UserId` ON `DeviceTokens` (`UserId`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260529165511_AddDeviceTokenTable', '9.0.10');

CREATE TABLE `PasswordResetOtps` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `CodeHash` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ResetTokenHash` longtext CHARACTER SET utf8mb4 NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `ExpiresAt` datetime(6) NOT NULL,
    `ResetTokenExpiresAt` datetime(6) NULL,
    `AttemptCount` int NOT NULL,
    `IsUsed` tinyint(1) NOT NULL,
    CONSTRAINT `PK_PasswordResetOtps` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260531020434_AddPasswordResetOtpTable', '9.0.10');

CREATE TABLE `EmailVerificationOtps` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `Email` longtext CHARACTER SET utf8mb4 NOT NULL,
    `CodeHash` longtext CHARACTER SET utf8mb4 NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `ExpiresAt` datetime(6) NOT NULL,
    `NextResendAt` datetime(6) NOT NULL,
    `AttemptCount` int NOT NULL,
    `IsUsed` tinyint(1) NOT NULL,
    CONSTRAINT `PK_EmailVerificationOtps` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260531153733_AddEmailVerificationOtp', '9.0.10');

ALTER TABLE `payment_allocations` ADD `LocalId` longtext CHARACTER SET utf8mb4 NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260603232243_AddLocalIdToPaymentAllocation', '9.0.10');

ALTER TABLE `payment_allocations` ADD `CreatedAt` date NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260604081401_AddCreatedAtToPaymentAllocation', '9.0.10');


                SET @dbname = DATABASE();
                SET @has_snake = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                                  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'purchases' AND COLUMN_NAME = 'user_id');
                SET @has_pascal = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                                   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'purchases' AND COLUMN_NAME = 'UserId');
                SET @sql = IF(@has_snake > 0, 'SELECT 1',
                           IF(@has_pascal > 0,
                              'ALTER TABLE `purchases` CHANGE COLUMN `UserId` `user_id` INT NULL',
                              'ALTER TABLE `purchases` ADD COLUMN `user_id` INT NULL'));
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            


                SET @dbname = DATABASE();
                SET @has_snake = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                                  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'user_id');
                SET @has_pascal = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                                   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'UserId');
                SET @sql = IF(@has_snake > 0, 'SELECT 1',
                           IF(@has_pascal > 0,
                              'ALTER TABLE `orders` CHANGE COLUMN `UserId` `user_id` INT NULL',
                              'ALTER TABLE `orders` ADD COLUMN `user_id` INT NULL'));
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            


                UPDATE clients
                SET user_id = (SELECT MIN(id) FROM users)
                WHERE user_id IS NULL
                  AND EXISTS (SELECT 1 FROM users);
            


                UPDATE orders o
                INNER JOIN clients c ON c.id = o.client_id
                SET o.user_id = c.user_id
                WHERE o.user_id IS NULL AND c.user_id IS NOT NULL;
            


                UPDATE purchases p
                INNER JOIN clients c ON c.id = p.supplier_id
                SET p.user_id = c.user_id
                WHERE p.user_id IS NULL AND c.user_id IS NOT NULL;
            

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260608183646_AddUserIdToOrdersAndPurchases', '9.0.10');


                SET @dbname = DATABASE();
                SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'purchases' AND COLUMN_NAME = 'UserId');
                SET @sql = IF(@col > 0, 'ALTER TABLE `purchases` CHANGE COLUMN `UserId` `user_id` INT NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
            


                SET @dbname = DATABASE();
                SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                            WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'UserId');
                SET @sql = IF(@col > 0, 'ALTER TABLE `orders` CHANGE COLUMN `UserId` `user_id` INT NULL', 'SELECT 1');
                PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
            

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260608185146_SyncUserIdColumnMapping', '9.0.10');

DROP VIEW IF EXISTS v_client_balance;


CREATE VIEW v_client_balance AS
SELECT
    c.id AS client_id,
    c.name,
    COALESCE(c.opening_balance, 0)
    + COALESCE(t.order_total, 0)
    - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS order_total
    FROM transactions
    WHERE trans_category_id = 1
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 1
      AND is_reversed = 0
      AND original_payment_id IS NULL
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 1

UNION ALL

SELECT
    c.id,
    c.name,
    COALESCE(c.opening_balance, 0)
    + COALESCE(t.purchase_total, 0)
    - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS purchase_total
    FROM transactions
    WHERE trans_category_id = 2
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 2
      AND is_reversed = 0
      AND original_payment_id IS NULL
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 2;


INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260608192927_FixVClientBalanceIncludeOpeningBalance', '9.0.10');

CREATE TABLE `notifications` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `type` longtext CHARACTER SET utf8mb4 NOT NULL,
    `title` longtext CHARACTER SET utf8mb4 NOT NULL,
    `body` longtext CHARACTER SET utf8mb4 NOT NULL,
    `entity_id` int NULL,
    `is_read` tinyint(1) NOT NULL,
    `created_at` date NOT NULL,
    CONSTRAINT `notifications_pkey` PRIMARY KEY (`id`),
    CONSTRAINT `FK_notifications_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4;

CREATE INDEX `IX_notifications_is_read` ON `notifications` (`is_read`);

CREATE INDEX `IX_notifications_user_id` ON `notifications` (`user_id`);

CREATE INDEX `IX_notifications_user_is_read` ON `notifications` (`user_id`, `is_read`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260609213750_AddNotificationsTable', '9.0.10');

ALTER TABLE `transactions` DROP COLUMN `LocalId`;

ALTER TABLE `transactions` DROP COLUMN `UpdatedAt`;

ALTER TABLE `transactions` DROP COLUMN `Version`;

ALTER TABLE `stock_movements` DROP COLUMN `LocalId`;

ALTER TABLE `stock_movements` DROP COLUMN `UpdatedAt`;

ALTER TABLE `stock_movements` DROP COLUMN `Version`;

ALTER TABLE `purchases` DROP COLUMN `LocalId`;

ALTER TABLE `purchases` DROP COLUMN `UpdatedAt`;

ALTER TABLE `purchases` DROP COLUMN `Version`;

ALTER TABLE `purchase_lines` DROP COLUMN `UpdatedAt`;

ALTER TABLE `purchase_lines` DROP COLUMN `Version`;

ALTER TABLE `products` DROP COLUMN `LocalId`;

ALTER TABLE `products` DROP COLUMN `UpdatedAt`;

ALTER TABLE `products` DROP COLUMN `Version`;

ALTER TABLE `payments` DROP COLUMN `LocalId`;

ALTER TABLE `payments` DROP COLUMN `UpdatedAt`;

ALTER TABLE `payments` DROP COLUMN `Version`;

ALTER TABLE `payment_allocations` DROP COLUMN `LocalId`;

ALTER TABLE `payment_allocations` DROP COLUMN `UpdatedAt`;

ALTER TABLE `payment_allocations` DROP COLUMN `Version`;

ALTER TABLE `orders` DROP COLUMN `LocalId`;

ALTER TABLE `orders` DROP COLUMN `UpdatedAt`;

ALTER TABLE `orders` DROP COLUMN `Version`;

ALTER TABLE `order_lines` DROP COLUMN `UpdatedAt`;

ALTER TABLE `order_lines` DROP COLUMN `Version`;

ALTER TABLE `invoices` DROP COLUMN `LocalId`;

ALTER TABLE `invoices` DROP COLUMN `UpdatedAt`;

ALTER TABLE `invoices` DROP COLUMN `Version`;

ALTER TABLE `invoice_lines` DROP COLUMN `UpdatedAt`;

ALTER TABLE `invoice_lines` DROP COLUMN `Version`;

ALTER TABLE `expenses` DROP COLUMN `LocalId`;

ALTER TABLE `expenses` DROP COLUMN `UpdatedAt`;

ALTER TABLE `expenses` DROP COLUMN `Version`;

ALTER TABLE `clients` DROP COLUMN `LocalId`;

ALTER TABLE `clients` DROP COLUMN `UpdatedAt`;

ALTER TABLE `clients` DROP COLUMN `Version`;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260609225747_RemoveOfflineSyncColumns', '9.0.10');

ALTER TABLE `notifications` MODIFY COLUMN `created_at` datetime(6) NOT NULL;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260610083309_NotificationCreatedAtToDateTime', '9.0.10');

UPDATE notifications SET created_at = DATE_ADD(created_at, INTERVAL 5 HOUR)

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260610091148_NotificationCreatedAtLocalTime', '9.0.10');

UPDATE notifications SET created_at = DATE_SUB(created_at, INTERVAL 5 HOUR)

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260610093649_NotificationCreatedAtStoreUtc', '9.0.10');

CREATE TABLE `units` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` longtext CHARACTER SET utf8mb4 NULL,
    `created_at` date NULL,
    CONSTRAINT `units_pkey` PRIMARY KEY (`id`)
) CHARACTER SET=utf8mb4;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260614032924_AddUnitsLookup', '9.0.10');

UPDATE purchase_statuses SET name = 'Received' WHERE id = 3;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260627201449_RenamePurchaseStatusDeliveredToReceived', '9.0.10');

ALTER TABLE `stock_movements` ADD `AverageDimensionOverride` int NULL;


                UPDATE stock_movements
                SET AverageDimensionOverride = 1
                WHERE movement_source_id = 3 AND movement_type_id = 2;


                UPDATE stock_movements
                SET AverageDimensionOverride = 2
                WHERE movement_source_id = 3 AND movement_type_id = 1;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260628215908_AddStockMovementDimensionOverride', '9.0.10');


                UPDATE stock_movements
                SET AverageDimensionOverride = 1
                WHERE movement_source_id = 3 AND movement_type_id = 2;


                UPDATE stock_movements
                SET AverageDimensionOverride = 2
                WHERE movement_source_id = 3 AND movement_type_id = 1;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260628220600_BackfillStockMovementDimensionOverride', '9.0.10');

ALTER TABLE `products` ADD `unit_id` int NULL;

UPDATE products SET unit_id = 1 WHERE LOWER(unit) IN ('m','metre','meter','metres','meters')

UPDATE products SET unit_id = 2 WHERE LOWER(unit) IN ('kg','kilogram','kilograms','kgs')

UPDATE products SET unit_id = 3 WHERE LOWER(unit) IN ('pcs','piece','pieces','pc')

UPDATE products SET unit_id = 4 WHERE LOWER(unit) IN ('yard','yards','yd','yds')

UPDATE products SET unit_id = 5 WHERE LOWER(unit) IN ('roll','rolls')

UPDATE products SET unit_id = 6 WHERE LOWER(unit) IN ('bale','bales')

UPDATE products SET unit_id = 7 WHERE LOWER(unit) IN ('cone','cones')

UPDATE products SET unit_id = 1 WHERE unit_id IS NULL

ALTER TABLE `products` MODIFY COLUMN `unit_id` int NOT NULL;

CREATE INDEX `IX_products_unit_id` ON `products` (`unit_id`);

ALTER TABLE `products` ADD CONSTRAINT `FK_products_units_unit_id` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT;

ALTER TABLE `products` DROP COLUMN `unit`;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260630132000_WireProductUnitForeignKey', '9.0.10');


INSERT INTO trans_categories (id, name, created_at)
VALUES (9, 'Opening Balance', CURDATE())
ON DUPLICATE KEY UPDATE name = name;



INSERT INTO transactions (client_id, trans_type_id, trans_mode_id, trans_category_id, amount, trans_date, notes, created_at)
SELECT
    c.id,
    CASE WHEN c.client_type_id = 1 THEN 2 ELSE 1 END,
    3,
    9,
    c.opening_balance,
    COALESCE(c.created_at, CURDATE()),
    CONCAT('Backfilled opening balance — Client #', c.id),
    CURDATE()
FROM clients c
WHERE c.opening_balance IS NOT NULL
  AND c.opening_balance <> 0
  AND NOT EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.client_id = c.id AND t.trans_category_id = 9
  );


DROP VIEW IF EXISTS v_client_balance;


CREATE VIEW v_client_balance AS
SELECT
    c.id AS client_id,
    c.name,
    COALESCE(ob.opening_balance_total, 0)
    + COALESCE(t.order_total, 0)
    - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS opening_balance_total
    FROM transactions
    WHERE trans_category_id = 9
    GROUP BY client_id
) ob ON ob.client_id = c.id
LEFT JOIN (
    SELECT client_id, SUM(amount) AS order_total
    FROM transactions
    WHERE trans_category_id = 1
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 1
      AND is_reversed = 0
      AND original_payment_id IS NULL
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 1

UNION ALL

SELECT
    c.id,
    c.name,
    COALESCE(ob.opening_balance_total, 0)
    + COALESCE(t.purchase_total, 0)
    - COALESCE(p.paid_total, 0) AS balance
FROM clients c
LEFT JOIN (
    SELECT client_id, SUM(amount) AS opening_balance_total
    FROM transactions
    WHERE trans_category_id = 9
    GROUP BY client_id
) ob ON ob.client_id = c.id
LEFT JOIN (
    SELECT client_id, SUM(amount) AS purchase_total
    FROM transactions
    WHERE trans_category_id = 2
    GROUP BY client_id
) t ON t.client_id = c.id
LEFT JOIN (
    SELECT party_client_id, SUM(amount) AS paid_total
    FROM payments
    WHERE payment_direction_id = 2
      AND is_reversed = 0
      AND original_payment_id IS NULL
    GROUP BY party_client_id
) p ON p.party_client_id = c.id
WHERE c.client_type_id = 2;


INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260705030846_AddOpeningBalanceLedgerCategory', '9.0.10');

ALTER TABLE `transactions` ADD `trans_date_hijri` varchar(10) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `stock_movements` ADD `movement_date_hijri` varchar(10) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `purchases` ADD `purchase_date_hijri` varchar(10) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `payments` ADD `payment_date_hijri` varchar(10) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `orders` ADD `order_date_hijri` varchar(10) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `invoices` ADD `due_date_hijri` varchar(10) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `invoices` ADD `issue_date_hijri` varchar(10) CHARACTER SET utf8mb4 NULL;

ALTER TABLE `expenses` ADD `expense_date_hijri` varchar(10) CHARACTER SET utf8mb4 NULL;

CREATE TABLE `SystemSettings` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `HijriOffsetDays` int NOT NULL,
    `LastHijriReminderSentDate` date NULL,
    CONSTRAINT `PK_SystemSettings` PRIMARY KEY (`Id`)
) CHARACTER SET=utf8mb4;

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260721121441_AddHijriCalendarSupport', '9.0.10');


                CREATE VIEW v_monthly_profit_loss_hijri AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY hijri_month) AS id,
                    hijri_month,
                    total_sales,
                    total_purchases,
                    total_expenses,
                    (total_sales - total_purchases) AS gross_profit,
                    (total_sales - total_purchases - total_expenses) AS net_profit
                FROM (
                    SELECT
                        SUBSTRING(t.trans_date_hijri, 1, 7) AS hijri_month,
                        SUM(CASE WHEN t.trans_category_id = 1 THEN t.amount ELSE 0 END) AS total_sales,
                        SUM(CASE WHEN t.trans_category_id = 2 THEN t.amount ELSE 0 END) AS total_purchases,
                        SUM(CASE WHEN t.trans_category_id IN (3, 4) THEN t.amount ELSE 0 END) AS total_expenses
                    FROM transactions t
                    WHERE t.trans_date_hijri IS NOT NULL
                    GROUP BY SUBSTRING(t.trans_date_hijri, 1, 7)
                ) x;
            


                CREATE VIEW v_monthly_credit_debit_hijri AS
                SELECT
                    ROW_NUMBER() OVER (ORDER BY hijri_month) AS id,
                    hijri_month,
                    total_credit,
                    total_debit,
                    (total_credit - total_debit) AS balance
                FROM (
                    SELECT
                        SUBSTRING(t.trans_date_hijri, 1, 7) AS hijri_month,
                        SUM(CASE WHEN t.trans_type_id = 2 THEN t.amount ELSE 0 END) AS total_credit,
                        SUM(CASE WHEN t.trans_type_id = 1 THEN t.amount ELSE 0 END) AS total_debit
                    FROM transactions t
                    WHERE t.trans_category_id IN (5, 6, 7, 8) AND t.trans_date_hijri IS NOT NULL
                    GROUP BY SUBSTRING(t.trans_date_hijri, 1, 7)
                ) x;
            

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260721201653_AddHijriMonthlyReportingViews', '9.0.10');

COMMIT;


