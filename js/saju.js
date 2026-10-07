/* ============================================================
 * 사주 엔진 (Saju Engine)
 * - 24절기 천문 계산 (태양 황경, KST 기준)
 * - 사주팔자 (년/월/일/시주), 십성, 합충형해, 대운
 * - 한국 음력 변환 (삭망월 천문 계산, KST 기준)
 * 범용: 브라우저/Node 모두 동작 (의존성 없음)
 * ============================================================ */
'use strict';

/* ---------- 상수 ---------- */
const CHEONGAN = ['갑','을','병','정','무','기','경','신','임','계'];
const CHEONGAN_HANJA = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JIJI = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const JIJI_HANJA = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ELEMENTS = ['목','화','토','금','수'];
const ELEMENTS_HANJA = ['木','火','土','金','水'];
const STEM_ELEMENT = [0,0,1,1,2,2,3,3,4,4];          // 갑을=목 병정=화 무기=토 경신=금 임계=수
const BRANCH_ELEMENT = [4,2,0,0,2,1,1,2,3,3,2,4];    // 자=수 축=토 인=목 ...
const STEM_YANG = [1,0,1,0,1,0,1,0,1,0];            // 갑병무경임=양
const BRANCH_YANG = [1,0,1,0,1,0,1,0,1,0,1,0];
const BRANCH_MAIN_QI = [9,5,0,1,4,2,3,5,6,7,4,8];   // 지지 본기: 자=계 축=기 인=갑 묘=을 진=무 사=병 오=정 미=기 신=경 유=신 술=무 해=임
const ZODIAC = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];
const HOUR_NAMES = ['자시','축시','인시','묘시','진시','사시','오시','미시','신시','유시','술시','해시'];

/* 24절기: lon=태양 황경, jie=true면 절(월주 경계), b=해당 월의 지지 */
const TERMS = [
  { n:'소한', h:'小寒', lon:285, jie:true,  b:1  },
  { n:'대한', h:'大寒', lon:300, jie:false },
  { n:'입춘', h:'立春', lon:315, jie:true,  b:2  },
  { n:'우수', h:'雨水', lon:330, jie:false },
  { n:'경칩', h:'驚蟄', lon:345, jie:true,  b:3  },
  { n:'춘분', h:'春分', lon:0,   jie:false },
  { n:'청명', h:'淸明', lon:15,  jie:true,  b:4  },
  { n:'곡우', h:'穀雨', lon:30,  jie:false },
  { n:'입하', h:'立夏', lon:45,  jie:true,  b:5  },
  { n:'소만', h:'小滿', lon:60,  jie:false },
  { n:'망종', h:'芒種', lon:75,  jie:true,  b:6  },
  { n:'하지', h:'夏至', lon:90,  jie:false },
  { n:'소서', h:'小暑', lon:105, jie:true,  b:7  },
  { n:'대서', h:'大暑', lon:120, jie:false },
  { n:'입추', h:'立秋', lon:135, jie:true,  b:8  },
  { n:'처서', h:'處暑', lon:150, jie:false },
  { n:'백로', h:'白露', lon:165, jie:true,  b:9  },
  { n:'추분', h:'秋分', lon:180, jie:false },
  { n:'한로', h:'寒露', lon:195, jie:true,  b:10 },
  { n:'상강', h:'霜降', lon:210, jie:false },
  { n:'입동', h:'立冬', lon:225, jie:true,  b:11 },
  { n:'소설', h:'小雪', lon:240, jie:false },
  { n:'대설', h:'大雪', lon:255, jie:true,  b:0  },
  { n:'동지', h:'冬至', lon:270, jie:false },
];
const JIE = TERMS.filter(t => t.jie);          // 12절
const JUNGGI_LONS = TERMS.filter(t => !t.jie).map(t => t.lon); // 12중기 (윤달 판정)

