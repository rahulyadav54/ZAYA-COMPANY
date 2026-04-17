import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vzdzpoohwkgmggbjnekr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZHpwb29od2tnbWdnYmpuZWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjM4OTgsImV4cCI6MjA5MTk5OTg5OH0.uWcp-DLC7YLJaQtn_0SeEu9umgePUcV-zHWj7Nny754'
);

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
