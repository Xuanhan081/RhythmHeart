
    // fetch('static/js/chart.json')
    // .then(res => res.json())
    // .then(data => {
    //     const radarData = {
    //     labels: data.labels,
    //     datasets: [{
    //         label: "使用者評分",
    //         data: data.scores,
    //         backgroundColor: "rgba(54, 162, 235, 0.2)",
    //         borderColor: "rgba(54, 162, 235, 1)",
    //         pointBackgroundColor: "rgba(54, 162, 235, 1)"
    //     }]
    //     };

// 根據視窗寬度動態決定字體大小
let labelFontSize = 14;
if (window.innerWidth < 576) {        // Bootstrap 的手機斷點
  labelFontSize = 10;
} else if (window.innerWidth < 768) { // 平板
  labelFontSize = 12;
}
// 模擬後端提供的資料 (未來可透過 fetch 從 C# API 拿 JSON)
    window.addEventListener('DOMContentLoaded', () => {
    const radarData = {
        labels: ["血壓指標", "神經活動指標", "身心平衡指標", "壓力指標", "血管彈性指標"],
        datasets: [{
        label: "綜合表現",
        data: [0, 25, 50, 75, 100],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        pointBackgroundColor: "rgba(54, 162, 235, 1)"
        }]
    };

    // ⬇️ 1. 產生 Chart.js 雷達圖
    const labelFontSize = window.innerWidth < 576 ? 10 : (window.innerWidth < 768 ? 12 : 14);

    const config = {
        type: 'radar',
        data: radarData,
        options: {
        responsive: true,
        scales: {
            r: {
            min: 0,
            max: 100,
            ticks: {
                stepSize: 20,
                backdropColor: "transparent"
            },
            pointLabels: {
                font: {
                size: labelFontSize
                }
            }
            }
        }
        }
    };

    const ctx = document.getElementById('radarChart');
    new Chart(ctx, config);

    // ⬇️ 2. 更新每個卡片的數值與 SVG 繪製
    const cards = document.querySelectorAll('.panel-index');
    const values = radarData.datasets[0].data;

    cards.forEach((card, index) => {
            const percent = values[index];
            const knob = card.querySelector('.knob_data');
            const circle = card.querySelector('.progress-ring');

            // 更新顯示數字
            knob.innerHTML = `${percent}<span class="txt_smaller">%</span>`;

            // 畫 SVG 環形進度
            console.log('circle:', circle);
            if (circle) {
            const totalLength = circle.getTotalLength();
            circle.style.strokeDasharray = totalLength;
            circle.style.strokeDashoffset = totalLength * (1 - percent / 100);
            }
        });
    });

