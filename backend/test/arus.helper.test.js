const { getArusStatus, countArus, getPeriodsAndSlots } = require('../app/helpers/arus');

describe('getArusStatus', () => {
  it('should return IN for Tempel dari utara', () => {
    expect(getArusStatus('tempel', 'utara', 'selatan')).toBe('IN');
  });

  it('should return OUT for Tempel ke utara dari barat', () => {
    expect(getArusStatus('tempel', 'barat', 'utara')).toBe('OUT');
  });

  it('should return OUT for Tempel ke utara dari selatan', () => {
    expect(getArusStatus('tempel', 'selatan', 'utara')).toBe('OUT');
  });

  it('should return OUT for Tempel ke utara dari timur', () => {
    expect(getArusStatus('tempel', 'timur', 'utara')).toBe('OUT');
  });

  it('should return IN for Prambanan dari timur', () => {
    expect(getArusStatus('prambanan', 'timur', 'utara')).toBe('IN');
  });

  it('should return OUT for Prambanan ke timur dari barat', () => {
    expect(getArusStatus('prambanan', 'barat', 'timur')).toBe('OUT');
  });

  it('should return OUT for Prambanan ke timur dari selatan', () => {
    expect(getArusStatus('prambanan', 'selatan', 'timur')).toBe('OUT');
  });

  it('should return OUT for Prambanan ke timur dari utara', () => {
    expect(getArusStatus('prambanan', 'utara', 'timur')).toBe('OUT');
  });

  it('should return IN for Piyungan dari timur', () => {
    expect(getArusStatus('piyungan', 'timur', 'selatan')).toBe('IN');
  });

  it('should return OUT for Piyungan ke timur dari barat', () => {
    expect(getArusStatus('piyungan', 'barat', 'timur')).toBe('OUT');
  });

  it('should return OUT for Piyungan ke timur dari selatan', () => {
    expect(getArusStatus('piyungan', 'selatan', 'timur')).toBe('OUT');
  });

  it('should return OUT for Piyungan ke timur dari utara', () => {
    expect(getArusStatus('piyungan', 'utara', 'timur')).toBe('OUT');
  });

  it('should return IN for Glagah dari barat', () => {
    expect(getArusStatus('glagah', 'barat', 'selatan')).toBe('IN');
  });

  it('should return OUT for Glagah ke barat dari timur', () => {
    expect(getArusStatus('glagah', 'timur', 'barat')).toBe('OUT');
  });

  it('should return OUT for Glagah ke barat dari selatan', () => {
    expect(getArusStatus('glagah', 'selatan', 'barat')).toBe('OUT');
  });

  it('should return OUT for Glagah ke barat dari utara', () => {
    expect(getArusStatus('glagah', 'utara', 'barat')).toBe('OUT');
  });

  it('should return UNDEFINED for unmatched input', () => {
    expect(getArusStatus('unknown', 'foo', 'bar')).toBe('UNDEFINED');
    expect(getArusStatus(undefined, undefined, undefined)).toBe('UNDEFINED');
    expect(getArusStatus('', '', '')).toBe('UNDEFINED');
  });
});

describe('countArus', () => {
  it('should count totalIN and totalOUT', () => {
    const simpangMap = { 1: 'tempel', 2: 'prambanan' };
    const data = [
      { ID_Simpang: 5, dari_arah: 'utara', ke_arah: 'barat' }, // IN (tempel)
      { ID_Simpang: 5, dari_arah: 'selatan', ke_arah: 'utara' }, // OUT (tempel)
      { ID_Simpang: 2, dari_arah: 'timur', ke_arah: 'utara' }, // IN (prambanan)
      { ID_Simpang: 2, dari_arah: 'barat', ke_arah: 'timur' } // OUT (prambanan)
    ];
    const { totalIN, totalOUT } = countArus(data, simpangMap);
    expect(totalIN).toBe(2);
    expect(totalOUT).toBe(2);
  });

  it('should count 0 if data empty', () => {
    const result = countArus([], {});
    expect(result).toEqual({ totalIN: 0, totalOUT: 0 });
  });
});

describe('getPeriodsAndSlots', () => {
  it('should generate periods and 15-min slots (default)', () => {
    const arusRows = [
      { waktu: new Date('2023-05-12T06:01:00'), SM: 5, MP: 3, AUP: 2 }
    ];
    const periods = getPeriodsAndSlots(arusRows);
    const pagi = periods.find(p => p.name === 'Pagi');
    expect(pagi.timeSlots[0].time).toBe('06:00 - 06:15');
  });

  it('should generate 1-hour interval slots when interval is 1h', () => {
    const arusRows = [
      { waktu: new Date('2023-05-12T06:01:00'), SM: 1, MP: 2, AUP: 3 },
      { waktu: new Date('2023-05-12T06:59:00'), SM: 4, MP: 1, AUP: 2 }
    ];
    const periods = getPeriodsAndSlots(arusRows, '1h');
    const pagi = periods.find(p => p.name === 'Pagi');
    expect(pagi.timeSlots[0].time).toBe('06:00 - 07:00');
    expect(pagi.timeSlots[0].data.sm).toBe(5); // 1+4
    expect(pagi.timeSlots[0].data.total).toBe(13); // 1+4+2+1+3+2 = 13
  });

  it('should handle unknown/invalid interval by falling back to 15min', () => {
    const arusRows = [
      { waktu: new Date('2023-05-12T06:01:00'), SM: 2, MP: 3, AUP: 1 }
    ];
    const periods = getPeriodsAndSlots(arusRows, 'notavalidinterval');
    const pagi = periods.find(p => p.name === 'Pagi');
    expect(pagi.timeSlots[0].time).toBe('06:00 - 06:15');
  });
});
