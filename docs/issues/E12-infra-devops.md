# Epic 12 — زیرساخت و DevOps
لیبل: `epic`, `mvp`, `backend`

---
### ISSUE-1201: راه‌اندازی مخزن و اسکلت backend/frontend
**معیار پذیرش:**
- [ ] ساختار پوشه مطابق `docs/wiki/Architecture.md`
- [ ] `.env.example` برای هر دو سرویس

---
### ISSUE-1202: راه‌اندازی PostgreSQL + Prisma migration
**معیار پذیرش:**
- [ ] `prisma migrate dev` روی محیط توسعه اجرا شود (روی سرور، نه داخل کانتینر)
- [ ] فعال‌سازی افزونه‌ی `pgvector`

---
### ISSUE-1203: راه‌اندازی Redis برای کش و صف
**معیار پذیرش:**
- [ ] اتصال backend به Redis برای کش دسته‌ها و صف quality scoring

---
### ISSUE-1204: تنظیم CI پایه (lint + typecheck)
**معیار پذیرش:**
- [ ] اجرای `tsc --noEmit` و lint روی هر PR (بدون build سنگین)

---
### ISSUE-1205: مستندسازی متغیرهای محیطی
**معیار پذیرش:**
- [ ] فهرست کامل env var های لازم در `backend/.env.example` و `frontend/.env.example`
