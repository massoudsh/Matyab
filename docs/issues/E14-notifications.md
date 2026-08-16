# Epic 14 — اعلان درون‌اپ (In-App Notifications)
لیبل: `epic`, `v1`, `backend`, `frontend`, `db`

مسئله: طبق roadmap فاز ۱/۲، کاربر باید وقتی مصالح مورد نیازش پیدا شد یا یک قلم تأمین وارد وضعیت بحرانی شد
مطلع شود — بدون این لایه، کاربر باید مدام صفحات را چک کند. این Epic همچنین شکاف قدیمی `ISSUE-502`
(«مچینگ باید هنگام ثبت درخواست trigger شود» که تا امروز فقط TODO بود) را می‌بندد.

---
### ISSUE-1401: مدل داده‌ی Notification
**معیار پذیرش:**
- [x] فیلدها: کاربر، نوع (`MATCH_FOUND` / `PROCUREMENT_CRITICAL`)، عنوان، متن، `refType`/`refId`، وضعیت خوانده‌شده
- [x] `backend/prisma/schema.prisma` + `db/schema.sql`

---
### ISSUE-1402: trigger شدن مچینگ هنگام ثبت درخواست (بستن ISSUE-502)
**شرح:** بعد از `POST /requests`، الگوریتم مچینگ بلافاصله روی درخواست جدید اجرا شود؛ خطای مچینگ نباید ثبت
درخواست را fail کند.
**معیار پذیرش:**
- [x] `requests.service.ts` → `createRequest` بعد از ساخت رکورد، `generateMatchesForRequest` را صدا می‌زند (fire-and-forget با catch)

---
### ISSUE-1403: اعلان MATCH_FOUND
**شرح:** وقتی `generateMatchesForRequest` حداقل یک match جدید بسازد، برای مالک پروژه‌ی درخواست یک اعلان ساخته شود.
**معیار پذیرش:**
- [x] `matching.service.ts` بعد از ساخت match(ها) یک `Notification` با `refType="material_request"` می‌سازد

---
### ISSUE-1404: اعلان PROCUREMENT_CRITICAL
**شرح:** وقتی `procurementRiskReport` یک قلم BOQ را `CRITICAL` تشخیص دهد، برای مالک پروژه اعلان ساخته شود —
با dedupe روی `refId` تا هر بار محاسبه‌ی مجدد گزارش، اعلان تکراری نسازد.
**معیار پذیرش:**
- [x] `procurement.service.ts` → `createNotificationOnce` با `refType="boq_item"`

---
### ISSUE-1405: API اعلان‌ها
**معیار پذیرش:**
- [x] `GET /notifications`, `GET /notifications?unreadOnly=true`
- [x] `GET /notifications/unread-count`
- [x] `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`

---
### ISSUE-1406: نمایش اعلان در فرانت
**لیبل:** `frontend`
**معیار پذیرش:**
- [x] `NotificationBell` در نویگیشن اصلی با شمارنده‌ی خوانده‌نشده (poll هر ۳۰ ثانیه)
- [x] صفحه‌ی `/notifications` با لیست، لینک به مقصد مرتبط، و «علامت‌گذاری همه به‌عنوان خوانده‌شده»

---
### ISSUE-1407: کانال‌های اعلان آینده (خارج از scope این Epic)
**شرح:** فعلاً فقط اعلان درون‌اپ (in-app) پیاده‌سازی شده. SMS/push/ایمیل نیاز به سرویس ارسال و تنظیمات
اپت-این دارد — در فاز بعدی طبق ترجیح کاربر (`User.notificationChannel` احتمالی) اضافه می‌شود.
**وضعیت:** backlog، بدون معیار پذیرش قطعی هنوز.
