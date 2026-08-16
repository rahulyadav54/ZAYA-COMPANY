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
  console.log('Please add GMAIL_APP_PASS=xxxx to your .env file first.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLIC_ANON_KEY);

async function run() {
  console.log('🚀 Starting email dispatch for already assigned tasks...');
  console.log(`Connecting to Supabase at: ${SUPABASE_PROJECT_URL}`);
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

  // Resolve profiles to match intern_id if needed
  const { data: profiles } = await supabase.from('profiles').select('id, email, full_name');
  const profMap = new Map();
  if (profiles) {
    profiles.forEach(p => profMap.set(p.id, p));
  }

  // Resolve applications to match intern_id if needed
  const { data: applications } = await supabase.from('applications').select('user_id, email, full_name');
  const appMap = new Map();
  if (applications) {
    applications.forEach(a => {
      if (a.user_id) appMap.set(a.user_id, a);
    });
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
    // Resolve email and name
    let email = task.intern_email;
    let name = task.intern_name;

    if (!email && task.intern_id) {
      const p = profMap.get(task.intern_id);
      if (p) {
        email = p.email;
        name = p.full_name;
      } else {
        const a = appMap.get(task.intern_id);
        if (a) {
          email = a.email;
          name = a.full_name;
        }
      }
    }

    if (!email) {
      console.warn(`⚠️ Skipped task #${task.id}: Cannot resolve intern email address.`);
      continue;
    }

    console.log(`✉️ Sending task notification to ${name || 'Intern'} (${email})...`);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">ZAYA CODE HUB</h2>
          <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">New Task Assigned</p>
        </div>
        <div style="margin-bottom: 20px;">
          <p>Hello <strong>${name || 'Intern'}</strong>,</p>
          <p>A new task/project has been assigned to you. Here are the details:</p>
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
              <td style="padding: 4px 0; color: #ef4444;">${task.deadline || 'N/A'}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
          <a href="https://www.zayacodehub.in/login" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Task on Dashboard</a>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
          <p>This is an automated message from ZAYA CODE HUB. Please do not reply directly to this email.</p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"ZAYA CODE HUB" <${gmailUser}>`,
        to: email,
        subject: `[ZAYA CODE HUB] Task Assignment: ${task.title}`,
        html: emailHtml,
      });
      console.log(`✅ Email sent successfully to ${email}`);
      sentCount++;
    } catch (err) {
      console.error(`❌ Failed to send email to ${email}:`, err.message);
    }
  }

  console.log(`\n🎉 Done! Successfully notified ${sentCount} interns.`);
}

run();
