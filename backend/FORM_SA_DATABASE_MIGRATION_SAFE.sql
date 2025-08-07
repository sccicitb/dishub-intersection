-- Form SA Database Migration Script (SAFE VERSION)
-- This script creates all necessary tables for the Form SA features (SA-I through SA-V)
-- Uses 'sa_surveys' as main table to avoid conflicts with existing survey features
-- Based on the ERD design in FORM_SA_DATABASE_ERD.md

-- =====================================================
-- 1. MAIN SA_SURVEYS TABLE (Central table for all SA forms)
-- =====================================================

CREATE TABLE IF NOT EXISTS `sa_surveys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `simpang_id` bigint unsigned NOT NULL,
  `survey_type` enum('SA-I','SA-II','SA-III','SA-IV','SA-V') NULL COMMENT 'NULL for headers, enum value for form data',
  `tanggal` date NOT NULL,
  `perihal` text,
  `status` enum('draft','completed','approved') DEFAULT 'draft',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_simpang_id` (`simpang_id`),
  KEY `idx_survey_type` (`survey_type`),
  KEY `idx_status` (`status`),
  KEY `idx_tanggal` (`tanggal`),
  CONSTRAINT `fk_sa_surveys_simpang` FOREIGN KEY (`simpang_id`) REFERENCES `simpang` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. SA-I TABLES (Intersection Performance Analysis)
-- =====================================================

-- SA-I Pendekat Configuration
CREATE TABLE IF NOT EXISTS `sa_i_pendekat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `kode_pendekat` enum('U','S','T','B') NOT NULL COMMENT 'U=Utara/North, S=Selatan/South, T=Timur/East, B=Barat/West',
  `tipe_lingkungan_jalan` enum('KOM','KIM','AT') NOT NULL,
  `kelas_hambatan_samping` enum('T','S','R') NOT NULL COMMENT 'T=Tinggi/High, S=Sedang/Medium, R=Rendah/Low',
  `median` varchar(100) DEFAULT NULL,
  `kelandaian_pendekat` decimal(5,2) DEFAULT NULL COMMENT 'Percentage',
  `bkjt` boolean DEFAULT false COMMENT 'Belok Kiri Jalan Terus',
  `jarak_ke_kendaraan_parkir` decimal(5,2) DEFAULT NULL COMMENT 'Distance in meters',
  `lebar_awal_lajur` decimal(5,2) DEFAULT NULL COMMENT 'Lane width measurements',
  `lebar_garis_henti` decimal(5,2) DEFAULT NULL,
  `lebar_lajur_bki` decimal(5,2) DEFAULT NULL,
  `lebar_lajur_keluar` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_survey_pendekat` (`survey_id`, `kode_pendekat`),
  KEY `idx_survey_id` (`survey_id`),
  CONSTRAINT `fk_sa_i_pendekat_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SA-I Fase APIL Configuration
CREATE TABLE IF NOT EXISTS `sa_i_fase_apil` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `pendekatan` enum('U','S','T','B') NOT NULL,
  `tipe_pendekat_terlindung` boolean DEFAULT false,
  `tipe_pendekat_terlawan` boolean DEFAULT false,
  `arah_bki` boolean DEFAULT false COMMENT 'Belok Kiri',
  `arah_bkijt` boolean DEFAULT false COMMENT 'Belok Kiri Jalan Terus',
  `arah_lurus` boolean DEFAULT false,
  `arah_bka` boolean DEFAULT false COMMENT 'Belok Kanan',
  `pemisahan_lurus_bka` boolean DEFAULT false,
  `fase_1` boolean DEFAULT false,
  `fase_2` boolean DEFAULT false,
  `fase_3` boolean DEFAULT false,
  `fase_4` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_survey_fase` (`survey_id`, `pendekatan`),
  KEY `idx_survey_id` (`survey_id`),
  CONSTRAINT `fk_sa_i_fase_apil_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. SA-II TABLES (Vehicle Data by Movement Direction)
-- =====================================================

-- SA-II Vehicle Data
CREATE TABLE IF NOT EXISTS `sa_ii_vehicle_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `direction` enum('U','S','T','B') NOT NULL,
  `movement_type` enum('BKi','Lurus','BKa') NOT NULL,
  `vehicle_type` enum('MP','KS','SM') NOT NULL COMMENT 'MP=Mobil Penumpang, KS=Kendaraan Sedang, SM=Sepeda Motor',
  `count_terlindung` int(11) DEFAULT 0,
  `count_terlawan` int(11) DEFAULT 0,
  `smp_terlindung` decimal(10,2) DEFAULT 0.00 COMMENT 'Standard Motor Passenger equivalent',
  `smp_terlawan` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`),
  KEY `idx_direction` (`direction`),
  CONSTRAINT `fk_sa_ii_vehicle_data_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SA-II KTB Data (Non-motorized vehicles)
