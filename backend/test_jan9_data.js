const db = require('./app/config/db');

async function testJan9Data() {
  try {
    console.log('Testing data for 2026-01-09, Simpang ID: 3, Time: 00:00-01:00\n');
    
    // Get raw data for that hour
    const [rows] = await db.execute(`
      SELECT dari_arah, ke_arah, SM, MP 
      FROM arus 
      WHERE ID_Simpang = 3 
        AND DATE(waktu) = '2026-01-09'
        AND HOUR(waktu) = 0
      LIMIT 20
    `);
    
    console.log('Sample rows (first 20):');
    console.log(JSON.stringify(rows, null, 2));
    
    // Count IN (ke_arah)
    const [inData] = await db.execute(`
      SELECT ke_arah, SUM(SM) as SM 
      FROM arus 
      WHERE ID_Simpang = 3 
        AND DATE(waktu) = '2026-01-09'
        AND HOUR(waktu) = 0
        AND ke_arah IN ('north', 'south', 'east', 'west')
      GROUP BY ke_arah
    `);
    
    console.log('\nIN per arah (ke_arah):');
    console.log(JSON.stringify(inData, null, 2));
    const totalIN = inData.reduce((sum, row) => sum + parseInt(row.SM), 0);
    console.log(`Total IN: ${totalIN}`);
    
    // Count OUT (dari_arah)
    const [outData] = await db.execute(`
      SELECT dari_arah, SUM(SM) as SM 
      FROM arus 
      WHERE ID_Simpang = 3 
        AND DATE(waktu) = '2026-01-09'
        AND HOUR(waktu) = 0
        AND dari_arah IN ('north', 'south', 'east', 'west')
      GROUP BY dari_arah
    `);
    
    console.log('\nOUT per arah (dari_arah):');
    console.log(JSON.stringify(outData, null, 2));
    const totalOUT = outData.reduce((sum, row) => sum + parseInt(row.SM), 0);
    console.log(`Total OUT: ${totalOUT}`);
    
    console.log('\n=== Verification ===');
    console.log(`Expected from user data: IN=74, OUT=289`);
    console.log(`Actual from database: IN=${totalIN}, OUT=${totalOUT}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testJan9Data();
