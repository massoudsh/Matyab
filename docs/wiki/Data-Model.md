# مدل داده

مطابق `backend/prisma/schema.prisma` و `db/schema.sql`. این صفحه فقط نمای مفهومی است.

## موجودیت‌های اصلی

### User
کاربر پلتفرم؛ نقش: `CONTRACTOR` (پیمانکار)، `SUPPLIER` (تأمین‌کننده/انباردار)، `ADMIN`.
فیلدهای کلیدی: نام، شماره تماس، شهر، امتیاز اعتماد (trust score محاسبه‌شده از تاریخچه‌ی معاملات).

### Project
پروژه‌ی ساختمانی متعلق به یک کاربر. هر آگهی عرضه/تقاضا به یک پروژه وصل می‌شود.
فیلدها: نام پروژه، شهر/منطقه، آدرس تقریبی (برای محاسبه‌ی حمل)، مالک.

### MaterialCategory
دسته‌بندی مصالح (میلگرد، سیمان، بلوک، کاشی/سرامیک، درب/پنجره، لوله/اتصالات، عایق، چوب، …). سلسله‌مراتبی (دسته/زیردسته).

### Listing (آگهی عرضه)
مصالح مازادی که یک پروژه برای فروش/واگذاری ثبت کرده.
فیلدها: دسته، مقدار، واحد، عکس‌ها، توضیحات، قیمت پیشنهادی فروشنده، وضعیت (`ACTIVE`, `MATCHED`, `SOLD`, `EXPIRED`)، منطقه.

### QualityAssessment
نتیجه‌ی ارزیابی کیفیت یک Listing (توسط AI یا دستی در فاز MVP).
فیلدها: نمره (۰-۱۰۰)، رده (`A`/`B`/`C`)، یادداشت، منبع ارزیابی (`AI`/`MANUAL`).

### PriceSuggestion
پیشنهاد قیمت هوشمند برای یک Listing.
فیلدها: قیمت پیشنهادی، بازه‌ی اطمینان (min/max)، مبنای محاسبه (تاریخچه‌ی قیمت مصالح مشابه در منطقه).

### MaterialRequest (درخواست تقاضا)
نیاز یک پروژه به مصالح.
فیلدها: دسته، مقدار مورد نیاز، بودجه، مهلت، منطقه، وضعیت.

### Match
پیشنهاد اتصال بین یک Listing و یک MaterialRequest.
فیلدها: امتیاز تطابق (۰-۱۰۰)، هزینه‌ی حمل تخمینی، دلیل پیشنهاد (توضیح قابل‌فهم برای کاربر)، وضعیت (`SUGGESTED`, `ACCEPTED`, `REJECTED`).

### ShippingEstimate
هزینه‌ی حمل تخمینی بین مبدأ (Listing) و مقصد (Request) بر اساس فاصله.

### Transaction
معامله‌ی نهایی‌شده بین خریدار و فروشنده.
فیلدها: قیمت نهایی، کمیسیون پلتفرم، وضعیت (`PENDING`, `COMPLETED`, `CANCELLED`).

### Review
نظر/امتیاز بعد از تراکنش (لایه‌ی اعتماد بین کاربران).

### PriceHistory
سابقه‌ی قیمت مصالح به تفکیک دسته و منطقه — ورودی اصلی موتور Price Suggestion.

## رابطه‌ی خلاصه
```
User 1─N Project 1─N Listing        Listing 1─1 QualityAssessment
                                     Listing 1─1 PriceSuggestion
User 1─N Project 1─N MaterialRequest
Listing 1─N Match N─1 MaterialRequest
Match 1─1 ShippingEstimate
Match 1─1 Transaction (در صورت پذیرش)
Transaction 1─N Review
MaterialCategory 1─N PriceHistory
```
