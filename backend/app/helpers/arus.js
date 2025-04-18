
function getArusStatus(simpang, dari_arah, ke_arah) {
    const s = simpang?.toLowerCase();
    const dari = dari_arah?.toLowerCase();
    const ke = ke_arah?.toLowerCase();
  
    if (s === 'tempel') {
      if (dari === 'utara') return 'IN';
      if (ke === 'utara' && ['barat', 'selatan', 'timur'].includes(dari)) return 'OUT';
    }
  
    if (s === 'prambanan') {
      if (dari === 'timur') return 'IN';
      if (ke === 'timur' && ['barat', 'selatan', 'utara'].includes(dari)) return 'OUT';
    }
  
    if (s === 'piyungan') {
      if (dari === 'timur') return 'IN';
      if (ke === 'timur' && ['barat', 'selatan', 'utara'].includes(dari)) return 'OUT';
    }
  
    if (s === 'glagah') {
      if (dari === 'barat') return 'IN';
      if (ke === 'barat' && ['timur', 'selatan', 'utara'].includes(dari)) return 'OUT';
    }
  
    return 'UNDEFINED';
  }
  
  function countArus(data, simpangMap) {
    let totalIN = 0;
    let totalOUT = 0;
  
    data.forEach((item) => {
      const simpang = simpangMap[item.ID_Simpang]?.toLowerCase();
      const status = getArusStatus(simpang, item.dari_arah, item.ke_arah);
  
      if (status === 'IN') totalIN++;
      if (status === 'OUT') totalOUT++;
    });
  
    return { totalIN, totalOUT };
  }
  
  module.exports = {
    getArusStatus,
    countArus
  };
  