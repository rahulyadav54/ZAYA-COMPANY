import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// 1. Load env variables manually from .env and .env.local
const env = {};
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    content.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        env[key] = val;
      }
    });
  }
}
loadEnvFile(path.resolve('.env'));
loadEnvFile(path.resolve('.env.local'));

const SUPABASE_PROJECT_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://jhfmkjkldxovscvobvoh.supabase.co';
const SUPABASE_PUBLIC_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZm1ramtsZHhvdnNjdm9idm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTE5ODYsImV4cCI6MjEwMjI4Nzk4Nn0.WbuwLOnQzdCu2wqQkrmMSe2TQYh_h45JgNPzU5z-6k0';

const gmailUser = env.GMAIL_USER || 'zayacodehub@gmail.com';
const gmailPass = env.GMAIL_APP_PASS;

if (!gmailPass) {
  console.error('❌ Error: GMAIL_APP_PASS is not configured in your .env or .env.local file.');
  console.log('Please add GMAIL_APP_PASS=xxxx to your .env.local file first.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY);

async function run() {
  console.log('🚀 Starting email dispatch for all assigned tasks...');
  console.log(`Sending emails via Gmail: ${gmailUser}`);

  // Fetch pending tasks
  const { data: tasks, error: tasksErr } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending');

  if (tasksErr) {
    console.error('❌ Error fetching tasks:', tasksErr);
    process.exit(1);
  }

  if (!tasks || tasks.length === 0) {
    console.log('✅ No pending tasks found. All clear!');
    process.exit(0);
  }

  console.log(`📋 Found ${tasks.length} pending task(s) to process.`);

  // Resolve applications to map official email -> personal Gmail address
  const { data: applications } = await supabase.from('applications').select('*');
  const emailToPersonalMap = new Map();
  if (applications) {
    for (const a of applications) {
      if (a.email) {
        const personal = a.email.toLowerCase().trim();
        emailToPersonalMap.set(personal, personal);

        if (a.full_name) {
          const clean = a.full_name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
          const parts = clean.split(/\s+/).filter(Boolean);
          const official = `${parts.join('')}@zayacodehub.com`;
          emailToPersonalMap.set(official, personal);
        }
      }
    }
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPass.trim(),
    },
  });

  let sentCount = 0;

  for (const task of tasks) {
    const rawEmail = (task.intern_email || '').toLowerCase().trim();
    const destinationEmail = emailToPersonalMap.get(rawEmail) || rawEmail;
    const name = task.intern_name || 'Intern';

    if (!destinationEmail) {
      console.warn(`⚠️ Skipped task #${task.id}: Cannot resolve intern email address.`);
      continue;
    }

    console.log(`✉️ Sending task notification to ${name} at personal Gmail: ${destinationEmail}...`);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">ZAYA CODE HUB</h2>
          <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">New Task Assigned</p>
        </div>
        <div style="margin-bottom: 20px;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>A new task/project has been assigned to you. Please complete and submit it before the deadline:</p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #1e293b;">${task.title}</h3>
          <p style="white-space: pre-wrap; color: #334155;">${task.description || ''}</p>
          <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; font-weight: bold; width: 100px;">Priority:</td>
              <td style="padding: 4px 0; color: #1e293b;">${(task.priority || 'medium').toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #64748b; font-weight: bold;">Deadline:</td>
              <td style="padding: 4px 0; color: #ef4444; font-weight: bold;">17 September 2026</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="https://www.zayacodehub.in/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View & Submit Task on Dashboard</a>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
          <p>This is an automated message from ZAYA CODE HUB. Please submit your project work before 17 Sept 2026.</p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"ZAYA CODE HUB" <${gmailUser}>`,
        to: destinationEmail,
        subject: `[ZAYA CODE HUB] Task Assigned (Due 17 Sept): ${task.title}`,
        html: emailHtml,
      });
      console.log(`✅ Email sent successfully to ${destinationEmail}`);
      sentCount++;
    } catch (err) {
      console.error(`❌ Failed to send email to ${destinationEmail}:`, err.message);
    }
  }

  console.log(`\n🎉 Done! Successfully sent task notification emails to ${sentCount} interns.`);
}

run();
