(() => {
    // 数字滚动动画类
    class NumberCounter {
        constructor(element) {
            this.element = element;
            this.target = parseInt(element.getAttribute('data-target')) || 0;
            this.current = 0;
            this.display = element.querySelector('.rstheme_8dK3a-number-display');
            this.duration = 2000;
            this.hasAnimated = false;
        }

        animate() {
            if (this.hasAnimated) return;
            this.hasAnimated = true;

            const startTime = Date.now();
            const startValue = 0;
            const endValue = this.target;
            let lastDisplayValue = 0;

            const updateNumber = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.duration, 1);

                // 使用线性变化，实现匀速效果
                const calculatedValue = startValue + (endValue - startValue) * progress;
                
                // 使用 Math.round 并确保数字始终递增
                this.current = Math.round(calculatedValue);
                
                // 确保数字单调递增，避免出现倒退
                if (this.current > lastDisplayValue) {
                    this.display.textContent = this.current;
                    lastDisplayValue = this.current;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    // 确保最终显示目标值
                    this.display.textContent = endValue;
                }
            };

            requestAnimationFrame(updateNumber);
        }
    }

    // 入口函数
    function main() {
        const containers = document.querySelectorAll('.rstheme_8dK3a');
        
        containers.forEach(container => {
            const numberElements = container.querySelectorAll('.rstheme_8dK3a-number-scroll');
            const counters = Array.from(numberElements).map(el => new NumberCounter(el));

            const observerOptions = {
                threshold: 0.3,
                rootMargin: '0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const index = Array.from(numberElements).indexOf(entry.target);
                        if (index !== -1) {
                            counters[index].animate();
                        }
                    }
                });
            }, observerOptions);

            numberElements.forEach(element => {
                observer.observe(element);
            });
        });
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();
