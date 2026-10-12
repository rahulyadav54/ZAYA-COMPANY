import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Bot, Code2, GraduationCap, HeartPulse, MapPin, Smartphone } from 'lucide-react';

const pageUrl = 'https://zayacodehub.in/ne/it-company-nepal';
const englishPageUrl = 'https://zayacodehub.in/best-it-company-in-nepal';

export const metadata: Metadata = {
  title: 'नेपालमा IT कम्पनी | सफ्टवेयर तथा एप विकास | ZAYA CODE HUB',
  description:
    'ZAYA CODE HUB को मुख्यालय Bengaluru, भारतमा र नेपालको कार्यालय Lalitpur मा छ। वेबसाइट, मोबाइल एप, कस्टम सफ्टवेयर र AI समाधानबारे जान्नुहोस्।',
  keywords: [
    'नेपालमा आईटी कम्पनी',
    'नेपालको सफ्टवेयर विकास कम्पनी',
    'ललितपुर आईटी कम्पनी',
    'नेपालमा वेबसाइट विकास',
    'नेपालमा मोबाइल एप विकास',
    'कस्टम सफ्टवेयर विकास नेपाल',
  ],
  alternates: {
    canonical: pageUrl,
    languages: {
      'ne-NP': pageUrl,
      'en-NP': englishPageUrl,
      'x-default': englishPageUrl,
    },
  },
  openGraph: {
    title: 'नेपालमा IT कम्पनी | ZAYA CODE HUB',
    description: 'ललितपुर, नेपालको कार्यालय र Bengaluru मुख्यालयसहित ZAYA CODE HUB का सफ्टवेयर, वेबसाइट, मोबाइल एप र AI सेवाहरू।',
    url: pageUrl,
    type: 'website',
    locale: 'ne_NP',
  },
};

const services = [
  { title: 'कस्टम सफ्टवेयर विकास', description: 'व्यवसाय र संस्थाका आवश्यकताअनुसार डिजिटल सफ्टवेयर र प्लेटफर्म।', icon: Code2 },
  { title: 'वेबसाइट तथा वेब एप', description: 'व्यवसायिक वेबसाइट, वेब एप र ई-कमर्स अनुभव।', icon: Smartphone },
  { title: 'मोबाइल एप विकास', description: 'Android तथा क्रस-प्लेटफर्म मोबाइल एपहरू।', icon: Smartphone },
  { title: 'AI तथा स्वचालन', description: 'उपयोगी कामका लागि AI-सक्षम एप र वर्कफ्लो स्वचालन।', icon: Bot },
  { title: 'शिक्षा प्रविधि', description: 'विद्यार्थी, शिक्षक र विद्यालयका लागि शैक्षिक प्लेटफर्म।', icon: GraduationCap },
  { title: 'स्वास्थ्य तथा सुरक्षा प्रविधि', description: 'हाम्रो उत्पादन पोर्टफोलियोमा स्वास्थ्य र आपत्कालीन सहायता समाधानहरू छन्।', icon: HeartPulse },
];

const faqs = [
  {
    question: 'ZAYA CODE HUB कहाँ अवस्थित छ?',
    answer: 'ZAYA CODE HUB को मुख्यालय Bengaluru, Karnataka, भारतमा छ र नेपालको कार्यालय Lalitpur मा छ।',
  },
  {
    question: 'नेपालमा ZAYA CODE HUB ले कुन IT सेवाहरू दिन्छ?',
    answer: 'कम्पनीले कस्टम सफ्टवेयर, वेबसाइट, मोबाइल एप, AI समाधान र शिक्षा, स्वास्थ्य तथा सार्वजनिक सुरक्षासम्बन्धी डिजिटल उत्पादनहरू विकास गर्छ।',
  },
  {
    question: 'आफ्नो परियोजनाका लागि IT कम्पनी कसरी छान्ने?',
    answer: 'कम्पनीको सम्बन्धित काम, प्राविधिक अनुभव, सञ्चार प्रक्रिया, योजना, लागत र सेवा सुरु भएपछि उपलब्ध सहयोग हेर्नुहोस्। आफ्नो आवश्यकता बताउन ZAYA CODE HUB लाई सम्पर्क गर्नुहोस्।',
  },
];

const pageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'नेपालमा IT कम्पनी | ZAYA CODE HUB',
      inLanguage: 'ne-NP',
      description: 'Lalitpur, Nepal कार्यालयबाट सफ्टवेयर, वेबसाइट, मोबाइल एप, AI र डिजिटल उत्पादन विकास गर्ने ZAYA CODE HUB।',
      about: { '@id': 'https://zayacodehub.in/#organization' },
      isPartOf: { '@id': 'https://zayacodehub.in/#website' },
    },
    {
      '@type': 'Service',
      name: 'नेपालमा सफ्टवेयर विकास तथा IT सेवाहरू',
      provider: { '@id': 'https://zayacodehub.in/#organization' },
      areaServed: { '@type': 'Country', name: 'Nepal' },
      serviceType: services.map(({ title }) => title),
      url: pageUrl,
    },
    {
      '@type': 'FAQPage',
      inLanguage: 'ne-NP',
      mainEntity: faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ],
};

export default function NepaliItCompanyPage() {
  return (
    <main lang="ne" className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-950 to-slate-950" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-blue-300/10 px-4 py-2 text-xs font-semibold tracking-wide text-blue-100">
              <MapPin className="h-4 w-4" /> नेपालको कार्यालय: Lalitpur · मुख्यालय: Bengaluru, भारत
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
              नेपालमा सफ्टवेयर तथा <span className="text-blue-300">IT कम्पनी</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              ZAYA CODE HUB को मुख्यालय Bengaluru, भारतमा र नेपालको कार्यालय Lalitpur मा छ। हामी नेपालका व्यवसाय, विद्यालय र संस्थाका लागि वेबसाइट, मोबाइल एप, AI समाधान र कस्टम सफ्टवेयर विकास गर्छौं।
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-500">
                परियोजनाबारे कुरा गर्नुहोस् <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                हाम्रा उत्पादनहरू हेर्नुहोस्
              </Link>
            </div>
            <Link href={englishPageUrl.replace('https://zayacodehub.in', '')} lang="en" className="mt-6 inline-block text-sm font-semibold text-blue-200 underline decoration-blue-300/50 underline-offset-4 hover:text-white">
              Read this page in English
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-widest text-blue-600">हाम्रा सेवाहरू</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">नेपालका संस्था र व्यवसायका लागि IT समाधान</h2>
            <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">
              आवश्यकता बुझ्ने र योजना बनाउने चरणदेखि डिजाइन र विकाससम्म, हाम्रो टोलीले उपयोगी डिजिटल सेवाहरू निर्माण गर्न सहयोग गर्छ।
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20 dark:bg-slate-900/50">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold tracking-widest text-blue-600">प्रायः सोधिने प्रश्न</p>
          <h2 className="mt-3 text-3xl font-bold">नेपालमा IT कम्पनी र सफ्टवेयर विकास</h2>
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
              <h2 className="text-2xl font-bold">तपाईंको परियोजना सुरु गरौँ</h2>
              <p className="mt-2 text-blue-100">Lalitpur कार्यालय वा Bengaluru मुख्यालयको टोलीसँग सम्पर्क गर्नुहोस्।</p>
            </div>
            <Link href="/contact" className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-blue-800 hover:bg-blue-50 sm:mt-0">
              सम्पर्क गर्नुहोस् <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
