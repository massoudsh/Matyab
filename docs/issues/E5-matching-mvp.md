# Epic 5 — مچینگ عرضه/تقاضا (نسخه‌ی اول، rule-based)
لیبل: `epic`, `mvp`, `backend`, `db`

---
### ISSUE-501: مدل داده‌ی Match
**معیار پذیرش:**
- [ ] فیلدها: `listingId`, `requestId`, امتیاز تطابق، وضعیت (`SUGGESTED`, `ACCEPTED`, `REJECTED`)

---
### ISSUE-502: الگوریتم rule-based مچینگ
**شرح:** برای هر Request جدید، Listing های هم‌دسته و هم‌منطقه را پیدا کند و امتیاز بدهد.
**معیار پذیرش:**
- [ ] معیار امتیاز: تطابق دسته (اجباری) + هم‌پوشانی مقدار + فاصله‌ی جغرافیایی
- [ ] اجرا هنگام ثبت Listing/Request جدید (trigger ساده، نه cron)

---
### ISSUE-503: API دریافت match های پیشنهادی
**معیار پذیرش:**
- [ ] `GET /matches?requestId=` و `GET /matches?listingId=`
- [ ] `POST /matches/:id/accept` و `/reject`

---
### ISSUE-504: نمایش match در فرانت
**لیبل:** `frontend`
**معیار پذیرش:**
- [ ] کارت پیشنهاد با دلیل ساده («هم‌دسته، فاصله ۱۲ کیلومتر»)
- [ ] دکمه‌ی پذیرش/رد