/* ---------- 시간 유틸 (KST 기준) ---------- */
const KST_OFFSET = 9 * 3600 * 1000;
function norm360(x){ x %= 360; return x < 0 ? x + 360 : x; }
function jdUT(ms){ return ms / 86400000 + 2440587.5; }
/** KST 자정(ms, UTC 기준 타임스탬프) */
function kstMidnight(y, mo, d){ return Date.UTC(y, mo, d, 0, 0) - KST_OFFSET; }
function dayIndexOfKST(ms){ return Math.floor((ms + KST_OFFSET) / 86400000); }
function dateOfDayIndex(idx){ return new Date(idx * 86400000 - KST_OFFSET); }
function fmtKST(ms){
  const d = new Date(ms + KST_OFFSET);
  const p = n => String(n).padStart(2,'0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth()+1)}-${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

/* ---------- 태양 황경 ---------- */
function sunLon(jd){
  const d = jd - 2451545.0, r = Math.PI / 180;
  const L = norm360(280.460 + 0.9856474 * d);
  const g = norm360(357.528 + 0.9856003 * d) * r;
  return norm360(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));
}

/** 해당 연도, 황경 lon(도)에 태양이 도달하는 KST 시각(ms) */
function termMoment(year, lon){
  const target = norm360(lon);
  // 해당 연도에서 이 절기가 오는 예상일(±20일)부터 스캔 — 연말 절기가 전년도에 걸리지 않게
  const expected = norm360(lon - 285) / 360 * 365.25;
  const startKST = kstMidnight(year, 0, 1) + (expected - 20) * 86400000;
  let prevT = startKST, prevL = sunLon(jdUT(prevT));
  for(let i = 1; i <= 60; i++){
    const t = startKST + i * 86400000;
    const curL = sunLon(jdUT(t));
    const dPrev = norm360(target - prevL);
    const dStep = norm360(curL - prevL);
    if(dPrev <= dStep && dStep < 3){
      let lo = prevT, hi = t;
      for(let k = 0; k < 42; k++){
        const mid = (lo + hi) / 2;
        const fwd = norm360(sunLon(jdUT(mid)) - prevL);
        if(fwd < dPrev) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }
    prevT = t; prevL = curL;
  }
  throw new Error('절기 계산 실패: ' + year + ' ' + lon);
}

/* ---------- 달 (삭 계산, 저정밀도) ---------- */
function moonSunLon(jd){
  const d = jd - 2451543.5, r = Math.PI / 180;
  // 태양
  const Ms = norm360(356.0470 + 0.9856002585 * d);
  const Ls = norm360(Ms + 282.9404 + 4.70935e-5 * d);
  const sunLon = norm360(Ls + 1.915 * Math.sin(Ms * r) + 0.020 * Math.sin(2 * Ms * r));
  // 달 궤도 요소
  const N = norm360(125.1228 - 0.0529538083 * d);
  const w = norm360(318.0634 + 0.1643573223 * d);
  const a = 60.2666, e = 0.054900;
  const M = norm360(115.3654 + 13.0649929509 * d);
  let E = M + e * (180 / Math.PI) * Math.sin(M * r) * (1 + e * Math.cos(M * r));
  for(let k = 0; k < 4; k++)
    E = E - (E - e * (180 / Math.PI) * Math.sin(E * r) - M) / (1 - e * Math.cos(E * r));
  const xv = a * (Math.cos(E * r) - e);
  const yv = a * (Math.sqrt(1 - e * e) * Math.sin(E * r));
  const v = Math.atan2(yv, xv) / r; // 진근점이각 (도)
  const rr = Math.sqrt(xv * xv + yv * yv);
  // 궤도면 → 황도면 회전 (승교점 N, 궤도경사 i)
  const Nr = N * r, vw = (v + w) * r, ir = 5.1454 * r;
  const xh = rr * (Math.cos(Nr) * Math.cos(vw) - Math.sin(Nr) * Math.sin(vw) * Math.cos(ir));
  const yh = rr * (Math.sin(Nr) * Math.cos(vw) + Math.cos(Nr) * Math.sin(vw) * Math.cos(ir));
  const lonecl = norm360(Math.atan2(yh, xh) / r);
  // 섭동
  const Lm = norm360(N + w + M);
  const D = norm360(Lm - Ls), F = norm360(Lm - N);
  const lon = lonecl
    - 1.274 * Math.sin((M - 2 * D) * r)
    + 0.658 * Math.sin(2 * D * r)
    - 0.186 * Math.sin(Ms * r)
    - 0.059 * Math.sin((2 * M - 2 * D) * r)
    - 0.057 * Math.sin((M - 2 * D + Ms) * r)
    + 0.053 * Math.sin((M + 2 * D) * r)
    + 0.046 * Math.sin((2 * D - Ms) * r)
    + 0.041 * Math.sin((M - Ms) * r)
    - 0.035 * Math.sin(D * r)
    - 0.031 * Math.sin((M + Ms) * r)
    - 0.015 * Math.sin((2 * F - 2 * D) * r)
    + 0.011 * Math.sin((M - 4 * D) * r);
  return { moon: norm360(lon), sun: sunLon };
}
function moonElong(jd){
  const { moon, sun } = moonSunLon(jd);
  return norm360(moon - sun);
}
/** msStart 이후 첫 삭(UTC ms) */
function newMoonAfter(msStart){
  let t = msStart, prev = moonElong(jdUT(t));
  for(let i = 1; i <= 40; i++){
    const nt = t + 86400000, cur = moonElong(jdUT(nt));
    if(cur < prev){
      let lo = t, hi = nt;
      for(let k = 0; k < 40; k++){
        const mid = (lo + hi) / 2;
        if(moonElong(jdUT(mid)) > 180) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }
    t = nt; prev = cur;
  }
  throw new Error('삭 계산 실패');
}
function newMoonsBetween(aMs, bMs){
  const out = [];
  let t = newMoonAfter(aMs);
  while(t < bMs){ out.push(t); t = newMoonAfter(t + 20 * 86400000); }
  return out;
}

/* ---------- 음력 → 양력 (한국, KST 기준) ---------- */
function lunarToSolar(Y, M, D, isLeap){
  if(Y < 1900 || Y > 2100) throw new Error('지원 범위: 1900~2100년');
  const moons = newMoonsBetween(Date.UTC(Y - 2, 6, 1), Date.UTC(Y + 2, 3, 1));
  const starts = moons.map(m => dayIndexOfKST(m));
  const jungg = [];
  for(let y = Y - 2; y <= Y + 2; y++)
    for(const lon of JUNGGI_LONS) jungg.push(termMoment(y, lon));
  // 윤달 판정은 '날짜' 기준: 삭이 든 날~다음 삭 전날 사이에 중기가 든 날이 없으면 윤달
  const hasJ = moons.map((m, i) => {
    const s0 = starts[i], s1 = i + 1 < starts.length ? starts[i + 1] : Infinity;
    return jungg.some(j => { const d = dayIndexOfKST(j); return d >= s0 && d < s1; });
  });
  // 동지(Y-1년)가 든 달 = 음력 (Y-1)년 11월 → 앞으로 쭉 빌드
  const dzDay = dayIndexOfKST(termMoment(Y - 1, 270));
  let k = -1;
  for(let i = 0; i < starts.length - 1; i++)
    if(starts[i] <= dzDay && dzDay < starts[i + 1]){ k = i; break; }
  if(k < 0) throw new Error('동지 월 탐색 실패');
  const table = [{ yr:Y - 1, num:11, leap:false, start:starts[k] }];
  let num = 11, yr = Y - 1;
  for(let i = k + 1; ; i++){
    if(i >= starts.length) throw new Error('월 탐색 범위 초과');
    let e;
    if(!hasJ[i]) e = { yr, num, leap:true, start:starts[i] };
    else { num++; if(num > 12){ num = 1; yr++; } e = { yr, num, leap:false, start:starts[i] }; }
    table.push(e);
    if(yr === Y + 1) break;
  }
  const idx = table.findIndex(e => e.yr === Y && e.num === M && e.leap === !!isLeap);
  if(idx < 0) throw new Error('해당 음력 월을 찾을 수 없음');
  if(idx + 1 >= table.length) throw new Error('월 길이 계산 실패');
  const monthLen = table[idx + 1].start - table[idx].start;
  if(D < 1 || D > monthLen) throw new Error(`해당 월은 1~${monthLen}일`);
  return dateOfDayIndex(table[idx].start + (D - 1)); // KST 자정 Date
}

/* ---------- 사주팔자 ---------- */
/* 일진 앵커: 1900-01-01 (KST) 의 간지 — 외부 만세력과 대조해 확정 */
const DAY_ANCHOR = { stem: 0, branch: 10, idx: 10 }; // 갑술일 (검증 예정)

function pillarYear(birthMs){
  const y = new Date(birthMs + KST_OFFSET).getUTCFullYear();
  const lichun = termMoment(y, 315);
  const sy = birthMs >= lichun ? y : y - 1;
  const stem = (((sy - 4) % 10) + 10) % 10;
  const branch = (((sy - 4) % 12) + 12) % 12;
  return { stem, branch, idx: sixtyIndex(stem, branch) };
}
function sixtyIndex(stem, branch){
  for(let n = 0; n < 60; n++) if(n % 10 === stem && n % 12 === branch) return n;
  throw new Error('간지 조합 오류');
}
function pillarMonth(birthMs, yearStem){
  const y = new Date(birthMs + KST_OFFSET).getUTCFullYear();
  let moments = [];
  for(const yy of [y - 1, y, y + 1])
    for(const j of JIE) moments.push({ t: termMoment(yy, j.lon), b: j.b });
  moments.sort((a, b) => a.t - b.t);
  let cur = moments[0];
  for(const m of moments) if(m.t <= birthMs) cur = m;
  const mIdx = (cur.b + 10) % 12;                       // 인월=0 … 축월=11
  const startStem = [2, 4, 6, 8, 0][yearStem % 5];      // 오호둔월법
  const stem = (startStem + mIdx) % 10;
  return { stem, branch: cur.b, idx: sixtyIndex(stem, cur.b) };
}
function pillarDay(birthMs){
  const anchorMs = kstMidnight(1900, 0, 1);
  const days = Math.floor((birthMs - anchorMs) / 86400000);
  const idx = (((DAY_ANCHOR.idx + days) % 60) + 60) % 60;
  return { stem: idx % 10, branch: idx % 12, idx };
}
function pillarHour(birthMs, dayStem){
  const d = new Date(birthMs + KST_OFFSET);
  const h = d.getUTCHours();
  const branch = Math.floor((((h + 1) % 24)) / 2);      // 23~1시=자시
  const startStem = [0, 2, 4, 6, 8][dayStem % 5];       // 오자둔일법
  const stem = (startStem + branch) % 10;
  return { stem, branch, idx: sixtyIndex(stem, branch) };
}

/* ---------- 십성 ---------- */
const TEN_GODS = ['비견','겁재','식신','상관','편재','정재','편관','정관','편인','정인'];
function tenGod(dayStem, targetStem){
  const de = STEM_ELEMENT[dayStem], te = STEM_ELEMENT[targetStem];
  const samePol = (dayStem % 2) === (targetStem % 2);
  if(te === de) return samePol ? '비견' : '겁재';
  if(te === (de + 1) % 5) return samePol ? '식신' : '상관';   // 내가 생
  if(te === (de + 4) % 5) return samePol ? '편인' : '정인';   // 생나
  if(te === (de + 2) % 5) return samePol ? '편재' : '정재';   // 내가 극
  return samePol ? '편관' : '정관';                            // 극나
}

/* ---------- 합·충·삼합 ---------- */
const LIUHE = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
const LIUCHONG = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const SANHE = [[8,0,4],[11,3,7],[2,6,10],[5,9,1]];
function branchRelations(items){ // items: [{name:'시', branch:0}, ...]
  const res = { he: [], chong: [], sanhe: [] };
  const find = b => items.findIndex(it => it.branch === b);
  for(const [a, b] of LIUHE){
    const ia = find(a), ib = find(b);
    if(ia >= 0 && ib >= 0 && ia !== ib) res.he.push(`${items[ia].name}·${items[ib].name} ${JIJI[a]}${JIJI[b]}합`);
  }
  for(const [a, b] of LIUCHONG){
    const ia = find(a), ib = find(b);
    if(ia >= 0 && ib >= 0 && ia !== ib) res.chong.push(`${items[ia].name}·${items[ib].name} ${JIJI[a]}${JIJI[b]}충`);
  }
  for(const [a, b, c] of SANHE){
    if(find(a) >= 0 && find(b) >= 0 && find(c) >= 0) res.sanhe.push(`${JIJI[a]}${JIJI[b]}${JIJI[c]} 삼합`);
  }
  return res;
}

/* ---------- 대운 ---------- */
function daeun(birthMs, gender, yearStem, monthPillar){
  const yang = yearStem % 2 === 0;
  const forward = (gender === 'male') === yang;
  const y = new Date(birthMs + KST_OFFSET).getUTCFullYear();
  let moments = [];
  for(const yy of [y - 1, y, y + 1])
    for(const j of JIE) moments.push(termMoment(yy, j.lon));
  moments.sort((a, b) => a - b);
  let prev = moments[0], next = moments[moments.length - 1];
  for(const m of moments){ if(m <= birthMs) prev = m; if(m > birthMs){ next = m; break; } }
  const ref = forward ? next : prev;
  const days = Math.abs(ref - birthMs) / 86400000;
  const startAge = days / 3;
  const sy = Math.floor(startAge), sm = Math.round((startAge - sy) * 12);
  const list = [];
  for(let i = 1; i <= 8; i++){
    const c = (((monthPillar.idx + (forward ? i : -i)) % 60) + 60) % 60;
    list.push({
      stem: c % 10, branch: c % 12, idx: c,
      ageFrom: Math.round(sy + (i - 1) * 10 + sm / 12),
    });
  }
  return { forward, startYears: sy, startMonths: sm, list };
}

/* ---------- 종합 분석 ---------- */
function analyze(o){
  // o: {solarMs, gender('male'|'female'), hourKnown:bool}
  const birthMs = o.solarMs;
  const py = pillarYear(birthMs);
  const pm = pillarMonth(birthMs, py.stem);
  const pd = pillarDay(birthMs);
  const ph = o.hourKnown ? pillarHour(birthMs, pd.stem) : null;
  const pillars = [
    { key:'hour', label:'시주', ...ph,  god: ph ? tenGod(pd.stem, ph.stem) : null, branchGod: ph ? tenGod(pd.stem, BRANCH_MAIN_QI[ph.branch]) : null },
    { key:'day',  label:'일주', ...pd,  god:'일간', branchGod: tenGod(pd.stem, BRANCH_MAIN_QI[pd.branch]) },
    { key:'month',label:'월주', ...pm,  god: tenGod(pd.stem, pm.stem), branchGod: tenGod(pd.stem, BRANCH_MAIN_QI[pm.branch]) },
    { key:'year', label:'년주', ...py,  god: tenGod(pd.stem, py.stem), branchGod: tenGod(pd.stem, BRANCH_MAIN_QI[py.branch]) },
  ];
  // 오행 분포
  const elCount = [0,0,0,0,0];
  for(const p of pillars){
    if(p.stem == null) continue;
    elCount[STEM_ELEMENT[p.stem]]++;
    elCount[BRANCH_ELEMENT[p.branch]]++;
  }
  const known = pillars.filter(p => p.stem != null);
  const yin = known.filter(p => STEM_YANG[p.stem]).length
            + known.filter(p => BRANCH_YANG[p.branch]).length;
  const total = known.length * 2;
  const nameOf = { hour:'시', day:'일', month:'월', year:'년' };
  const relations = branchRelations(known.map(p => ({ name: nameOf[p.key], branch: p.branch })));
  const dw = daeun(birthMs, o.gender, py.stem, pm);
  return { pillars, dayStem: pd.stem, elCount, elTotal: total, yin, yang: total - yin,
           relations, daeun: dw,
           zodiac: ZODIAC[py.branch], yearStem: py.stem, yearBranch: py.branch };
}

/* Node 테스트용 export */
if(typeof module !== 'undefined' && module.exports){
  module.exports = { termMoment, pillarYear, pillarMonth, pillarDay, pillarHour,
    lunarToSolar, tenGod, daeun, analyze, branchRelations, fmtKST, kstMidnight,
    CHEONGAN, CHEONGAN_HANJA, JIJI, JIJI_HANJA, ELEMENTS, STEM_ELEMENT, BRANCH_ELEMENT, ZODIAC };
}
