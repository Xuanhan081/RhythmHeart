AOS.init({
        offset: 100, // offset (in px) from the original trigger point
        delay: 0, // values from 0 to 3000, with step 50ms
        duration: 1800 // values from 0 to 3000, with step 50ms
      })

//------------------------------------------------------------------------------------------------------身理健康指標雷達圖
//參考https://www.chartjs.org/docs/latest/axes/radial/
    window.addEventListener('DOMContentLoaded', () => {
        const radarData = {
            labels: [
                ["活力指標", "Vitality Index"],
                ["身心平衡指標", "Mind-Body","Balance Index"],
                ["血壓指標", "Blood Pressure Index"],
                ["血管彈性指標", "Vascular Elasticity Index"],
                ["放鬆指標", "Relaxation Index"]
            ],
            datasets: [{
            label: "綜合表現 / Overall (Max 100)",
            data: [
                85,
                35,
                50,
                19,
                80
            ],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            pointBackgroundColor: "rgba(54, 162, 235, 1)"
            }]
        };
    
        // ⬇️ 1. 產生 Chart.js 雷達圖

        // 根據視窗寬度動態決定字體大小
        let labelFontSize = 22;
        if (window.innerWidth < 385) {        // Bootstrap 的手機斷點
        labelFontSize = 10;
        } else if (window.innerWidth < 576) { // 平板
        labelFontSize = 12;
        }else if (window.innerWidth < 768) { // 平板
        labelFontSize = 15;
        }else if (window.innerWidth < 926) { // 中螢幕
        labelFontSize = 18;
        }
    
        //上雷達圖背景色-->plugins
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

        //設定雷達間距-->參考https://www.chartjs.org/docs/latest/axes/radial/
        const config = {
            type: 'radar',
            data: radarData,
            options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 18
                        }
                    }
                }
            },
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
            },
            plugins: [radarBackgroundPlugin]
        };
    
        const ctx = document.getElementById('radarChart');
        new Chart(ctx, config);

        // ------------------------------------------------------------------------------------------------------更新每個卡片的數值與 SVG 繪製
        function animateCardProgress(card, percent) {
            const knob = card.querySelector('.knob_data');
            const circle = card.querySelector('.progress-ring');

            // 更新數字（可視需要加入 %）
            knob.innerHTML = `${percent}<span class="fs-6">%</span>`;

            if (circle) {
                const totalLength = circle.getTotalLength();
                circle.style.strokeDasharray = totalLength;
                circle.style.strokeDashoffset = totalLength; // 初始化為 100%

                // 延遲觸發動畫
                requestAnimationFrame(() => {
                    circle.style.transition = 'stroke-dashoffset 1s ease-out';
                    circle.style.strokeDashoffset = totalLength * (1 - percent / 200);
                });

                // 從底部畫起
                const cx = circle.getAttribute("cx");
                const cy = circle.getAttribute("cy");
                circle.setAttribute("transform", `rotate(180 ${cx} ${cy})`);
            }
        };
        const cards = document.querySelectorAll('.panel-index');
        const values = radarData.datasets[0].data;
        const observed = new Set(); // 防止重複動畫

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const index = Array.from(cards).indexOf(card);
                    if (!observed.has(card) && index >= 0) {
                        animateCardProgress(card, values[index]);
                        observed.add(card);
                    }
                }
            });
        }, {
            root: null,
            threshold: 0.6 // 元素 60% 進入畫面才觸發
        });

        cards.forEach(card => observer.observe(card));

    });



    //------------------------------------------------------------------------------------------------------神經指標
    const canvas = document.getElementById("targetChart");
    const ctx = canvas.getContext("2d");

    // 圓心座標
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radii = [50, 100, 200];  // 三層圓半徑
    const colors = ['#febbad', '#fedcad', '#c7ebd5']; // 中 → 外

    // 畫同心圓
    for (let i = radii.length - 1; i >= 0; i--) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radii[i], 0, Math.PI * 2);
    ctx.fillStyle = colors[i];
    ctx.fill();
    //ctx.stroke(); 同心圓框線
    }

    // 畫 X 軸
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // 畫 Y 軸
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    //------------------------------------------------------------------------------------------------------星星座標函式
    
    function placeStar(x, y) {
    const container = document.querySelector('.target-container');

    // canvas 實際尺寸（根據響應式變化）
    let canvasSize = 600;
    let scale = 2; // 邏輯座標 100 -> 實際像素 200px
    if (window.innerWidth < 385) {        // 手機
        canvasSize = 300;
        scale = 1;
    } 
    else if (window.innerWidth < 576) { // 平板
        canvasSize = 400;
        scale = 4/3;
    }
    else if (window.innerWidth < 768) { // 平板
        canvasSize = 500;
        scale = 5/3;
    }

    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;

    // 將邏輯座標轉換為畫面 pixel 座標
    const pixelX = centerX + x * scale + 14.5;
    const pixelY = centerY - y * scale - 8; // Y 軸反轉

    // 建立星星元素⭐
    const starSize = 28; // 根據實際圖示大小調整
    const star = document.createElement('label');
    star.className = 'star';
    star.innerHTML = '<i class="bi bi-star-fill"></i>';
    star.style.left = `${pixelX - starSize / 2}px`;
    star.style.top = `${pixelY - starSize / 2}px`;

    container.appendChild(star);

    // 📏 建立線條
    const line = document.createElement('div');
    line.className = 'center-line';

    // 計算線長與角度
    const dx = pixelX- starSize / 2 - centerX;
    const dy = pixelY- centerY + 8;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // 設定線的樣式與位置
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = `${centerX}px`;
    line.style.top = `${centerY}px`;

    container.appendChild(line);
    }

    placeStar(25,100);
