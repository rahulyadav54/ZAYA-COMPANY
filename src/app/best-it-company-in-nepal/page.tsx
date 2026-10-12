import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bot, Code2, GraduationCap, HeartPulse, MapPin, ShieldCheck, Smartphone } from 'lucide-react';

const pageUrl = 'https://zayacodehub.in/best-it-company-in-nepal';

export const metadata: Metadata = {
  title: 'IT Company in Nepal | Custom Software',
  description:
    'Looking for an IT company in Nepal? ZAYA CODE HUB has an office in Lalitpur and is headquartered in Bengaluru. We develop custom software, websites, mobile apps, AI products, and digital platforms.',
  keywords: [
    'best IT company in Nepal',
    'IT company in Nepal',
    'software development company in Nepal',
    'software company in Lalitpur',
    'web development company Nepal',
    'mobile app development Nepal',
    'custom software development Nepal',
  ],
  alternates: {
    canonical: pageUrl,
    languages: {
      'en-NP': pageUrl,
      'ne-NP': 'https://zayacodehub.in/ne/it-company-nepal',
      'x-default': pageUrl,
    },
  },
  openGraph: {
    title: 'IT Company in Nepal | ZAYA CODE HUB',
    description:
      'Meet ZAYA CODE HUB, with an office in Lalitpur, Nepal and headquarters in Bengaluru, India, building websites, apps, AI products, and custom digital platforms.',
    url: pageUrl,
    type: 'website',
  },
};

const services = [
  { title: 'Custom Software Development', text: 'Business applications and digital platforms shaped around real workflows.', icon: Code2 },
  { title: 'Website Development', text: 'Responsive business websites, web applications, and e-commerce experiences.', icon: Smartphone },
  { title: 'Mobile App Development', text: 'Android and cross-platform applications designed for practical use.', icon: Smartphone },
  { title: 'AI and Automation', text: 'AI-powered applications and workflow automation for useful, focused outcomes.', icon: Bot },
  { title: 'Education Technology', text: 'Learning tools and school platforms for students, teachers, and administrators.', icon: GraduationCap },
  { title: 'Digital Health and Safety', text: 'Healthcare, telemedicine, and emergency response products in our portfolio.', icon: HeartPulse },
];

const faqs = [
  {
    question: 'Where is ZAYA CODE HUB located?',
    answer: 'ZAYA CODE HUB is headquartered in Bengaluru, India, and has an office in Lalitpur, Nepal. The company works with organizations in both markets and beyond.',
  },
  {
    question: 'What services does ZAYA CODE HUB provide in Nepal?',
    answer: 'The team develops custom software, websites, mobile apps, AI applications, education platforms, and digital solutions for healthcare and public safety.',
  },
  {
    question: 'How do I choose the best IT company in Nepal for my project?',
    answer: 'Review the company’s relevant work, technical fit, communication process, delivery plan, and support after launch. Contact ZAYA CODE HUB to discuss your requirements and see whether the team is a good fit.',
  },
];

const pageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'IT Company in Nepal | ZAYA CODE HUB',
      description: 'Software development, websites, mobile applications, AI products, and digital platforms from ZAYA CODE HUB, with an office in Lalitpur, Nepal.',
      about: { '@id': 'https://zayacodehub.in/#organization' },
      isPartOf: { '@id': 'https://zayacodehub.in/#website' },
    },
    {
      '@type': 'Service',
      name: 'Software development and IT services in Nepal',
      provider: { '@id': 'https://zayacodehub.in/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
      serviceType: services.map((service) => service.title),
      url: pageUrl,
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
};

export default function NepalItCompanyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-100">
              <MapPin className="h-4 w-4" /> Lalitpur, Nepal office · Bengaluru, India HQ
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              Looking for an <span className="text-blue-300">IT Company in Nepal?</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              ZAYA CODE HUB has an office in Lalitpur and is headquartered in Bengaluru. We design and build custom websites, mobile apps, AI products, and digital platforms for organizations in Nepal.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-500">
                Discuss your project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                Explore our products
              </Link>
            </div>
            <Link href="/ne/it-company-nepal" lang="ne" className="mt-6 inline-block text-sm font-semibold text-blue-200 underline decoration-blue-300/50 underline-offset-4 hover:text-white">
              नेपालीमा पढ्नुहोस्
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">What we do</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Software and IT services for organizations in Nepal</h2>
            <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">
              From planning and design to development, ZAYA CODE HUB helps turn product ideas and business needs into usable digital services. Our work spans software, education, healthcare, public safety, and commerce.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ title, text, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20 dark:bg-slate-900/50">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Why work with us</p>
            <h2 className="mt-3 text-3xl font-bold">A Nepal office backed by our Bengaluru headquarters</h2>
            <p className="mt-5 leading-7 text-slate-600 dark:text-slate-300">
              We build and maintain our own digital products, giving our team experience across real product needs and technical domains. Explore the portfolio, then contact us to talk through your goals, scope, and next steps.
            </p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-600 dark:text-blue-300">
              About ZAYA CODE HUB <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Product experience', 'Explore products built across AI, education, healthcare, public safety, and commerce.'],
              ['Clear project discussion', 'Start with your goals, users, timeline, and technical requirements.'],
              ['One team, multiple capabilities', 'Bring design, software development, mobile, and AI needs into one conversation.'],
              ['Two office locations', 'Our headquarters is in Bengaluru, India, with an office in Lalitpur, Nepal.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Frequently asked questions</p>
          <h2 className="mt-3 text-3xl font-bold">Choosing the best IT company in Nepal for your needs</h2>
          <div className="mt-8 divide-y divide-slate-200 dark:divide-slate-800">
            {faqs.map(({ question, answer }) => (
              <article key={question} className="py-6">
                <h3 className="text-lg font-bold">{question}</h3>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{answer}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-blue-700 p-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <h2 className="text-2xl font-bold">Have a software project in mind?</h2>
              <p className="mt-2 text-blue-100">Tell our Bengaluru or Lalitpur team what you want to build.</p>
            </div>
            <Link href="/contact" className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-blue-800 hover:bg-blue-50 sm:mt-0">
              Contact our team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
