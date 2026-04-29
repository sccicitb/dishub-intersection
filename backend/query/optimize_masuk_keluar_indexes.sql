-- Run on MySQL to accelerate masuk-keluar and group type aggregations.
-- Execute once per environment.

ALTER TABLE arus
	ADD INDEX idx_arus_waktu_simpang_arah (waktu, ID_Simpang, ke_arah);

ALTER TABLE arus
	ADD INDEX idx_arus_simpang_waktu (ID_Simpang, waktu);
