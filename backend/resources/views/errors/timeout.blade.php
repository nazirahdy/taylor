<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error 504 - Waktu Habis</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f4f6f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 24px;
        }
        .card {
            background: #ffffff;
            max-width: 460px;
            width: 100%;
            border-radius: 20px;
            padding: 40px 36px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
            border: 1px solid #eef1ef;
        }
        .icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 20px;
            border-radius: 50%;
            background: #fef3e7;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .icon svg { width: 32px; height: 32px; color: #d97706; }
        .code {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.1em;
            color: #79D12A;
            background: #eefbe4;
            padding: 4px 12px;
            border-radius: 999px;
            margin-bottom: 14px;
        }
        h1 {
            font-size: 22px;
            margin: 0 0 12px;
            color: #1f2937;
        }
        p {
            font-size: 14px;
            line-height: 1.6;
            color: #6b7280;
            margin: 0 0 28px;
        }
        a.btn {
            display: inline-block;
            background: #79D12A;
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            padding: 14px 28px;
            border-radius: 12px;
            transition: filter 0.2s;
        }
        a.btn:hover { filter: brightness(1.05); }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <span class="code">ERROR 504</span>
        <h1>Waktu Proses Habis</h1>
        <p>Server membutuhkan waktu terlalu lama untuk memproses permintaan ini. Silakan coba beberapa saat lagi.</p>
        <a href="{{ url()->previous() ?: '/' }}" class="btn">Coba Lagi</a>
    </div>
</body>
</html>
