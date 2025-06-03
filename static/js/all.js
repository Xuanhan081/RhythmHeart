
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


// 模擬後端提供的資料 (未來可透過 fetch 從 C# API 拿 JSON)
    window.addEventListener('DOMContentLoaded', () => {
    const radarData = {
        labels: ["血壓<br>指標", "神經活動<br>指標", "身心平衡<br>指標", "壓力<br>指標", "血管彈性<br>指標"],
        datasets: [{
        label: "綜合表現",
        data: [0, 25, 50, 75, 100],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        pointBackgroundColor: "rgba(54, 162, 235, 1)"
        }]
    };

    // ⬇️ 1. 產生 Chart.js 雷達圖

    // 根據視窗寬度動態決定字體大小
    let labelFontSize = 25;
    if (window.innerWidth < 576) {        // Bootstrap 的手機斷點
    labelFontSize = 14;
    } else if (window.innerWidth < 768) { // 平板
    labelFontSize = 16;
    }
    //上背景色
    const radarBackgroundPlugin = {
    id: 'radarBackgroundPlugin',
    beforeDraw(chart) {
        const { ctx, scales } = chart;
        const scale = scales.r;

        const centerX = scale.xCenter;
        const centerY = scale.yCenter;
        const radius = scale.drawingArea;

        const steps = [20, 40, 100];
        const colors = ['#febbad', '#fedcad', '#c7ebd5'];

        const pointCount = chart.data.labels.length;
        const angleStep = (Math.PI * 2) / pointCount;

        ctx.save();

        steps.forEach((step, i) => {
        const innerR = i === 0 ? 0 : (steps[i - 1] / 100) * radius;
        const outerR = (step / 100) * radius;

        // 建立單獨的路徑來定義該區段
        ctx.beginPath();

        // 外五邊形（順時針）
        for (let j = 0; j < pointCount; j++) {
            const angle = j * angleStep - Math.PI / 2;
            const x = centerX + outerR * Math.cos(angle);
            const y = centerY + outerR * Math.sin(angle);
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // 內五邊形（逆時針）
        ctx.moveTo(
            centerX + innerR * Math.cos(-Math.PI / 2),
            centerY + innerR * Math.sin(-Math.PI / 2)
        );
        for (let j = 0; j < pointCount; j++) {
            const angle = j * angleStep - Math.PI / 2;
            const x = centerX + innerR * Math.cos(angle);
            const y = centerY + innerR * Math.sin(angle);
            ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.fillStyle = colors[i];
        ctx.fill("evenodd"); // ⬅️ 用 evenodd 模式區分內外形狀
        });

        ctx.restore();
    }
    };



    console.log('radarBackgroundPlugin:', radarBackgroundPlugin);

    //設定雷達間距
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
                callback: function(label) {
                    // 把 <br> 轉成多行（Chart.js v3+ 支援 return array）
                    return label.split("<br>");
                },
                font: {
                size: labelFontSize
                }
            }
            }
        }
        },
        plugins: [radarBackgroundPlugin]
    };
    
    const ctx = document.getElementById('radarChart');
    new Chart(ctx, config);

    // ⬇️ 3. 更新每個卡片的數值與 SVG 繪製
    const cards = document.querySelectorAll('.panel-index');
    const values = radarData.datasets[0].data;

    cards.forEach((card, index) => {
            const percent = values[index];
            const knob = card.querySelector('.knob_data');
            const circle = card.querySelector('.progress-ring');

            // 更新顯示數字
            knob.innerHTML = `${percent}<span class="txt_smaller">%</span>`;

            // 畫 SVG 環形進度
            if (circle) {
            const totalLength = circle.getTotalLength();
            circle.style.strokeDasharray = totalLength;
            circle.style.strokeDashoffset = totalLength * (1 - percent / 100);
            }
        });
    });

