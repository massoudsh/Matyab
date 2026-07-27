# Epic 10 — پیام‌رسانی و لایه‌ی اعتماد
لیبل: `epic`, `v1`, `backend`, `frontend`

---
### ISSUE-1001: مدل داده‌ی Message (پیام درون‌اپ)
**معیار پذیرش:**
- [ ] پیام بین دو کاربر مرتبط با یک Match

---
### ISSUE-1002: API ارسال/دریافت پیام
**معیار پذیرش:**
- [ ] `GET/POST /matches/:id/messages`
- [ ] شماره‌ی تماس فقط بعد از پذیرش دو طرف نمایش داده شود

---
### ISSUE-1003: مدل داده‌ی Transaction و Review
**معیار پذیرش:**
- [ ] `Transaction`: قیمت نهایی، کمیسیون، وضعیت
- [ ] `Review`: امتیاز و نظر بعد از معامله

---
### ISSUE-1004: API ثبت معامله و نظر
**معیار پذیرش:**
- [ ] `POST /transactions` روی یک Match پذیرفته‌شده
- [ ] `POST /transactions/:id/review`

---
### ISSUE-1005: صفحه‌ی چت درون‌اپ در فرانت
**لیبل:** `frontend`

---
### ISSUE-1006: نمایش امتیاز اعتماد کاربر (trust score) در پروفایل
**لیبل:** `frontend`, `backend`
