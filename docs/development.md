# اجرای محیط و استقرار

## پیش‌نیازها

برای توسعه، نسخهٔ Node.js 20 و PostgreSQL لازم است. در هر سرویس ابتدا فایل `.env.example` را به `.env` کپی و مقادیر محیط اجرا را تنظیم کنید. فایل‌های `.env` نباید commit شوند.

## دیتابیس

`backend/prisma/schema.prisma` تنها منبع مدل داده است. migrationهای ثبت‌شده را روی دیتابیس هدف اجرا کنید:

```bash
cd backend
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
```

دستور seed با `upsert` اجرا می‌شود و تکرارش دسته‌ها را تکراری نمی‌کند. pgvector فعلاً نصب یا فعال نمی‌شود، چون هیچ مدل Prisma به ستون vector وابسته نیست.

## بررسی کیفیت

```bash
cd backend && npm run typecheck && npm run lint
cd frontend && npm run typecheck && npm run lint
```

گردش‌کار GitHub Actions همین چهار بررسی را برای هر pull request و تغییرات شاخهٔ `main` اجرا می‌کند.

## build و health check

buildهای سنگین را فقط روی سرور SSH اجرا کنید؛ کانتینر توسعه برای آن مناسب نیست. پس از انتقال کد و تنظیم متغیرهای محیطی روی سرور:

```bash
cd backend
npm ci
npm run prisma:deploy
npm run prisma:seed
npm run build
npm start
```

بررسی سلامت backend مستقل از دیتابیس است و باید پاسخ JSON زیر را برگرداند:

```bash
curl --fail http://127.0.0.1:4000/health
# {"status":"ok","service":"matyab-backend"}
```
