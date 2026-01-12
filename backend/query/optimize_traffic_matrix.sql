-- ✅ OPTIMIZATION: Add indexes to improve traffic matrix query performance
-- Run this once to create indexes that will help the batch query execute faster

-- Index 1: Most important - for waktu range queries
-- This helps with WHERE waktu BETWEEN ? AND ?
CREATE INDEX idx_arus_waktu ON arus(waktu);

-- Index 2: For simpang filtering
-- This helps with WHERE ID_Simpang = ?
CREATE INDEX idx_arus_simpang ON arus(ID_Simpang);

-- Index 3: Composite index for fastest performance
-- This combines both waktu and ID_Simpang for optimal query planning
CREATE INDEX idx_arus_waktu_simpang ON arus(waktu, ID_Simpang);

-- Index 4: For dari_arah and ke_arah grouping
CREATE INDEX idx_arus_direction ON arus(dari_arah, ke_arah);

-- Verify indexes were created
SHOW INDEX FROM arus;
