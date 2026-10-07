const S = require('./js/saju.js');
const { CHEONGAN, JIJI, CHEONGAN_HANJA, JIJI_HANJA } = S;
const gz = (s, b) => CHEONGAN[s] + JIJI[b] + `(${CHEONGAN_HANJA[s]}${JIJI_HANJA[b]})`;
const KST = 9 * 3600 * 1000;
const ms = (y, mo, d, h = 12) => Date.UTC(y, mo - 1, d, h - 9, 0);

console.log('=== 2026년 24절기 (기대: 입춘 02-04 05:02) ===');
for (const t of [[285,'소한'],[300,'대한'],[315,'입춘'],[330,'우수'],[345,'경칩'],[0,'춘분'],[15,'청명'],[30,'곡우'],[45,'입하'],[60,'소만'],[75,'망종'],[90,'하지'],[105,'소서'],[120,'대서'],[135,'입추'],[150,'처서'],[165,'백로'],[180,'추분'],[195,'한로'],[210,'상강'],[225,'입동'],[240,'소설'],[255,'대설'],[270,'동지']]) {
  console.log(t[1], S.fmtKST(S.termMoment(2026, t[0])));
}

console.log('\n=== 일진 (앵커: 1900-01-01=갑술 가정) ===');
for (const [y, m, d, note] of [
  [2026,5,1,'위키: 정축?'],[2026,8,30,'위키: 병자?'],[2000,1,1,''],[2026,10,7,'오늘'],[2026,2,4,'입춘일'],
]) {
  const p = S.pillarDay(ms(y, m, d));
  console.log(`${y}-${m}-${d} → 일주 ${gz(p.stem, p.branch)}  ${note}`);
}

console.log('\n=== 년/월주 샘플 ===');
for (const [y, m, d, note] of [[2026,10,7,'오늘'],[2026,2,3,'입춘 전'],[2026,2,4,'입춘 당일 06시'],[2000,1,1,''],[1997,7,15,'']]) {
  const b = ms(y, m, d, d === 4 && m === 2 ? 6 : 12);
  const py = S.pillarYear(b), pm = S.pillarMonth(b, py.stem), pd = S.pillarDay(b), ph = S.pillarHour(b, pd.stem);
  console.log(`${y}-${m}-${d} ${note} → 년:${gz(py.stem,py.branch)} 월:${gz(pm.stem,pm.branch)} 일:${gz(pd.stem,pd.branch)} 시:${gz(ph.stem,ph.branch)}`);
}

const kstDay = d => S.fmtKST(d.getTime()).slice(0, 10);
console.log('\n=== 음력→양력 (설날 검증) ===');
for (const [y, exp] of [[2024,'2024-02-10'],[2025,'2025-01-29'],[2026,'2026-02-17'],[2023,'2023-01-22'],[2000,'2000-02-05'],[1990,'1990-01-27']]) {
  const got = kstDay(S.lunarToSolar(y, 1, 1, false));
  console.log(`음력 ${y}-01-01 → ${got}  (기대 ${exp}) ${got === exp ? 'OK' : '*** FAIL ***'}`);
}
console.log('--- 추석 ---');
for (const [y, exp] of [[2024,'2024-09-17'],[2025,'2025-10-06'],[2026,'2026-09-25']]) {
  const got = kstDay(S.lunarToSolar(y, 8, 15, false));
  console.log(`음력 ${y}-08-15 → ${got}  (기대 ${exp}) ${got === exp ? 'OK' : '*** FAIL ***'}`);
}
console.log('--- 윤달 ---');
{ // 2023 윤2월→03-22, 2025 윤6월→07-25, 2017 윤5월→06-24 (위키 교차검증)
  const cases = [[2023,2,'2023-03-22'],[2025,6,'2025-07-25'],[2017,5,'2017-06-24']];
  for(const [y,m,exp] of cases){
    const got = kstDay(S.lunarToSolar(y, m, 1, true));
    console.log(`음력 ${y}-윤${String(m).padStart(2,'0')}-01 → ${got} (기대 ${exp}) ${got===exp?'OK':'*** FAIL ***'}`);
  }
}
console.log('--- 일진 교차검증 (위키: 2017-06-24=임오, 2026-08-30=병자) ---');
for(const [y,m,d,exp] of [[2017,6,24,'임오'],[2026,8,30,'병자']]){
  const p = S.pillarDay(ms(y,m,d));
  const got = CHEONGAN[p.stem]+JIJI[p.branch];
  console.log(`${y}-${m}-${d} → ${got} (기대 ${exp}) ${got===exp?'OK':'*** FAIL ***'}`);
}
