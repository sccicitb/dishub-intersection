const db = require('./app/config/db');

async function testAggregation() {
  try {
    console.log('Testing aggregation for date: 2026-01-29\n');
    
    // Get total IN (ke_arah) per direction
    const [inRows] = await db.execute(`
      SELECT ke_arah as arah, SUM(SM) as SM, SUM(MP) as MP 
      FROM arus 
      WHERE DATE(waktu) = ? AND ke_arah IN ('north','south','east','west')
      GROUP BY ke_arah
    `, ['2026-01-29']);
    
    console.log('IN per arah (ke_arah):');
    console.log(JSON.stringify(inRows, null, 2));
    
    const totalIN_SM = inRows.reduce((sum, row) => sum + parseInt(row.SM), 0);
    const totalIN_MP = inRows.reduce((sum, row) => sum + parseInt(row.MP), 0);
    console.log(`\nTotal IN - SM: ${totalIN_SM}, MP: ${totalIN_MP}\n`);
    
    // Get total OUT (dari_arah) per direction
    const [outRows] = await db.execute(`
      SELECT dari_arah as arah, SUM(SM) as SM, SUM(MP) as MP 
      FROM arus 
      WHERE DATE(waktu) = ? AND dari_arah IN ('north','south','east','west')
      GROUP BY dari_arah
    `, ['2026-01-29']);
    
    console.log('OUT per arah (dari_arah):');
    console.log(JSON.stringify(outRows, null, 2));
    
    const totalOUT_SM = outRows.reduce((sum, row) => sum + parseInt(row.SM), 0);
    const totalOUT_MP = outRows.reduce((sum, row) => sum + parseInt(row.MP), 0);
    console.log(`\nTotal OUT - SM: ${totalOUT_SM}, MP: ${totalOUT_MP}\n`);
    
    console.log('Conclusion:');
    console.log(`SM: IN (${totalIN_SM}) ${totalIN_SM === totalOUT_SM ? '=' : '≠'} OUT (${totalOUT_SM})`);
    console.log(`MP: IN (${totalIN_MP}) ${totalIN_MP === totalOUT_MP ? '=' : '≠'} OUT (${totalOUT_MP})`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAggregation();
