/* 서사주 — UI 로직 */
(function(){
'use strict';

const $ = id => document.getElementById(id);
const EL_NAME = ['목','화','토','금','수'];
const EL_HANJA = ['木','火','土','金','水'];
const EL_MEAN = ['시작과 성장의 기운', '열정과 표현의 기운', '안정과 신뢰의 기운', '결단과 원칙의 기운', '지혜와 포용의 기운'];

/* ---------- 일간 해석 ---------- */
const DAY_MASTER = [
  { t:'곧은 소나무', d:'갑목(甲木)은 곧게 뻗은 소나무의 기운입니다. 정의롭고 올곧으며, 시작한 일은 끝까지 밀어붙이는 힘이 있습니다. 사람들의 신뢰를 받는 리더의 그릇입니다.',
    a:'모든 짐을 혼자 짊어지려 하지 마세요. 주변과 나누면 소나무는 숲이 됩니다.' },
  { t:'바람에 흔들리는 꽃과 넝쿨', d:'을목(乙木)은 부드럽게 감아 오르는 넝쿨의 기운입니다. 유연한 적응력과 섬세한 감각으로 어떤 환경에서도 자리를 잡습니다. 사람을 편안하게 하는 매력이 있습니다.',
    a:'흔들릴 때는 뿌리를 확인하세요. 원칙 하나만 단단하면 어떤 바람에도 꺾이지 않습니다.' },
  { t:'한낮의 태양', d:'병화(丙火)는 만물을 비추는 태양의 기운입니다. 밝고 열정적이며, 사람을 모으는 힘이 있습니다. 그 자리에 있는 것만으로 주변이 환해집니다.',
    a:'태양도 쉴 때가 필요합니다. 타오르되 태우지 않게, 속도를 조절하는 지혜를 더하세요.' },
  { t:'어둠을 밝히는 촛불', d:'정화(丁火)는 은은하게 타오르는 촛불의 기운입니다. 따뜻하고 세심해서 곁에 두면 마음이 놓입니다. 화려하지 않지만 오래, 깊게 남는 사람입니다.',
    a:'남을 밝히느라 자신을 태우지 마세요. 당신을 위한 불씨도 꼭 남겨두세요.' },
  { t:'우뚝한 큰 산', d:'무토(戊土)는 중심을 지키는 큰 산의 기운입니다. 듬직하고 믿음직스러워 위기 때 기댈 언덕이 됩니다. 말보다 행동으로 신뢰를 쌓는 사람입니다.',
    a:'가끔은 산을 내려와 가벼워지세요. 고집을 한 걸음만 내려놓으면 길이 보입니다.' },
  { t:'기름진 논밭', d:'기토(己土)는 만물을 길러내는 논밭의 기운입니다. 포용력이 넓고 실속이 있어, 맡은 일은 알차게 결실을 맺습니다. 사람들의 마음을 넉넉히 받아주는 그릇입니다.',
    a:'남의 밭을 돌보다 내 밭 갈 시기를 놓치지 마세요. 당신 차례도 중요합니다.' },
  { t:'날 선 무쇠', d:'경금(庚金)은 벼려낸 칼날의 기운입니다. 결단력과 추진력이 뛰어나고 의리가 있습니다. 한 번 정하면 뒤돌아보지 않는 강단이 있습니다.',
    a:'베어야 할 때는 정확히, 사람에게는 둥글게. 날의 방향을 고르는 것이 지혜입니다.' },
  { t:'다듬어진 보석', d:'신금(辛金)은 정교하게 세공된 보석의 기운입니다. 섬세하고 예리한 감각으로 작은 것도 놓치지 않습니다. 완벽을 추구하는 장인 정신의 소유자입니다.',
    a:'다듬어지느라 지치지 마세요. 휴식도 보석처럼 소중히 세팅하세요.' },
  { t:'넓고 깊은 바다', d:'임수(壬水)는 모든 것을 품는 바다의 기운입니다. 포용력과 통찰로 흐름을 읽고, 큰 판을 움직입니다. 지혜롭고 배포가 큰 사람입니다.',
    a:'파도에 휩쓸리지 않게 닻을 내리세요. 목표 하나만 분명하면 바다는 당신 편입니다.' },
  { t:'새벽의 이슬', d:'계수(癸水)는 조용히 스며드는 새벽 이슬의 기운입니다. 총명하고 감수성이 풍부해서 남이 모르는 것을 먼저 알아챕니다. 부드럽게 스며들어 변화를 만듭니다.',
    a:'맑은 만큼 흐려질 때도 있습니다. 가끔은 햇살 아래에서 마음을 말리세요.' },
];

const TEN_GOD_MEAN = { '비견':'나와 같은 기운 · 동료, 자신감', '겁재':'경쟁과 추진 · 승부욕, 행동력',
  '식신':'여유와 표현 · 재능, 즐거움', '상관':'개성과 변화 · 창의, 도전',
  '편재':'유동적인 재물 · 사업, 큰 돈', '정재':'안정적인 재물 · 월급, 저축',
  '편관':'도전과 권위 · 시험, 승부', '정관':'책임과 명예 · 직장, 신뢰',
  '편인':'직관과 특별함 · 영감, 비주류', '정인':'학문과 배려 · 공부, 인덕' };

/* ---------- 공용 ---------- */
function segWire(id){
  const el = $(id);
  el.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    el.querySelectorAll('button').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    if(id === 'calSeg') $('leapWrap').classList.toggle('hidden', b.dataset.v !== 'lunar');
  });
}
const segVal = id => $(id).querySelector('.on').dataset.v;
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function shuffledIdx(n){
  const idx = Array.from({length:n}, (_, i) => i);
  const rnd = new Uint32Array(n);
  crypto.getRandomValues(rnd);
  for(let i = n - 1; i > 0; i--){
    const j = rnd[i] % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/* ---------- 사주 폼 ---------- */
const nowY = new Date().getFullYear();
function fillSelect(sel, from, to, suffix){
  for(let v = from; v <= to; v++){
    const o = document.createElement('option');
    o.value = v; o.textContent = v + suffix;
    sel.appendChild(o);
  }
}
fillSelect($('yearSel'), 1900, nowY, '년');
fillSelect($('monthSel'), 1, 12, '월');
fillSelect($('daySel'), 1, 31, '일');
$('yearSel').value = 1990; $('monthSel').value = 1; $('daySel').value = 1;
(function(){
  const h = $('hourSel');
  const o0 = document.createElement('option'); o0.value = ''; o0.textContent = '태어난 시간 모름';
  h.appendChild(o0);
  for(let hh = 0; hh < 24; hh++){
    const b = Math.floor(((hh + 1) % 24) / 2);
    const o = document.createElement('option');
    o.value = hh; o.textContent = `${hh}시 (${JIJI[b]}시)`;
    h.appendChild(o);
  }
})();
segWire('calSeg'); segWire('genderSeg');

function kstMidnightMs(y, mo, d){ return Date.UTC(y, mo, d, 0, 0) - 9 * 3600 * 1000; }
function showErr(msg){
  const e = $('errMsg');
  if(!msg){ e.classList.add('hidden'); return; }
  e.textContent = msg; e.classList.remove('hidden');
}

$('goBtn').addEventListener('click', () => {
  showErr(null);
  const y = +$('yearSel').value, m = +$('monthSel').value, d = +$('daySel').value;
  const cal = segVal('calSeg'), gender = segVal('genderSeg');
  const hourV = $('hourSel').value;
  const name = $('name').value.trim();

  let solarDay, birthLabel;
  try{
    if(cal === 'lunar'){
      solarDay = lunarToSolar(y, m, d, $('leapChk').checked);
      const sd = new Date(solarDay.getTime() + 9 * 3600 * 1000);
      birthLabel = `음력 ${y}년 ${m}월 ${d}일${$('leapChk').checked ? ' (윤달)' : ''} → 양력 ${sd.getUTCFullYear()}년 ${sd.getUTCMonth()+1}월 ${sd.getUTCDate()}일`;
    }else{
      solarDay = new Date(kstMidnightMs(y, m - 1, d));
      birthLabel = `양력 ${y}년 ${m}월 ${d}일`;
    }
  }catch(e){
    showErr('날짜를 확인해주세요: ' + e.message);
    return;
  }
  const hourKnown = hourV !== '';
  const solarMs = solarDay.getTime() + (hourKnown ? (+hourV) * 3600 * 1000 : 12 * 3600 * 1000);
  if(hourKnown){
    const hb = Math.floor((((+hourV) + 1) % 24) / 2);
    birthLabel += ` ${hourV}시 (${JIJI[hb]}시)`;
  }else birthLabel += ' (시간 모름)';

  let r;
  try{ r = analyze({ solarMs, gender, hourKnown }); }
  catch(e){ showErr('계산 중 오류: ' + e.message); return; }

  renderSaju(name, birthLabel, r, solarMs);
  $('sajuResult').classList.remove('hidden');
  $('sajuResult').scrollIntoView({ behavior:'smooth', block:'start' });
});

/* ---------- 사주 렌더 ---------- */
function pillarHTML(p){
  if(p.stem == null)
    return `<div class="pillar">
      <div class="plabel">時 · 시주</div><div class="god">미상</div>
      <div class="stem"><div class="hanja">?</div><div class="kor">시간 미입력</div></div>
      <div class="branch"><div class="hanja">?</div><div class="kor"></div></div></div>`;
  const se = STEM_ELEMENT[p.stem], be = BRANCH_ELEMENT[p.branch];
  const lbl = { hour:'時 · 시주', day:'日 · 일주', month:'月 · 월주', year:'年 · 년주' }[p.key];
  return `<div class="pillar${p.key === 'day' ? ' day' : ''}">
    <div class="plabel">${lbl}</div><div class="god">${p.god}</div>
    <div class="stem"><div class="hanja el-${se}">${CHEONGAN_HANJA[p.stem]}</div>
      <div class="kor">${CHEONGAN[p.stem]} · ${EL_NAME[se]}(${EL_HANJA[se]})</div></div>
    <div class="branch"><div class="hanja el-${be}">${JIJI_HANJA[p.branch]}</div>
      <div class="kor">${JIJI[p.branch]} · ${EL_NAME[be]}(${EL_HANJA[be]}) · ${p.branchGod}</div></div>
  </div>`;
}

function renderSaju(name, birthLabel, r, solarMs){
  const dm = DAY_MASTER[r.dayStem];
  const who = name ? `<b>${esc(name)}</b>님의 사주` : '당신의 사주';

  let maxE = 0, minE = 0;
  for(let i = 1; i < 5; i++){ if(r.elCount[i] > r.elCount[maxE]) maxE = i; if(r.elCount[i] < r.elCount[minE]) minE = i; }
  const elBars = EL_NAME.map((n, i) => `
    <div class="elbar"><span class="el-${i}">${n}(${EL_HANJA[i]})</span>
      <div class="track"><div class="fill" style="width:${r.elCount[i] / r.elTotal * 100}%;background:var(--${['wood','fire','earth','metal','water'][i]})"></div></div>
      <span class="cnt">${r.elCount[i]}</span></div>`).join('');
  const elText = maxE === minE
    ? `오행이 고르게 분포되어 있습니다. 어느 한쪽으로 치우치지 않은 균형 잡힌 사주입니다.`
    : `${EL_NAME[maxE]}(${EL_HANJA[maxE]})의 기운이 가장 강합니다. ${EL_MEAN[maxE]}이 삶의 중심에 있습니다.` +
      (r.elCount[minE] === 0
        ? ` 반면 ${EL_NAME[minE]}(${EL_HANJA[minE]})의 기운은 사주에 보이지 않네요. ${EL_MEAN[minE]}을 의식적으로 채워보세요.`
        : ` ${EL_NAME[minE]}(${EL_HANJA[minE]})의 기운은 상대적으로 약합니다.`);

  const yyText = r.yin === r.yang ? '음과 양의 균형이 잘 맞는 사주입니다.'
    : r.yang > r.yin ? '양(陽)의 기운이 강한 사주입니다. 밖으로 뻗어나가는 추진력과 활동성이 돋보입니다.'
    : '음(陰)의 기운이 강한 사주입니다. 안으로 다지는 신중함과 깊이가 돋보입니다.';

  const rel = r.relations;
  const relHTML = (rel.he.length || rel.chong.length || rel.sanhe.length)
    ? `<div class="badges">` +
      rel.sanhe.map(s => `<span class="badge sanhe">三合 ${s}</span>`).join('') +
      rel.he.map(s => `<span class="badge he">六合 ${s}</span>`).join('') +
      rel.chong.map(s => `<span class="badge chong">六沖 ${s}</span>`).join('') + `</div>
      <p style="margin-top:10px">합(合)은 기운이 모이고 통하는 관계, 충(沖)은 부딪히며 변화가 일어나는 관계, 삼합(三合)은 세 기운이 크게 모이는 형국입니다.</p>`
    : `<p>두드러진 합·충·삼합 관계가 없습니다. 각 기운이 제자리를 지키는 안정적인 구조입니다.</p>`;

  const ageNow = Math.floor((Date.now() - solarMs) / (365.25 * 86400000));
  const dwHTML = r.daeun.list.map(dw => {
    const isNow = ageNow >= dw.ageFrom && ageNow < dw.ageFrom + 10;
    return `<div class="dw${isNow ? ' now' : ''}"><div class="age">${dw.ageFrom}~${dw.ageFrom + 9}세${isNow ? ' · 현재' : ''}</div>
      <div class="gz"><span class="el-${STEM_ELEMENT[dw.stem]}">${CHEONGAN_HANJA[dw.stem]}</span><span class="el-${BRANCH_ELEMENT[dw.branch]}">${JIJI_HANJA[dw.branch]}</span></div></div>`;
  }).join('');

  const thisYear = new Date(Date.now() + 9 * 3600 * 1000).getUTCFullYear();
  const sy = pillarYear(Date.now());
  const sm = pillarMonth(Date.now(), sy.stem);
  const gz = (s, b) => `<span class="el-${STEM_ELEMENT[s]}">${CHEONGAN_HANJA[s]}</span><span class="el-${BRANCH_ELEMENT[b]}">${JIJI_HANJA[b]}</span>`;
  const godLegend = Object.entries(TEN_GOD_MEAN).map(([k, v]) => `${k}(${v.split(' ')[0]})`).join(' · ');

  $('sajuResult').innerHTML = `
    <div class="res-head">
      <div class="who">${who}</div>
      <div class="birth">${birthLabel} · ${r.zodiac}띠</div>
      <span class="zodiac">${CHEONGAN[r.dayStem]}${EL_NAME[STEM_ELEMENT[r.dayStem]]} 일간</span>
    </div>
    <div class="pillars">${r.pillars.map(pillarHTML).join('')}</div>
    <div class="sec">
      <h3>일간 풀이 — ${CHEONGAN_HANJA[r.dayStem]}${EL_HANJA[STEM_ELEMENT[r.dayStem]]}(${CHEONGAN[r.dayStem]}${EL_NAME[STEM_ELEMENT[r.dayStem]]}) · ${dm.t}</h3>
      <p>${dm.d}</p>
      <div class="advice">💡 ${dm.a}</div>
    </div>
    <div class="sec">
      <h3>오행 분포</h3>
      <div class="elbars">${elBars}</div>
      <p style="margin-top:12px">${elText}</p>
    </div>
    <div class="sec">
      <h3>음양의 조화</h3>
      <p>양의 기운 ${r.yang} · 음의 기운 ${r.yin} — ${yyText}</p>
    </div>
    <div class="sec">
      <h3>합 · 충 · 삼합</h3>
      ${relHTML}
    </div>
    <div class="sec">
      <h3>십성 한눈에</h3>
      <p style="font-size:.85rem;color:var(--ink-dim)">${godLegend}</p>
      <p style="margin-top:8px">위 사주표의 각 글자 위에 적힌 십성은 일간(日干)인 '${CHEONGAN[r.dayStem]}'을 기준으로 본 관계입니다.</p>
    </div>
    <div class="sec">
      <h3>대운 (10년 주기 흐름)</h3>
      <div class="daeun-head"><span class="dir">${r.daeun.forward ? '순행' : '역행'} · 약 ${r.daeun.startYears}세 ${r.daeun.startMonths}개월부터 시작</span></div>
      <div class="daeun-list">${dwHTML}</div>
      <p style="margin-top:10px;font-size:.85rem;color:var(--ink-dim)">대운은 월주를 기준으로 10년씩 이어지는 큰 흐름입니다. 시작 나이는 출생일과 절기 사이의 간격으로 계산합니다.</p>
    </div>
    <div class="sec">
      <h3>올해의 운 (${thisYear}년)</h3>
      <div class="seun">
        <div class="su"><div class="t">년운</div><div class="g">${gz(sy.stem, sy.branch)}</div></div>
        <div class="su"><div class="t">이달의 월운</div><div class="g">${gz(sm.stem, sm.branch)}</div></div>
      </div>
      <p style="margin-top:10px">${thisYear}년은 ${CHEONGAN_HANJA[sy.stem]}${JIJI_HANJA[sy.branch]}년(${CHEONGAN[sy.stem]}${JIJI[sy.branch]}년)입니다. 대운·세운과 일간의 관계를 함께 보면 올해의 흐름이 보입니다.</p>
    </div>
    <div class="res-actions">
      <button class="btn-ghost" id="retryBtn">다시 입력하기</button>
      <button class="btn-gold" id="printBtn">결과 인쇄하기</button>
    </div>
    <p class="hint" style="margin-top:14px">23시~24시는 자시(子時)로 계산하며, 일주는 자정(0시)을 기준으로 바뀝니다.</p>`;

  $('retryBtn').addEventListener('click', () =>
    $('saju').scrollIntoView({ behavior:'smooth' }));
  $('printBtn').addEventListener('click', () => window.print());
}

/* ---------- 타로 ---------- */
const TAROT_POS = {
  1: ['오늘의 메시지'],
  3: ['현재', '영향', '행동'],
  5: ['상황', '장애물', '자원', '행동', '가능성'],
};
let tarotState = null;

function setStep(n){
  document.querySelectorAll('#taroSteps li').forEach((li, i) =>
    li.classList.toggle('on', i < n));
}

segWire('topicChips'); segWire('countSel');
$('taroQ').addEventListener('input', () =>
  $('qCount').textContent = $('taroQ').value.length);

function tarotFaceHTML(c){
  if(c.arc === 'major')
    return `<div class="t-arc">MAJOR ARCANA</div><div class="t-num">${c.num}</div>` +
      `<div class="t-sym">${c.sym}</div><div class="t-name">${c.name}</div><div class="t-en">${c.en}</div>`;
  const s = TAROT_SUITS[c.suit];
  const rankKR = { A:'A', P:'시종', N:'기사', Q:'여왕', K:'왕' }[c.num] || c.num;
  return `<div class="t-arc">${s.en.toUpperCase()} · ${s.el}</div><div class="t-num">${rankKR}</div>` +
    `<div class="t-sym suit" style="color:${s.color}">${s.glyph}</div><div class="t-name">${c.name}</div><div class="t-en">${c.en}</div>`;
}

$('toPickBtn').addEventListener('click', () => {
  const count = +segVal('countSel');
  const topic = segVal('topicChips');
  const question = $('taroQ').value.trim();
  const useRev = $('revToggle').checked;
  const deckIdx = shuffledIdx(TAROT_CARDS.length).slice(0, 12);
  const rnd = new Uint32Array(12);
  crypto.getRandomValues(rnd);
  tarotState = {
    count, topic, question, useRev,
    cards: deckIdx.map((ci, i) => ({ card: TAROT_CARDS[ci], rev: useRev && (rnd[i] % 100) < 40 })),
    picked: [], flipped: 0,
  };
  $('tarotReading').innerHTML = '';
  $('pickNeed').textContent = count;
  $('pickTotal').textContent = count;
  $('pickCount').textContent = '0';

  const fan = $('cardFan');
  fan.classList.add('shuffling');
  fan.innerHTML = tarotState.cards.map((d, i) => `
    <div class="tcard" data-i="${i}"><div class="tcard-inner">
      <div class="tface tback"><div><div class="bpat">✦</div><div class="btxt">TAROT</div></div></div>
      <div class="tface tfront${d.rev ? ' is-rev' : ''}"><div class="face-rot">${tarotFaceHTML(d.card)}</div></div>
    </div></div>`).join('');
  fan.querySelectorAll('.tcard').forEach(el =>
    el.addEventListener('click', () => pickCard(+el.dataset.i)));
  setTimeout(() => fan.classList.remove('shuffling'), 1600);

  $('pickStage').classList.remove('hidden');
  setStep(2);
  $('pickStage').scrollIntoView({ behavior:'smooth', block:'center' });
});

function pickCard(i){
  const st = tarotState;
  if(!st || st.picked.includes(i) || st.picked.length >= st.count) return;
  st.picked.push(i);
  const el = document.querySelector(`#cardFan .tcard[data-i="${i}"]`);
  el.classList.add('picked');
  $('pickCount').textContent = st.picked.length;
  if(st.picked.length === st.count){
    document.querySelectorAll('#cardFan .tcard:not(.picked)').forEach(x => x.classList.add('dim'));
    setTimeout(revealPicked, 500);
  }
}

function revealPicked(){
  const st = tarotState;
  const els = st.picked.map(i => document.querySelector(`#cardFan .tcard[data-i="${i}"]`));
  els.forEach((el, k) => setTimeout(() => {
    el.classList.add('flipped');
    st.flipped++;
    setTimeout(() => renderOneReading(k), 420);
  }, k * 550));
  setTimeout(() => {
    setStep(3);
    const w = document.createElement('div');
    w.className = 'taro-actions';
    w.innerHTML = `<button class="btn-ghost" id="rePickBtn">다시 고르기</button>`;
    $('tarotReading').appendChild(w);
    $('rePickBtn').addEventListener('click', () => {
      $('pickStage').classList.add('hidden');
      $('tarotReading').innerHTML = '';
      setStep(1);
      $('tarot').scrollIntoView({ behavior:'smooth' });
    });
    w.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }, st.count * 550 + 900);
}

function renderOneReading(k){
  const st = tarotState;
  const i = st.picked[k];
  const d = st.cards[i], c = d.card;
  const pos = TAROT_POS[st.count][k];
  const div = document.createElement('div');
  div.className = 'treading';
  div.innerHTML =
    `<div class="r-head"><span class="r-pos">${pos}</span>` +
    `<span class="r-topic">${esc(st.topic)}${st.question ? ' · ' + esc(st.question.slice(0, 30)) : ''}</span>` +
    `<span class="r-name">${c.name}</span>` +
    `<span class="r-dir${d.rev ? ' reversed' : ''}">${d.rev ? '역방향' : '정방향'}</span></div>` +
    `<div class="r-key">${c.key}</div><div class="r-text">${d.rev ? c.rev : c.up}</div>`;
  // 완료 버튼보다 앞에 삽입
  const actions = $('tarotReading').querySelector('.taro-actions');
  if(actions) $('tarotReading').insertBefore(div, actions);
  else $('tarotReading').appendChild(div);
  div.scrollIntoView({ behavior:'smooth', block:'nearest' });
}
})();
