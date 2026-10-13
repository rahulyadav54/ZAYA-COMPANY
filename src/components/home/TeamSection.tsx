import Image from 'next/image';
import Link from 'next/link';

const teamMembers = [
  { name: 'Rahul Kumar Yadav', role: 'CEO & Founder', image: '/Teams/Rahul Kumar Yadav.png' },
  { name: 'Shivshankar Kr Jaysawal', role: 'Co-Founder', image: '/Teams/Shivshankar Kr Jaysawal.jpeg' },
  { name: 'Rohith P', role: 'Chief Technology Officer', image: '/Teams/Rohith p .jpeg' },
  { name: 'Akash Adhikari', role: 'Human Resources', image: '/Teams/Akash Adhikari.jpeg' },
  { name: 'Sujan Khatri', role: 'Operations Manager', image: '/Teams/Sujan Khatri.jpeg' },
  { name: 'Aditya Chaurasiya', role: 'Marketing', image: '/Teams/Aditya Chaurasiya.jpg' },
];

export default function TeamSection() {
  return (
    <section id="team-section" className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950 md:py-24">
      <div className="container mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-11 grid gap-4 md:grid-cols-[1fr_.8fr] md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400">The people behind it</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-4xl">Meet the ZAYA CODE HUB team</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 md:justify-self-end">Our team works across Bengaluru, India, and Lalitpur, Nepal, building and supporting digital products.</p>
        </div>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <li key={member.name} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-900 dark:hover:bg-slate-900 sm:p-5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Image src={member.image} alt={member.name} fill sizes="56px" className="object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/about" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">About the company</Link>
          <Link href="/careers" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-500 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-500">Careers</Link>
        </div>
      </div>
    </section>
  );
}
