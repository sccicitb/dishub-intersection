DELIMITER $$

CREATE PROCEDURE jogja_get_masuk_keluar_summary(
    IN mode_filter VARCHAR(20) -- 'harian', 'bulanan', 'tahunan'
)
BEGIN
    SELECT
        SUM(
            CASE
                WHEN (ID_Simpang = 5 AND dari_arah = 'north') THEN 1
                WHEN (ID_Simpang = 2 AND dari_arah = 'east') THEN 1
                WHEN (ID_Simpang = 4 AND dari_arah = 'east') THEN 1
                WHEN (ID_Simpang = 3 AND dari_arah = 'west') THEN 1
                ELSE 0
            END
        ) AS total_IN,

        SUM(
            CASE
                WHEN (ID_Simpang = 5 AND ke_arah = 'north' AND dari_arah IN ('east', 'south', 'west')) THEN 1
                WHEN (ID_Simpang = 2 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
                WHEN (ID_Simpang = 4 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) THEN 1
                WHEN (ID_Simpang = 3 AND ke_arah = 'west' AND dari_arah IN ('east', 'south', 'north')) THEN 1
                ELSE 0
            END
        ) AS total_OUT
    FROM arus
    WHERE
        (mode_filter = 'harian' AND DATE(waktu) = CURDATE())
        OR (mode_filter = 'bulanan' AND MONTH(waktu) = MONTH(CURDATE()) AND YEAR(waktu) = YEAR(CURDATE()))
        OR (mode_filter = 'tahunan' AND YEAR(waktu) = YEAR(CURDATE()));
END$$

DELIMITER ;