CREATE TABLE IF NOT EXISTS `sa_ii_ktb_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `direction` enum('U','S','T','B') NOT NULL,
  `ktb_count` int(11) DEFAULT 0 COMMENT 'Kendaraan Tak Bermotor count',
  `turn_ratio` decimal(5,3) DEFAULT 0.000 COMMENT 'Turn ratio calculations',
  `rktb_value` decimal(8,3) DEFAULT 0.000 COMMENT 'Rasio Kendaraan Tak Bermotor',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_survey_direction` (`survey_id`, `direction`),
  KEY `idx_survey_id` (`survey_id`),
  CONSTRAINT `fk_sa_ii_ktb_data_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EMP Configuration (Equivalent Motor Passenger multipliers)
CREATE TABLE IF NOT EXISTS `emp_configurations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehicle_type` enum('MP','KS','SM') NOT NULL,
  `condition_type` enum('terlindung','terlawan') NOT NULL,
  `emp_value` decimal(3,2) NOT NULL DEFAULT 1.00,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_emp_config` (`vehicle_type`, `condition_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. SA-III TABLES (Intersection Sketch)
-- =====================================================

-- SA-III Phase Data
CREATE TABLE IF NOT EXISTS `sa_iii_phase_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `fase_number` int(11) NOT NULL,
  `kode_pendekat` enum('U','S','T','B') NOT NULL,
  `jarak_type` enum('lintasanBerangkat','panjangBerangkat','lintasanDatang','lintasanPejalan') NOT NULL,
  `pendekat_u` decimal(8,2) DEFAULT 0.00,
  `pendekat_s` decimal(8,2) DEFAULT 0.00,
  `pendekat_t` decimal(8,2) DEFAULT 0.00,
  `pendekat_b` decimal(8,2) DEFAULT 0.00,
  `kecepatan_berangkat` decimal(8,2) DEFAULT 0.00,
  `kecepatan_datang` decimal(8,2) DEFAULT 0.00,
  `kecepatan_pejalan_kaki` decimal(8,2) DEFAULT 0.00,
  `waktu_tempuh` decimal(8,2) DEFAULT 0.00,
  `w_ms` decimal(8,2) DEFAULT 0.00,
  `w_ms_disesuaikan` decimal(8,2) DEFAULT 0.00,
  `w_k` int(11) DEFAULT 0,
  `w_ah` int(11) DEFAULT 0,
  `w_hh` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`),
  KEY `idx_fase_number` (`fase_number`),
  CONSTRAINT `fk_sa_iii_phase_data_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SA-III Measurements (from map ruler tool)
CREATE TABLE IF NOT EXISTS `sa_iii_measurements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `measurement_label` varchar(50) DEFAULT NULL,
  `start_longitude` decimal(10,8) DEFAULT NULL,
  `start_latitude` decimal(10,8) DEFAULT NULL,
  `end_longitude` decimal(10,8) DEFAULT NULL,
  `end_latitude` decimal(10,8) DEFAULT NULL,
  `distance_meters` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`),
  CONSTRAINT `fk_sa_iii_measurements_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. SA-IV TABLES (Saturated Flow and Capacity Analysis)
-- =====================================================

-- SA-IV Capacity Analysis
CREATE TABLE IF NOT EXISTS `sa_iv_capacity_analysis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `kode_pendekat` enum('U','S','T','B') NOT NULL,
  `tipe_pendekat` enum('P','O','P/O') DEFAULT NULL COMMENT 'P=Protected, O=Opposed, P/O=Mixed',
  `rasio_kendaraan_belok` json DEFAULT NULL COMMENT 'Turn ratio data as JSON',
  `arus_belok_kanan` json DEFAULT NULL COMMENT 'Right turn flow data as JSON',
  `lebar_efektif` decimal(8,2) DEFAULT 0.00 COMMENT 'Effective width in meters',
  `arus_jenuh_dasar` decimal(10,2) DEFAULT 0.00,
  `faktor_penyesuaian` json DEFAULT NULL COMMENT 'Adjustment factors as JSON',
  `arus_jenuh_disesuaikan` decimal(10,2) DEFAULT 0.00 COMMENT 'Adjusted saturated flow',
  `arus_lalu_lintas` decimal(10,2) DEFAULT 0.00 COMMENT 'Traffic flow (SMP/jam)',
  `rasio_arus` decimal(8,3) DEFAULT 0.000 COMMENT 'Flow ratio',
  `rasio_fase` decimal(8,3) DEFAULT 0.000 COMMENT 'Phase ratio',
  `waktu_hijau_per_fase` int(11) DEFAULT 0 COMMENT 'Green time per phase (seconds)',
  `kapasitas` decimal(10,2) DEFAULT 0.00,
  `derajat_kejenuhan` decimal(8,3) DEFAULT 0.000,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_survey_pendekat` (`survey_id`, `kode_pendekat`),
  KEY `idx_survey_id` (`survey_id`),
  CONSTRAINT `fk_sa_iv_capacity_analysis_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SA-IV Phase Analysis
