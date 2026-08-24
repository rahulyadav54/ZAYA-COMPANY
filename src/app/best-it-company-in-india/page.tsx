import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Code2, Globe2, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Best IT Company in India for Custom Software | ZAYA CODE HUB',
  description:
    'Looking for a trusted IT company in India? ZAYA CODE HUB builds custom web applications, mobile apps, AI automation, cloud systems, and digital products for businesses and startups.',
  keywords: [
    'best IT company in India',
    'IT company in India',
    'software development company India',
    'custom software development India',
    'web and mobile app development India',
  ],
  alternates: { canonical: 'https://zayacodehub.in/best-it-company-in-india' },
  openGraph: {
    title: 'Best IT Company in India for Custom Software | ZAYA CODE HUB',
    description:
      'Custom software, web, mobile, AI, and cloud engineering for businesses and startups across India.',
    url: 'https://zayacodehub.in/best-it-company-in-india',
    type: 'website',
  },
};

const services = [
  'Custom web application development',
  'Android and mobile application development',
  'AI assistants and business automation',
  'Cloud integrations and scalable backend systems',
  'UI/UX design and product engineering',
];

const pageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://zayacodehub.in/best-it-company-in-india#webpage',
      url: 'https://zayacodehub.in/best-it-company-in-india',
      name: 'Best IT Company in India for Custom Software | ZAYA CODE HUB',
      description:
        'ZAYA CODE HUB provides custom software development, mobile apps, AI automation, and cloud engineering in India.',
      isPartOf: { '@id': 'https://zayacodehub.in/#website' },
      about: { '@id': 'https://zayacodehub.in/#organization' },
    },
    {
      '@type': 'Service',
      serviceType: 'Software development and IT services',
      provider: { '@id': 'https://zayacodehub.in/#organization' },
      areaServed: { '@type': 'Country', name: 'India' },
      url: 'https://zayacodehub.in/best-it-company-in-india',
    },
  ],
};

export default function BestItCompanyInIndiaPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="bg-slate-950 px-6 py-24 text-white sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-200">
              <Sparkles className="h-4 w-4" /> Software engineering for India
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              A trusted IT company in India for ambitious digital products
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              ZAYA CODE HUB helps startups, growing businesses, and institutions turn ideas into reliable web apps, mobile apps, AI workflows, and cloud-connected software.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-500">
                Discuss your project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                View our products
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Why ZAYA CODE HUB</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Practical technology, built around your goals</h2>
            <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">
              Choosing an IT partner is about more than a label. Our team combines product thinking, modern engineering, and clear communication to deliver software that is useful after launch—not just impressive in a demo.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {['Business-focused planning', 'Modern, maintainable code', 'Responsive communication', 'India-wide collaboration'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/40 dark:bg-blue-950/30">
              <Code2 className="h-7 w-7 text-blue-600" />
              <h3 className="mt-4 text-xl font-bold">Engineering capabilities</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">From product architecture and frontend experiences to backend APIs and deployment.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
              <Globe2 className="h-7 w-7 text-indigo-600" />
              <h3 className="mt-4 text-xl font-bold">Built for reach</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">We collaborate with organizations across India and build experiences for real users and real operating conditions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">What we deliver</p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Software and IT services</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service} className="rounded-xl bg-white p-5 shadow-sm dark:bg-slate-950">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                <h3 className="mt-4 font-semibold">{service}</h3>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/services" className="text-blue-600 hover:text-blue-500">Explore services →</Link>
            <Link href="/about" className="text-blue-600 hover:text-blue-500">About ZAYA CODE HUB →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
