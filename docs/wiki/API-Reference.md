# مرجع API (پیش‌نویس MVP)

Base URL: `/api/v1`
احراز هویت: JWT در هدر `Authorization: Bearer <token>`

## Auth
| Method | Path | توضیح |
|---|---|---|
| POST | `/auth/register` | ثبت‌نام (نقش: contractor/supplier) |
| POST | `/auth/login` | ورود |
| GET  | `/auth/me` | اطلاعات کاربر جاری |

## Projects
| Method | Path | توضیح |
|---|---|---|
| GET  | `/projects` | لیست پروژه‌های کاربر |
| POST | `/projects` | ساخت پروژه‌ی جدید |
| GET  | `/projects/:id` | جزئیات پروژه |

## Listings (عرضه)
| Method | Path | توضیح |
|---|---|---|
| GET  | `/listings` | جست‌وجو/فیلتر آگهی‌ها (دسته، شهر، بازه‌ی قیمت) |
| POST | `/listings` | ثبت آگهی جدید |
| GET  | `/listings/:id` | جزئیات آگهی + quality score + price suggestion |
| PATCH| `/listings/:id` | ویرایش/تغییر وضعیت |

## Requests (تقاضا)
| Method | Path | توضیح |
|---|---|---|
| GET  | `/requests` | لیست درخواست‌ها |
| POST | `/requests` | ثبت درخواست جدید |
| GET  | `/requests/:id` | جزئیات درخواست |

## Matching
| Method | Path | توضیح |
|---|---|---|
| GET  | `/matches?requestId=` | پیشنهادهای match برای یک درخواست |
| GET  | `/matches?listingId=` | پیشنهادهای match برای یک آگهی |
| POST | `/matches/:id/accept` | پذیرش match توسط یک طرف |
| POST | `/matches/:id/reject` | رد match |

## Pricing & Quality (AI)
| Method | Path | توضیح |
|---|---|---|
| POST | `/listings/:id/quality-score` | اجرای مجدد ارزیابی کیفیت (async، از صف Redis) |
| GET  | `/listings/:id/price-suggestion` | دریافت قیمت پیشنهادی و بازه‌ی اطمینان |

## Shipping
| Method | Path | توضیح |
|---|---|---|
| GET  | `/shipping/estimate?fromProjectId=&toProjectId=` | تخمین هزینه‌ی حمل بین دو پروژه |

## Transactions
| Method | Path | توضیح |
|---|---|---|
| POST | `/transactions` | ثبت معامله‌ی نهایی روی یک match پذیرفته‌شده |
| GET  | `/transactions/:id` | جزئیات معامله |
| POST | `/transactions/:id/review` | ثبت نظر/امتیاز بعد از معامله |

## Procurement Copilot (کوپایلوت تأمین — E13)
| Method | Path | توضیح |
|---|---|---|
| GET   | `/procurement/boq-items?projectId=` | لیست اقلام BOQ یک پروژه |
| POST  | `/procurement/boq-items` | ثبت قلم BOQ جدید (دسته، مقدار، واحد، تاریخ نیاز) |
| GET   | `/procurement/suppliers?categoryId=` | لیست تأمین‌کنندگان (اختیاری: فیلتر بر اساس دسته) |
| POST  | `/procurement/suppliers` | ثبت تأمین‌کننده‌ی جدید |
| POST  | `/procurement/suppliers/:id/quotes` | ثبت قیمت/زمان تحویل پیشنهادی یک تأمین‌کننده برای یک دسته |
| GET   | `/procurement/suppliers/compare?categoryId=` | مقایسه‌ی تأمین‌کنندگان یک دسته (قیمت، زمان تحویل، نرخ تحویل به‌موقع) |
| POST  | `/procurement/orders` | ثبت سفارش خرید روی یک قلم BOQ |
| PATCH | `/procurement/orders/:id/status` | به‌روزرسانی وضعیت تحویل سفارش (`DELIVERED`/`DELAYED`/`CANCELLED`) |
| GET   | `/procurement/forecast?projectId=` | پیش‌بینی نیاز ۴ تا ۸ هفته‌ی آینده برای هر قلم BOQ (وضعیت OK/WATCH/CRITICAL) |
| GET   | `/procurement/risk-report?projectId=` | گزارش ریسک تأمین: forecast + ریسک قیمت + بهترین تأمین‌کننده + توصیه‌ی متنی |

## Notifications (اعلان درون‌اپ — E14)
| Method | Path | توضیح |
|---|---|---|
| GET   | `/notifications` | لیست اعلان‌های کاربر جاری (جدیدترین اول) |
| GET   | `/notifications?unreadOnly=true` | فقط اعلان‌های خوانده‌نشده |
| GET   | `/notifications/unread-count` | تعداد اعلان‌های خوانده‌نشده (`{ count }`) — برای بج روی زنگوله |
| PATCH | `/notifications/:id/read` | علامت‌گذاری یک اعلان به‌عنوان خوانده‌شده |
| PATCH | `/notifications/read-all` | علامت‌گذاری همه‌ی اعلان‌های کاربر به‌عنوان خوانده‌شده |

> این مرجع پیش‌نویس فاز MVP است؛ ورودی/خروجی دقیق (JSON schema) هنگام پیاده‌سازی هر issue در `docs/issues/` تکمیل می‌شود.
