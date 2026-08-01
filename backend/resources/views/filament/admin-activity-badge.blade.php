<script>
(function () {
    const endpoint = @json(route('admin.activity-count'));
    const originalTitle = document.title.replace(/^\(\d+\)\s*/, '');
    const faviconLink = document.querySelector('link[rel="icon"]');

    let baseImageLoaded = false;
    const baseImage = new Image();
    if (faviconLink) {
        baseImage.onload = () => { baseImageLoaded = true; };
        baseImage.src = faviconLink.href;
    }

    function setBadge(count) {
        document.title = count > 0 ? `(${count}) ${originalTitle}` : originalTitle;

        if (!faviconLink || !baseImageLoaded) return;

        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(baseImage, 0, 0, size, size);

        if (count > 0) {
            const radius = 20;
            const cx = size - radius;
            const cy = radius;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#e11d48';
            ctx.fill();

            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(count > 99 ? '99+' : String(count), cx, cy + 1);
        }

        faviconLink.href = canvas.toDataURL('image/png');
    }

    function poll() {
        fetch(endpoint, { headers: { Accept: 'application/json' } })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data && typeof data.count === 'number') setBadge(data.count);
            })
            .catch(() => {});
    }

    poll();
    setInterval(poll, 15000);
})();
</script>
