export default function LandingPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand/5 p-8 text-center">
        <h1 className="text-2xl font-bold text-brand-dark">
          کوپایلوت هوشمند تأمین، قیمت‌گذاری و استفاده‌ی مجدد از مصالح ساختمانی
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          مصالح مازاد پروژه‌ی شما، نیاز پروژه‌ی دیگری است. متریاب با امتیازدهی کیفیت،
          قیمت‌گذاری منصفانه و محاسبه‌ی هزینه‌ی حمل، عرضه و تقاضا را هوشمندانه به هم متصل می‌کند.
        </p>
        <a
          href="/listings"
          className="mt-5 inline-block rounded-lg bg-brand px-5 py-2.5 text-white hover:bg-brand-dark"
        >
          مشاهده‌ی آگهی‌های مصالح
        </a>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FeatureCard title="Quality Score" desc="امتیازدهی هوشمند کیفیت و قابلیت استفاده‌ی مجدد" />
        <FeatureCard title="قیمت منصفانه" desc="پیشنهاد قیمت بر اساس داده‌ی واقعی بازار منطقه‌ای" />
        <FeatureCard title="مچینگ هوشمند" desc="اتصال عرضه و تقاضا با احتساب هزینه‌ی حمل" />
      </section>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-brand-dark">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{desc}</p>
    </div>
  );
}
