const dbMain = require('../config/db.js');

exports.getFlowHistory = async (req, res) => {
  try {
    const { simpang, date, limit = 100, page = 1 } = req.query;
    
    let query = `
      SELECT 
        ID_Simpang, 
        tipe_pendekat, 
        dari_arah, 
        ke_arah,
        SM, MP, AUP, TR, BS, TS, TB, BB, GANDENG, KTB,
        waktu,
        created_at,
        source,
        topic
      FROM arus_copy 
      WHERE 1=1
    `;
    
    const params = [];
    const countParams = [];

    if (simpang && simpang !== 'ALL') {
      query += ' AND ID_Simpang = ?';
      params.push(simpang);
    }

    if (date) {
      query += ' AND DATE(waktu) = ?';
      params.push(date);
    }

    query += ' ORDER BY waktu DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    // Count total for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM arus_copy WHERE 1=1';
    if (simpang && simpang !== 'ALL') {
      countQuery += ' AND ID_Simpang = ?';
      countParams.push(simpang);
    }
    if (date) {
      countQuery += ' AND DATE(waktu) = ?';
      countParams.push(date);
    }
    
    const countResult = await dbMain.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    const [rows] = await dbMain.query(query, params);
    
    // Format vehicles total
    const formattedResults = rows.map(row => ({
      ...row,
      total_vehicles: (row.SM || 0) + (row.MP || 0) + (row.AUP || 0) + (row.TR || 0) + 
                     (row.BS || 0) + (row.TS || 0) + (row.TB || 0) + (row.BB || 0) + 
                     (row.GANDENG || 0) + (row.KTB || 0),
      direction: `${row.dari_arah || ''} → ${row.ke_arah || ''}`
    }));

    res.json({
      success: true,
      results: formattedResults,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Flow history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

