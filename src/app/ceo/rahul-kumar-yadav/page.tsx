import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rahul Kumar Yadav — CEO & Founder of ZAYA CODE HUB',
  description:
    'Rahul Kumar Yadav is the CEO and Founder of ZAYA CODE HUB, an India-based software development and IT services company.',
  alternates: { canonical: 'https://zayacodehub.in/ceo/rahul-kumar-yadav' },
  openGraph: {
    title: 'Rahul Kumar Yadav — CEO & Founder of ZAYA CODE HUB',
    description: 'Meet Rahul Kumar Yadav, CEO and Founder of ZAYA CODE HUB.',
    url: 'https://zayacodehub.in/ceo/rahul-kumar-yadav',
    type: 'profile',
    images: [{ url: 'https://zayacodehub.in/ceo.png', alt: 'Rahul Kumar Yadav, CEO and Founder of ZAYA CODE HUB' }],
  },
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://zayacodehub.in/ceo/rahul-kumar-yadav#person',
  name: 'Rahul Kumar Yadav',
  jobTitle: 'CEO and Founder',
  image: 'https://zayacodehub.in/ceo.png',
  url: 'https://zayacodehub.in/ceo/rahul-kumar-yadav',
  email: 'rahul@zayacodehub.in',
  worksFor: {
    '@type': 'Organization',
    '@id': 'https://zayacodehub.in/#organization',
    name: 'ZAYA CODE HUB',
    url: 'https://zayacodehub.in',
  },
};

export default function CeoProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20 dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <div className="mx-auto grid max-w-5xl gap-12 rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-900 md:grid-cols-[320px_1fr] md:p-12">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Image src="/ceo.png" alt="Rahul Kumar Yadav, CEO and Founder of ZAYA CODE HUB" fill priority className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">ZAYA CODE HUB leadership</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-950 dark:text-white">Rahul Kumar Yadav</h1>
          <p className="mt-2 text-lg font-semibold text-blue-600 dark:text-blue-400">CEO &amp; Founder</p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Rahul Kumar Yadav leads ZAYA CODE HUB, an India-based software development and IT services company building web applications, mobile products, AI solutions, and practical digital platforms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="mailto:rahul@zayacodehub.in" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"><Mail className="h-4 w-4" /> Contact Rahul</a>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ArrowRight className="h-4 w-4" /> About ZAYA CODE HUB</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
