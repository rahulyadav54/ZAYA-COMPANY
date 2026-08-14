import fs from 'fs';
import path from 'path';

// Read .env.local if present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) process.env[key] = value;
      }
    });
  }
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newJobs = [
  {
    title: 'Full Stack Web Developer Intern',
    type: 'Internship',
    category: 'tech',
    location: 'Remote (Work From Home)',
    description: 'Duration: 1-2 Months. Work on real-world web projects using React, Next.js, and Node.js. Build full-stack features and grow your development skills.',
    is_active: true,
  },
  {
    title: 'UI/UX Design Intern',
    type: 'Internship',
    category: 'design',
    location: 'Remote (Work From Home)',
    description: 'Duration: 1-2 Months. Design stunning user interfaces and experiences using Figma. Create wireframes and prototypes for our client projects.',
    is_active: true,
  },
  {
    title: 'Digital Marketing Intern',
    type: 'Internship',
    category: 'marketing',
    location: 'Remote (Work From Home)',
    description: 'Duration: 1-2 Months. Manage social media campaigns, create content, and help grow the ZAYA CODE HUB brand online.',
    is_active: true,
  },
  {
    title: 'Python Developer Intern',
    type: 'Internship',
    category: 'tech',
    location: 'Remote (Work From Home)',
    description: 'Duration: 1-2 Months. Work on backend systems and automation scripts using Python. Gain hands-on experience with real-world datasets.',
    is_active: true,
  },
  {
    title: 'Graphic Designer Intern',
    type: 'Internship',
    category: 'design',
    location: 'Remote (Work From Home)',
    description: 'Duration: 1-2 Months. Create visually appealing graphics for social media, marketing materials, and brand identity projects.',
    is_active: true,
  },
];

const { data, error } = await supabase.from('jobs').insert(newJobs).select();

if (error) {
  console.error('❌ Error inserting jobs:', error.message);
} else {
  console.log(`✅ Successfully added ${data.length} internship listings!`);
  data.forEach(j => console.log(`  → ${j.title}`));
}
