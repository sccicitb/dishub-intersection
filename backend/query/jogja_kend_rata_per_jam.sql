SELECT
  HOUR(CONVERT_TZ(waktu, '+00:00', '+07:00')) AS jam,

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
WHERE DATE(CONVERT_TZ(waktu, '+00:00', '+07:00')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+07:00'))
GROUP BY jam
ORDER BY jam;