CREATE TABLE IF NOT EXISTS `sa_iv_phase_analysis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `kode_pendekat` enum('U','S','T','B') NOT NULL,
  `tipe_pendekat` enum('P','O','P/O') DEFAULT NULL COMMENT 'P=Protected, O=Opposed, P/O=Mixed',
  `arah` varchar(50) DEFAULT NULL COMMENT 'Direction description',
  `pemisahan_lurus_rka` boolean DEFAULT false COMMENT 'Separation of straight and right turn',
  `phases` json DEFAULT NULL COMMENT 'F1-F4 timing data as JSON',
  `whi_total` int(11) DEFAULT 0 COMMENT 'Total green time',
  `cycle_time` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_survey_pendekat` (`survey_id`, `kode_pendekat`),
  KEY `idx_survey_id` (`survey_id`),
  CONSTRAINT `fk_sa_iv_phase_analysis_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SA-IV Calculation Configuration
CREATE TABLE IF NOT EXISTS `sa_iv_calculation_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `simpang_id` bigint unsigned NOT NULL,
  `adjustment_factors` json DEFAULT NULL COMMENT 'Traffic engineering factors as JSON',
  `calculation_rules` json DEFAULT NULL COMMENT 'Mathematical rules as JSON',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_simpang_config` (`simpang_id`),
  KEY `idx_simpang_id` (`simpang_id`),
  CONSTRAINT `fk_sa_iv_calculation_config_simpang` FOREIGN KEY (`simpang_id`) REFERENCES `simpang` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. SA-V TABLES (Delay and Performance Analysis)
-- =====================================================

-- SA-V Delay Analysis
CREATE TABLE IF NOT EXISTS `sa_v_delay_analysis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `kode_pendekat` enum('U','S','T','B','BKIJT') NOT NULL,
  `arus_lalu_lintas` decimal(10,2) DEFAULT 0.00 COMMENT 'Traffic flow (SMP/jam)',
  `kapasitas` decimal(10,2) DEFAULT 0.00 COMMENT 'Capacity (SMP/jam)',
  `derajat_kejenuhan` decimal(8,3) DEFAULT 0.000 COMMENT 'Degree of saturation',
  `rasio_hijau` decimal(8,3) DEFAULT 0.000 COMMENT 'Green ratio',
  `nq1` decimal(8,3) DEFAULT 0.000 COMMENT 'Initial queue (SMP)',
  `nq2` decimal(8,3) DEFAULT 0.000 COMMENT 'Final queue (SMP)',
  `nq` int(11) DEFAULT 0 COMMENT 'Total queue (SMP)',
  `nq_max` int(11) DEFAULT 0 COMMENT 'Maximum queue (SMP)',
  `panjang_antrian` decimal(8,2) DEFAULT 0.00 COMMENT 'Queue length (m)',
  `rasio_kendaraan_terhenti` decimal(8,3) DEFAULT 0.000 COMMENT 'Stopped vehicle ratio',
  `jumlah_kendaraan_terhenti` int(11) DEFAULT 0 COMMENT 'Number of stopped vehicles',
  `tundaan_lalu_lintas` decimal(8,2) DEFAULT 0.00 COMMENT 'Traffic delay (seconds)',
  `tundaan_geometri` decimal(8,2) DEFAULT 0.00 COMMENT 'Geometric delay (seconds)',
  `tundaan_rata_rata` decimal(8,2) DEFAULT 0.00 COMMENT 'Total delay (seconds)',
  `tundaan_total` decimal(12,2) DEFAULT 0.00 COMMENT 'Total delay (SMP.seconds)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_survey_id` (`survey_id`),
  CONSTRAINT `fk_sa_v_delay_analysis_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SA-V Performance Summary
CREATE TABLE IF NOT EXISTS `sa_v_performance_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_id` int(11) NOT NULL,
  `total_kendaraan_terhenti` int(11) DEFAULT 0 COMMENT 'Total stopped vehicles',
  `rasio_kendaraan_terhenti_rata` decimal(8,3) DEFAULT 0.000 COMMENT 'Average stopped vehicle ratio',
  `total_tundaan` decimal(15,2) DEFAULT 0.00 COMMENT 'Total delay',
  `tundaan_simpang_rata` decimal(8,2) DEFAULT 0.00 COMMENT 'Average intersection delay (seconds/SMP)',
  `level_of_service` varchar(2) DEFAULT NULL COMMENT 'Performance level A-F',
  `performance_evaluation` text DEFAULT NULL COMMENT 'Performance evaluation text',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_survey_summary` (`survey_id`),
  KEY `idx_survey_id` (`survey_id`),
  CONSTRAINT `fk_sa_v_performance_summary_survey` FOREIGN KEY (`survey_id`) REFERENCES `sa_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. INSERT DEFAULT EMP CONFIGURATIONS
-- =====================================================

-- Insert default EMP values for different vehicle types and conditions
INSERT INTO `emp_configurations` (`vehicle_type`, `condition_type`, `emp_value`, `is_active`) VALUES
-- Terlindung (Protected) conditions
('MP', 'terlindung', 1.00, true),
('KS', 'terlindung', 1.30, true),
('SM', 'terlindung', 1.50, true),
-- Terlawan (Opposed) conditions  
('MP', 'terlawan', 1.00, true),
('KS', 'terlawan', 1.50, true),
('SM', 'terlawan', 1.80, true)
ON DUPLICATE KEY UPDATE `emp_value` = VALUES(`emp_value`);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration creates all necessary tables for Form SA features
-- Total tables created: 12 (sa_surveys + 11 SA-specific tables)
-- All tables include proper foreign key constraints and indexes for performance
-- SAFE: Uses 'sa_surveys' instead of 'surveys' to avoid conflicts with existing features 