-- ============================================================
-- PH Transport Wait Times - Database Schema
-- Database: ph_transport_waits
-- Engine: MariaDB 10.4+ / MySQL 5.7+
-- ============================================================

CREATE DATABASE IF NOT EXISTS `ph_transport_waits`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ph_transport_waits`;

-- ------------------------------------------------------------
-- Transport Types (lookup table)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transport_types` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `slug`        VARCHAR(30)   NOT NULL UNIQUE,
  `label`       VARCHAR(60)   NOT NULL,
  `icon`        VARCHAR(60)   DEFAULT NULL,
  `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Routes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `routes` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `route_code`        VARCHAR(40)   NOT NULL UNIQUE,
  `transport_type_id` INT UNSIGNED  NOT NULL,
  `route_name`        VARCHAR(120)  NOT NULL,
  `origin`            VARCHAR(120)  NOT NULL,
  `destination`       VARCHAR(120)  NOT NULL,
  `estimated_fare`    DECIMAL(8,2)  DEFAULT NULL,
  `estimated_duration_minutes` INT  DEFAULT NULL,
  `is_active`         TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_transport_type` (`transport_type_id`),
  INDEX `idx_origin` (`origin`),
  INDEX `idx_destination` (`destination`),
  FULLTEXT INDEX `ft_route_search` (`route_name`, `origin`, `destination`),
  CONSTRAINT `fk_route_transport`
    FOREIGN KEY (`transport_type_id`) REFERENCES `transport_types`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Waiting Times (live / periodically updated data)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `waiting_times` (
  `id`                     INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `route_id`               INT UNSIGNED  NOT NULL,
  `estimated_wait_minutes` INT           NOT NULL DEFAULT 0,
  `status`                 ENUM('normal','moderate','delayed','very-delayed')
                                         NOT NULL DEFAULT 'normal',
  `passenger_count`        INT           DEFAULT NULL,
  `notes`                  VARCHAR(255)  DEFAULT NULL,
  `is_demo`                TINYINT(1)    NOT NULL DEFAULT 0,
  `recorded_at`            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_route` (`route_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_recorded` (`recorded_at`),
  CONSTRAINT `fk_waiting_route`
    FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Commuter Reports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reports` (
  `id`                  INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `commuter_name`       VARCHAR(100)  DEFAULT NULL,
  `transport_type`      VARCHAR(30)   NOT NULL,
  `route_name`          VARCHAR(120)  NOT NULL,
  `location`            VARCHAR(200)  NOT NULL,
  `waiting_minutes`     INT           NOT NULL,
  `report_description`  TEXT          DEFAULT NULL,
  `status`              ENUM('pending','reviewed','resolved','spam')
                                      NOT NULL DEFAULT 'pending',
  `ip_address`          VARCHAR(45)   DEFAULT NULL,
  `created_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_transport` (`transport_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Stats / Aggregated Metrics (for hero section stats)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stats` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `stat_key`        VARCHAR(60)   NOT NULL UNIQUE,
  `stat_value`      VARCHAR(120)  NOT NULL,
  `stat_label`      VARCHAR(120)  NOT NULL,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
