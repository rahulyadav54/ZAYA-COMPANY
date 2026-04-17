import Hero from "@/components/home/Hero";
import ServicesGrid from "@/components/home/ServicesGrid";
import TeamSection from "@/components/home/TeamSection";
import Testimonials from "@/components/home/Testimonials";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* About Section Snippet */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  Driving Innovation Through <span className="text-blue-600">Code</span>
                </h2>
                <p className="text-lg text-foreground mb-8 leading-relaxed">
                  ZAYA CODE HUB is more than just an IT company. We are a hub of creativity and technical excellence, dedicated to solving complex business problems with elegant software solutions.
                </p>
                <div className="space-y-4 mb-10">
                  {[
                    "Cutting-edge technology stack",
                    "Expert team of developers & designers",
                    "Agile development methodology",
                    "Commitment to quality & security",
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-3">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                      <span className="font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/about"
                  className="inline-flex items-center text-blue-600 font-bold hover:underline"
                >
                  Learn more about our journey <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 rounded-2xl bg-blue-600 shadow-xl flex items-center justify-center p-6 text-white">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">5+</div>
                    <div className="text-sm opacity-80 uppercase tracking-wider font-semibold">Years of Experience</div>
                  </div>
                </div>
                <div className="h-64 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden relative group flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">🔬</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white mt-2">Innovation Lab</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-64 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden relative group flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">✅</div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white mt-2">Quality First</div>
                  </div>
                </div>
                <div className="h-48 rounded-2xl border-2 border-blue-600/20 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-1">98%</div>
                    <div className="text-sm text-foreground uppercase tracking-wider font-semibold">Client Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServicesGrid />
      <TeamSection />

      {/* Testimonials */}
      <Testimonials />

      {/* Internship CTA */}
      <section className="py-24 bg-blue-600 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8">
              Launch Your Career with Our Internship Program
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join ZAYA CODE HUB&apos;s prestigious internship program and work on real-world projects alongside industry experts. Gain the skills you need to succeed in the tech world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/careers"
                className="px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-all shadow-xl"
              >
                View Open Positions
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 rounded-xl border border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-all"
              >
                Program Details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
