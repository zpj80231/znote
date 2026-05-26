(function () {
    var words = ["富强", "民主", "文明", "和谐", "自由", "平等", "公正", "法治", "爱国", "敬业", "诚信", "友善"];
    var idx = 0;

    function randomChannel() {
        return Math.floor(Math.random() * 256);
    }

    document.body.addEventListener('click', function (e) {
        var span = document.createElement('span');
        span.textContent = words[idx];
        idx = (idx + 1) % words.length;

        var x = e.pageX;
        var y = e.pageY;

        Object.assign(span.style, {
            zIndex: '999999',
            position: 'absolute',
            top: (y - 20) + 'px',
            left: x + 'px',
            fontWeight: 'bold',
            color: 'rgb(' + randomChannel() + ',' + randomChannel() + ',' + randomChannel() + ')',
            userSelect: 'none',
            cursor: 'default',
            pointerEvents: 'none',
            opacity: '1',
            transition: 'top 1.5s linear, opacity 1.5s linear'
        });

        document.body.appendChild(span);

        // 等两帧触发 transition，避免与初始样式合批
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                span.style.top = (y - 180) + 'px';
                span.style.opacity = '0';
            });
        });

        setTimeout(function () {
            if (span.parentNode) span.parentNode.removeChild(span);
        }, 1500);
    });
})();
