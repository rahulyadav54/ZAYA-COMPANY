export const metadata = {
  title: 'ZAYA CODE HUB | IT Company in Bengaluru & Nepal',
  description: 'ZAYA CODE HUB is headquartered in Bengaluru, India, with an office in Lalitpur, Nepal. We build custom websites, mobile apps, AI solutions, and business software.',
}

import Hero from "@/components/home/Hero";
import ServicesGrid from "@/components/home/ServicesGrid";
import TeamSection from "@/components/home/TeamSection";
import { 
  ArrowRight, 
  Bot, 
  Stethoscope, 
  GraduationCap, 
  BookOpen, 
  ShieldAlert, 
  ShoppingBag, 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const products = [
    {
      id: 'ai-zaya',
      name: 'AI ZAYA',
      category: 'AI & Productivity',
      image: '/images/ai-zaya-app.png',
      icon: Bot,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      shortDesc: 'AI-powered intelligent assistant featuring 50+ language voice interaction, study support, writing assistance, and Brain Game Assistant.',
    },
    {
      id: 'nepcare',
      name: 'NepCare',
      category: 'Healthcare & Telemedicine',
      image: '/images/nepcare-app.png',
      icon: Stethoscope,
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      shortDesc: 'Digital healthcare and telemedicine platform facilitating doctor discovery, video consultations, hospital listings, and medicine reminders.',
    },
    {
      id: 'zaya-school',
      name: 'ZAYA School',
      category: 'School Management',
      image: '/images/zaya-school.png',
      icon: GraduationCap,
      iconBg: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      shortDesc: 'Comprehensive school management platform featuring 4 dedicated panels for Admins, Teachers, Students, and Parents.',
    },
    {
      id: 'zaya-learn',
      name: 'ZAYA Learn',
      category: 'Digital Education eBooks',
      image: '/images/zaya-learn.png',
      icon: BookOpen,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      shortDesc: 'Digital eBook and course reading platform for programming languages including Python, C++, Java, JavaScript, and Web Development.',
    },
    {
      id: 'surakshanep',
      name: 'SurakshaNep',
      category: 'Emergency & Public Safety',
      image: '/images/surakshanep-app.png',
      icon: ShieldAlert,
      iconBg: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
      shortDesc: 'Emergency response platform with 1-tap SOS alerts, live location sharing, police/ambulance dispatch, and quick women safety alerts.',
    },
    {
      id: 'zayamart',
      name: 'ZAYAMART',
      category: 'Local Market & Grocery Delivery',
      image: '/images/zayamart-app.png',
      icon: ShoppingBag,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      shortDesc: 'Direct farmer-to-consumer digital marketplace enabling rapid delivery of fresh produce, organic food, and groceries within minutes/hours.',
    }
  ];
  const [featuredProduct, ...otherProducts] = products;

  return (
    <div className="bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <Hero />

      {/* Flagship Products Showcase */}
      <section className="border-y border-slate-200 bg-[#f7f8fc] py-20 dark:border-slate-800 dark:bg-slate-900/50 sm:py-24">
        <div className="container mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-11 max-w-3xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">Made by ZAYA</p>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Products built around people.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              A growing collection of digital tools for learning, healthcare, safety, and everyday work.
            </p>
          </div>

          <div className="mx-auto max-w-7xl">
            <article className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04] dark:border-slate-800 dark:bg-slate-950 md:grid-cols-2">
              <div className="relative min-h-72 bg-slate-100 dark:bg-slate-950 sm:min-h-96">
                <Image src={featuredProduct.image} alt={`${featuredProduct.name} product preview`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center transition duration-700 hover:scale-[1.02]" />
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400">{featuredProduct.category}</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{featuredProduct.name}</h3>
                <p className="mt-4 max-w-xl leading-7 text-slate-600 dark:text-slate-300">{featuredProduct.shortDesc}</p>
                <Link href="/portfolio" className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-blue-700 px-5 font-semibold text-white transition hover:bg-blue-800">
                  Explore the product portfolio <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <ul className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              {otherProducts.map((prod) => (
                <li key={prod.id} className="rounded-2xl border border-slate-200 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${prod.iconBg}`}><prod.icon className="h-5 w-5" /></div>
                    <div><h3 className="font-semibold text-slate-900 dark:text-white">{prod.name}</h3><p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{prod.category}</p></div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{prod.shortDesc}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* View All Products CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/portfolio"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-blue-700 dark:hover:text-blue-300"
            >
              <span>View all products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Engineering Capabilities & Custom Solutions */}
      <ServicesGrid />

      {/* Leadership & Engineering Team */}
      <TeamSection />

      {/* Career & Internship Opportunities CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
        <div className="pointer-events-none absolute -right-20 -top-36 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Careers & internships</p>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Launch Your Tech Career at ZAYA CODE HUB
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Gain hands-on experience building real-world digital products in Web Development, Mobile Apps, UI/UX Design, and AI. Receive verifiable certificates and 1-on-1 mentorship.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/careers"
                className="px-8 py-4 rounded-lg bg-white text-slate-900 font-medium text-base hover:bg-slate-100 transition-colors"
              >
                View Open Internships
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 rounded-lg border border-white/30 text-white font-medium text-base hover:bg-white/10 transition-colors"
              >
                About Our Company
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
