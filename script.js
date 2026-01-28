// =========================
// DOM
// =========================
const result = document.getElementById("result");
const btnSP500 = document.getElementById("btn-sp500");

// =========================
// 이벤트
// =========================
btnSP500.addEventListener("click", pickRandomSP500);

// =========================
// 메인 로직
// =========================
async function pickRandomSP500() {
    const stock = SP500[Math.floor(Math.random() * SP500.length)];

    // UI 초기화
    document.getElementById("company-name").innerText =
        `${stock.name} (${stock.ticker})`;
    document.getElementById("company-market").innerText = "S&P500";
    document.getElementById("company-price").innerText =
        "현재가 불러오는 중...";

    document.getElementById("company-summary").innerText = "분석 중...";
    document.getElementById("summary-points").innerHTML = "";

    result.classList.remove("hidden");

    try {
        const res = await fetch(
            `https://randomstock.bjo999.workers.dev/?symbol=${stock.ticker}`,
            { cache: "no-store" }
        );

        if (!res.ok) throw new Error("네트워크 오류");

        const data = await res.json();
        const info = data?.symbols?.[0];

        if (!info || !info.open || !info.close || !info.high || !info.low || !info.volume) {
            throw new Error("가격 데이터 누락");
        }

        // 숫자 변환
        const open = Number(info.open);
        const close = Number(info.close);
        const high = Number(info.high);
        const low = Number(info.low);
        const volume = Number(info.volume);

        // 계산
        const change = close - open;
        const percent = (change / open) * 100;       // 숫자
        const percentText = percent.toFixed(2);      // 문자열
        const sign = change >= 0 ? "+" : "";

        // 가격 표시
        document.getElementById("company-price").innerText =
            `현재가: $${close} (${sign}${percentText}%)`;

        // 공포·탐욕 지수
        const fearGreed = calculateFearGreed(percent, volume);
        updateSentiment(fearGreed);

        // 기업 요약
        const summary = generateCompanySummary(
            stock.name,
            percent,
            open,
            high,
            low,
            volume
        );
        document.getElementById("company-summary").innerText = summary;

        // 요약 포인트
        const points = generateSummaryPoints(percent, fearGreed, volume);
        renderSummaryPoints(points);

    } catch (err) {
        console.error(err);
        document.getElementById("company-price").innerText =
            "가격 정보를 불러오지 못했습니다.";
    }
}

// =========================
// 공포·탐욕 계산
// =========================
function calculateFearGreed(changePercent, volume) {
    let priceScore = 30 + changePercent * 6;
    priceScore = Math.max(0, Math.min(60, priceScore));

    let volumeScore = (volume / 50_000_000) * 40;
    volumeScore = Math.max(0, Math.min(40, volumeScore));

    return Math.round(priceScore + volumeScore);
}

// =========================
// 공포·탐욕 시각화
// =========================
function updateSentiment(score) {
    const bar = document.getElementById("fg-bar");
    const scoreEl = document.getElementById("fg-score");
    const textEl = document.getElementById("fg-text");
    const descEl = document.getElementById("fg-desc");

    if (!bar || !scoreEl || !textEl || !descEl) return;

    bar.style.width = `${score}%`;
    scoreEl.innerText = score;

    let text = "😐 중립";
    if (score >= 75) text = "😈 극단적 탐욕";
    else if (score >= 60) text = "🔥 탐욕";
    else if (score >= 40) text = "😐 중립";
    else if (score >= 25) text = "😨 공포";
    else text = "🥶 극단적 공포";

    textEl.innerText = text;
    descEl.innerText =
        "📌 역사적으로 보면\n" + fearGreedHistoryText(score);
}

// =========================
// 역사적 해석 문구
// =========================
function fearGreedHistoryText(score) {
    if (score >= 80)
        return "단기 과열 이후 조정이 자주 나타났던 구간입니다.";
    if (score >= 65)
        return "낙관 심리가 강해지며 변동성이 커질 수 있는 구간입니다.";
    if (score >= 45)
        return "시장 심리가 비교적 안정적인 구간입니다.";
    if (score >= 25)
        return "불안 심리가 커지며 반등 시도가 나타나기도 합니다.";
    return "과거에는 이 구간에서 반등이 시작되는 경우가 많았습니다.";
}

// =========================
// 기업 요약 생성
// =========================
function generateCompanySummary(name, percent, open, high, low, volume) {
    const direction = percent >= 0 ? "상승" : "하락";
    const rangeRatio = (high - low) / open;

    const volatility =
        rangeRatio > 0.03 ? "큰 편" :
        rangeRatio > 0.015 ? "보통" : "안정적";

    const interest =
        volume > 50_000_000 ? "높은" :
        volume < 10_000_000 ? "낮은" : "보통";

    return `${name}은 오늘 ${direction} 마감했습니다.
장중 변동폭은 ${volatility} 수준이었으며,
거래량은 ${interest} 편으로
시장 관심도를 가늠할 수 있습니다.`;
}

// =========================
// 요약 포인트
// =========================
function generateSummaryPoints(percent, fearGreed, volume) {
    return [
        `• 단기 흐름: ${percent >= 0 ? "상승" : "하락"}`,
        `• 변동성: ${Math.abs(percent) > 3 ? "높음" : Math.abs(percent) > 1 ? "보통" : "낮음"}`,
        `• 수급 관심도: ${volume > 50_000_000 ? "높음" : volume < 10_000_000 ? "낮음" : "보통"}`,
        `• 심리 구간: ${fearGreed >= 60 ? "탐욕" : fearGreed >= 40 ? "중립" : "공포"}`
    ];
}

function renderSummaryPoints(points) {
    const container = document.getElementById("summary-points");
    container.innerHTML = "";
    points.forEach(text => {
        const div = document.createElement("div");
        div.innerText = text;
        container.appendChild(div);
    });
}
