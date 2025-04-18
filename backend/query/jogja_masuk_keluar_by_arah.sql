SELECT arah, SUM(total_IN) AS total_IN, SUM(total_OUT) AS total_OUT
FROM (
  -- IN berdasarkan aturan logika
  SELECT
    CASE
      WHEN ID_Simpang = 5 AND dari_arah = 'north' THEN 'north'
      WHEN ID_Simpang = 2 AND dari_arah = 'east' THEN 'east'
      WHEN ID_Simpang = 4 AND dari_arah = 'east' THEN 'east'
      WHEN ID_Simpang = 3 AND dari_arah = 'west' THEN 'west'
    END AS arah,
    1 AS total_IN,
    0 AS total_OUT
  FROM arus
  WHERE DATE(waktu) = CURDATE()
    AND (
      (ID_Simpang = 5 AND dari_arah = 'north') OR
      (ID_Simpang = 2 AND dari_arah = 'east') OR
      (ID_Simpang = 4 AND dari_arah = 'east') OR
      (ID_Simpang = 3 AND dari_arah = 'west')
    )

  UNION ALL

  -- OUT berdasarkan aturan logika
  SELECT
    CASE
      WHEN ID_Simpang = 5 AND ke_arah = 'north' THEN 'north'
      WHEN ID_Simpang = 2 AND ke_arah = 'east' THEN 'east'
      WHEN ID_Simpang = 4 AND ke_arah = 'east' THEN 'east'
      WHEN ID_Simpang = 3 AND ke_arah = 'west' THEN 'west'
    END AS arah,
    0 AS total_IN,
    1 AS total_OUT
  FROM arus
  WHERE DATE(waktu) = CURDATE()
    AND (
      (ID_Simpang = 5 AND ke_arah = 'north' AND dari_arah IN ('east', 'south', 'west')) OR
      (ID_Simpang = 2 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) OR
      (ID_Simpang = 4 AND ke_arah = 'east' AND dari_arah IN ('west', 'south', 'north')) OR
      (ID_Simpang = 3 AND ke_arah = 'west' AND dari_arah IN ('east', 'south', 'north'))
    )
) AS arah_rekap
GROUP BY arah;
