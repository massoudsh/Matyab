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

> این مرجع پیش‌نویس فاز MVP است؛ ورودی/خروجی دقیق (JSON schema) هنگام پیاده‌سازی هر issue در `docs/issues/` تکمیل می‌شود.
