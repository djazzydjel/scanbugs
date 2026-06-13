import Link from 'next/link';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Intelligence Artificielle · Vision
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Identifiez chaque<br />
              <span className="text-emerald-600">nuisible</span> en secondes
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Prenez une photo et notre IA identifie instantanément l'insecte, évalue le risque,
              et vous donne les méthodes de traitement adaptées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/scanner"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
              >
                <span>📷</span>
                Scanner maintenant
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
              >
                <span>📚</span>
                Voir la bibliothèque
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tout ce qu'il vous faut</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Trois outils puissants pour identifier, apprendre et suivre les nuisibles.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon="🔍"
                title="Scanner IA"
                description="Photographiez un insecte et obtenez une identification instantanée avec niveau de risque et conseils de traitement."
                href="/scanner"
                colorClass="bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                borderClass="hover:border-emerald-200"
              />
              <FeatureCard
                icon="📚"
                title="Bibliothèque"
                description="Explorez notre base de données d'insectes et nuisibles avec descriptions détaillées, habitats et méthodes de contrôle."
                href="/library"
                colorClass="bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                borderClass="hover:border-blue-200"
              />
              <FeatureCard
                icon="🪲"
                title="Mes scans"
                description="Retrouvez l'historique de tous vos scans et suivez les nuisibles présents chez vous."
                href="/my-scans"
                colorClass="bg-violet-50 text-violet-600 group-hover:bg-violet-100"
                borderClass="hover:border-violet-200"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-8 text-center">
              {[
                { value: '98%', label: "Précision IA" },
                { value: '<5s', label: "Temps d'analyse" },
                { value: '500+', label: 'Espèces reconnues' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-extrabold text-emerald-600 mb-2">{stat.value}</p>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  colorClass,
  borderClass,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  colorClass: string;
  borderClass: string;
}) {
  return (
    <Link
      href={href}
      className={`group block bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-all duration-200 ${borderClass}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-colors ${colorClass}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </Link>
  );
}
