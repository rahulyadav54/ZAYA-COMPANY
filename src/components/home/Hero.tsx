'use client';

import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="container mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.25fr_.75fr] lg:items-center lg:gap-20">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-semibold tracking-wide text-blue-700 dark:text-blue-400">Software development · India & Nepal</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            IT company in Bengaluru and Nepal.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
            ZAYA CODE HUB is an IT company headquartered in Bengaluru, India, with an office in Lalitpur, Nepal. We design and develop websites, mobile applications, AI products, and custom business software.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-blue-700 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              Discuss a project <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/portfolio" className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-6 py-3 font-medium text-slate-800 transition-colors hover:border-slate-500 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-500">
              Explore our products
            </Link>
          </div>
          <Link href="/best-it-company-in-nepal" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400">
            Software development in Nepal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <aside className="border-y border-slate-200 py-7 dark:border-slate-800 lg:border-y-0 lg:border-l lg:py-2 lg:pl-10" aria-label="Company locations">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Our locations</p>
          <div className="mt-5 space-y-6">
            <div className="flex gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-400" />
              <div><h2 className="font-semibold">Headquarters</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Bengaluru, Karnataka, India</p></div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-400" />
              <div><h2 className="font-semibold">Nepal office</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Lalitpur, Nepal</p></div>
            </div>
          </div>
          <p className="mt-7 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-300">Working across both markets on digital products and software services.</p>
        </aside>
      </div>
    </section>
  );
}
