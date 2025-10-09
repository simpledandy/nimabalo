import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Maxfiylik Siyosati | Nimabalo',
  description: 'Nimabalo platformasining maxfiylik siyosati va foydalanuvchi ma\'lumotlarini himoya qilish tartibi.',
  openGraph: {
    title: 'Maxfiylik Siyosati | Nimabalo',
    description: 'Nimabalo platformasining maxfiylik siyosati va foydalanuvchi ma\'lumotlarini himoya qilish tartibi.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50">
      <div className="container mx-auto px-4 py-8 pt-32 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-4xl font-extrabold text-primary mb-3">
            Maxfiylik Siyosati
          </h1>
          <p className="text-neutral text-sm">
            So'nggi yangilanish: 2025-yil, 8-oktabr
          </p>
        </div>

        {/* Content */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="prose prose-lg max-w-none">
            
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>📋</span>
                1. Umumiy Ma'lumotlar
              </h2>
              <p className="text-neutral leading-relaxed">
                Nimabalo platformasi foydalanuvchilarining maxfiyligini jiddiy qabul qiladi. 
                Ushbu siyosat biz qanday ma'lumotlarni to'plashimiz va ulardan qanday foydalanishimizni tushuntiradi.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>📊</span>
                2. To'planadigan Ma'lumotlar
              </h2>
              
              <div className="bg-sky-50 p-4 rounded-lg mb-4">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Telegram orqali ro'yxatdan o'tganda:
                </h3>
                <ul className="space-y-2 text-neutral">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Telegram ID (raqam)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Telegram username (agar mavjud bo'lsa)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Ismingiz (agar Telegram profilingizda ko'rsatilgan bo'lsa)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Platformada faoliyat ko'rsatganda:
                </h3>
                <ul className="space-y-2 text-neutral">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Bergan savollaringiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Yozgan javoblaringiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Profilingiz ma'lumotlari (username, bio, avatar)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Faoliyat tarixingiz (kirish vaqti, so'nggi faollik)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-primary mb-3">
                  Email orqali ro'yxatdan o'tganda:
                </h3>
                <ul className="space-y-2 text-neutral">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Email manzilingiz</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span>Parolingiz (shifrlangan holda)</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>🎯</span>
                3. Ma'lumotlardan Foydalanish
              </h2>
              <p className="text-neutral leading-relaxed mb-3">
                Biz ma'lumotlaringizni faqat quyidagi maqsadlarda ishlatamiz:
              </p>
              <ul className="space-y-2 text-neutral">
                <li className="flex items-start gap-2">
                  <span className="text-secondary">✓</span>
                  <span>Platformada autentifikatsiya qilish</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">✓</span>
                  <span>Sizga xizmat ko'rsatish</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">✓</span>
                  <span>Platformani yaxshilash</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">✓</span>
                  <span>Texnik muammolarni hal qilish</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>🛡️</span>
                4. Ma'lumotlar Xavfsizligi
              </h2>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-lg">
                <ul className="space-y-3 text-neutral">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>Barcha ma'lumotlar shifrlangan tarzda saqlanadi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>Parollar xesh qilinadi (hech kim ko'ra olmaydi)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>SSL/TLS shifrlash ishlatiladi</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>Zamonaviy xavfsizlik standartlari qo'llaniladi</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>🤝</span>
                5. Ma'lumotlarni Baham Ko'rish
              </h2>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-lg mb-3">
                <ul className="space-y-3 text-neutral">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <span>Biz sizning shaxsiy ma'lumotlaringizni uchinchi shaxslarga <strong>SOTMAYMIZ</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <span>Reklamachi yoki boshqa kompaniyalarga <strong>BERMAYMIZ</strong></span>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg">
                <ul className="space-y-3 text-neutral">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>Faqat qonuniy talab bo'lsa, rasmiy organlar bilan baham ko'ramiz</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>⚖️</span>
                6. Sizning Huquqlaringiz
              </h2>
              <p className="text-neutral leading-relaxed mb-3">
                Siz quyidagilarni qilishingiz mumkin:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-sky-50 p-4 rounded-lg">
                  <span className="text-lg">📖</span>
                  <p className="font-semibold text-primary mt-2">O'z ma'lumotlaringizni ko'rish</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <span className="text-lg">✏️</span>
                  <p className="font-semibold text-primary mt-2">Ma'lumotlaringizni o'zgartirish</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <span className="text-lg">🗑️</span>
                  <p className="font-semibold text-primary mt-2">Akkauntingizni o'chirish</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <span className="text-lg">💾</span>
                  <p className="font-semibold text-primary mt-2">Ma'lumotlaringiz nusxasini olish</p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>🍪</span>
                7. Cookie va Texnik Ma'lumotlar
              </h2>
              <p className="text-neutral leading-relaxed mb-3">
                Biz foydalanuvchi tajribasini yaxshilash uchun:
              </p>
              <ul className="space-y-2 text-neutral">
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Session cookie'lardan foydalanamiz</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>IP manzillarni xavfsizlik uchun qayd qilamiz</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">•</span>
                  <span>Brauzer ma'lumotlarini to'playmiz</span>
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>👶</span>
                8. Bolalar Maxfiyligi
              </h2>
              <p className="text-neutral leading-relaxed">
                Platformamiz 13 yoshdan katta foydalanuvchilar uchun mo'ljallangan.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>🔄</span>
                9. O'zgarishlar
              </h2>
              <p className="text-neutral leading-relaxed">
                Ushbu siyosat vaqti-vaqti bilan yangilanishi mumkin. Muhim o'zgarishlar bo'lsa, sizga xabar beramiz.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>📞</span>
                10. Bog'lanish
              </h2>
              <p className="text-neutral leading-relaxed mb-4">
                Savollar yoki muammolar bo'lsa:
              </p>
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-5 rounded-lg">
                <ul className="space-y-3 text-neutral">
                  <li className="flex items-center gap-3">
                    <span className="text-xl">📧</span>
                    <span>Email: <a href="mailto:support@nimabalo.uz" className="text-secondary font-semibold hover:underline">support@nimabalo.uz</a></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-xl">💬</span>
                    <span>Telegram: <a href="https://t.me/nimabalo_support" target="_blank" rel="noopener noreferrer" className="text-secondary font-semibold hover:underline">@nimabalo_support</a></span>
                  </li>
                </ul>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-sm text-neutral mb-4">
            © 2025 Nimabalo. Barcha huquqlar himoyalangan.
          </div>
          <Link href="/" className="btn-secondary inline-block">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
