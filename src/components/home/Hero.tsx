import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Rocket, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8fc] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/20" />
      <div className="container relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.03fr_.97fr] lg:gap-16 lg:py-24">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-blue-800 shadow-sm dark:border-blue-900 dark:bg-slate-900 dark:text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            Software, thoughtfully built
          </div>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[4.35rem]">
            Make your next big idea <span className="text-blue-700 dark:text-blue-400">work in the real world.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
            ZAYA CODE HUB designs and builds websites, mobile apps, AI products, and custom business software for teams ready to move forward.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
              Discuss a project <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/portfolio" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              Explore our products
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-700 dark:text-blue-400" /> Bengaluru, India</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-700 dark:text-blue-400" /> Lalitpur, Nepal</span>
            <Link href="/best-it-company-in-nepal" className="font-medium text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Our Nepal office <ArrowRight className="inline h-3.5 w-3.5" /></Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-300/50 via-indigo-200/20 to-cyan-200/50 blur-2xl dark:from-blue-700/20 dark:via-indigo-700/10 dark:to-cyan-700/20" />
          <div className="relative overflow-hidden rounded-[1.7rem] border border-white/70 bg-slate-950 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 dark:border-slate-700 dark:ring-white/10">
            <Image src="/images/ai-zaya-app.png" alt="AI ZAYA mobile app interface" width={1024} height={1024} priority sizes="(max-width: 1024px) 100vw, 48vw" className="aspect-[1.12/1] w-full object-cover object-center sm:aspect-[1.25/1]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-transparent px-5 pb-5 pt-20 sm:px-7 sm:pb-7">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Built by ZAYA</p>
                  <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">Ideas become products.</p>
                </div>
                <Link href="/portfolio" aria-label="Explore ZAYA products" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"><ArrowRight className="h-5 w-5" /></Link>
              </div>
            </div>
            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-md sm:left-5 sm:top-5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Products for everyday progress
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"><Rocket className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-slate-900 dark:text-white">From concept to launch</p><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Product engineering, end to end</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
