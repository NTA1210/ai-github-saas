# Cách 1: AssemblyAI Webhook

## Flow

```
[Client]                [Next.js]              [AssemblyAI]
    |                       |                       |
    |-- POST /issues -----→ |                       |
    |                       |-- submit audio ------→|
    |                       |   + webhook_url        |
    |←--- 202 Accepted ----  |                      |
    |   (trả về ngay lập tức)|                      |
    |                       |    (xử lý background) |
    |                       |                       |
    |                       |←-- POST /webhook ---- | (vài phút sau)
    |                       |   transcript done!    |
    |                       |-- lưu issues vào DB   |
    |                       |-- update COMPLETED    |
```

## Ưu điểm

- Không bị timeout (AssemblyAI tự gọi lại khi xong)
- Không cần thư viện bổ sung
- Hoạt động ngay cả khi user đóng tab

## Nhược điểm

- Cần domain PUBLIC để AssemblyAI gọi webhook (không test được localhost dễ dàng)
- Cần dùng ngrok/cloudflare tunnel khi dev local
- Cần bảo mật webhook (verify secret)

## Setup

1. Set env: `ASSEMBLY_AI_WEBHOOK_SECRET=your_secret`
2. Set env: `NEXT_PUBLIC_APP_URL=https://your-domain.com`
3. Dùng `ngrok http 3000` khi dev local
