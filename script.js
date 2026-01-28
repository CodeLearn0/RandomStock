const result = document.getElementById("result");

document.getElementById("btn-kospi").onclick = () => {
    pickRandomStock("KOSPI200");
};

document.getElementById("btn-sp500").onclick = () => {
    pickRandomStock("SP500");
};

function pickRandomStock(market) {
    const list = market === "KOSPI200" ? KOSPI200 : SP500;
    const stock = list[Math.floor(Math.random() * list.length)];

    // 화면 반영
    document.getElementById("company-name").innerText =
        `${stock.name} (${stock.ticker})`;

    document.getElementById("company-market").innerText = market;

    // 임시 가격 (다음 단계에서 실제 주가로 교체)
    document.getElementById("company-price").innerText =
        "현재가: 불러오는 중...";

    result.classList.remove("hidden");
}
