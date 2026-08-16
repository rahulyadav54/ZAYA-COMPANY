/**
 * Standard Premium Email Templates for ZAYA CODE HUB
 * Designed for perfect cross-client alignment (Gmail, Apple Mail, Outlook, Mobile)
 */

interface TaskEmailProps {
  internName: string;
  taskTitle: string;
  description: string;
  priority?: string;
  deadline?: string;
  loginUrl?: string;
}

export function renderTaskAssignedEmail({
  internName,
  taskTitle,
  description,
  priority = 'HIGH',
  deadline = '17 September 2026',
  loginUrl = 'https://www.zayacodehub.in/login'
}: TaskEmailProps): string {
  const formattedDesc = (description || 'Please refer to your dashboard for complete project guidelines and resources.')
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin: 0 0 10px 0; color: #334155; font-size: 14px; line-height: 1.6;">${p}</p>`)
    .join('');

  const priorityColor = priority.toUpperCase() === 'HIGH' 
    ? '#dc2626' 
    : priority.toUpperCase() === 'MEDIUM' 
    ? '#d97706' 
    : '#16a34a';

  const priorityBg = priority.toUpperCase() === 'HIGH' 
    ? '#fef2f2' 
    : priority.toUpperCase() === 'MEDIUM' 
    ? '#fffbeb' 
    : '#f0fdf4';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Task Assignment - ZAYA CODE HUB</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px;">ZAYA CODE HUB</h1>
              <p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Internship & Project Management</p>
            </td>
          </tr>

          <!-- Notification Pill & Salutation -->
          <tr>
            <td style="padding: 30px 30px 10px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 6px 14px; background-color: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 20px; border: 1px solid #bfdbfe;">
                      📌 New Assignment
                    </span>
                    <h2 style="margin: 16px 0 6px 0; color: #0f172a; font-size: 20px; font-weight: 800;">
                      Hello ${internName || 'Intern'},
                    </h2>
                    <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                      A new project task has been officially assigned to you. Please review the details below and plan your submission accordingly.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Task Card Box -->
          <tr>
            <td style="padding: 15px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <tr>
                  <td>
                    <!-- Task Title -->
                    <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Task Title</div>
                    <div style="font-size: 17px; font-weight: 800; color: #1e293b; margin-bottom: 16px;">
                      ${taskTitle}
                    </div>

                    <!-- Meta specs (Priority & Deadline) -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin-bottom: 16px; padding: 12px 0;">
                      <tr>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Priority</div>
                          <div style="margin-top: 4px;">
                            <span style="display: inline-block; padding: 4px 10px; background-color: ${priorityBg}; color: ${priorityColor}; font-size: 11px; font-weight: 800; border-radius: 6px; text-transform: uppercase;">
                              ${priority.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td width="50%" style="vertical-align: top;">
                          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Submission Deadline</div>
                          <div style="margin-top: 4px; font-size: 13px; font-weight: 800; color: #dc2626;">
                            📅 ${deadline}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Task Description -->
                    <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Description & Requirements</div>
                    <div style="margin: 0;">
                      ${formattedDesc}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td style="padding: 20px 30px 30px 30px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                    <a href="${loginUrl}" target="_blank" style="font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 8px; background-color: #2563eb; letter-spacing: 0.5px;">
                      Open Dashboard & Submit Work →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px;">
                Direct link: <a href="${loginUrl}" style="color: #2563eb; text-decoration: underline;">${loginUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">
                ZAYA CODE HUB • Technical Training & Internship Portal
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                This is an automated notification. For assistance, contact your mentor or reply to <a href="mailto:zayacodehub@gmail.com" style="color: #64748b;">zayacodehub@gmail.com</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

interface CustomEmailProps {
  recipientName: string;
  subject: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function renderCustomEmail({
  recipientName,
  subject,
  message,
  ctaText,
  ctaUrl
}: CustomEmailProps): string {
  const formattedParagraphs = message
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.6;">${p}</p>`)
    .join('');

  const ctaButtonHtml = ctaUrl && ctaUrl.trim() ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 24px auto;">
      <tr>
        <td align="center" style="border-radius: 8px; background-color: #2563eb;">
          <a href="${ctaUrl.trim()}" target="_blank" style="font-size: 14px; font-weight: 800; color: #ffffff; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 8px; background-color: #2563eb; letter-spacing: 0.5px;">
            ${ctaText && ctaText.trim() ? ctaText.trim() : 'View Details →'}
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px;">ZAYA CODE HUB</h1>
              <p style="margin: 6px 0 0 0; color: #93c5fd; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Official Announcement</p>
            </td>
          </tr>

          <!-- Message Body Container -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 6px 14px; background-color: #f0fdf4; color: #16a34a; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 20px; border: 1px solid #bbf7d0;">
                      📢 Notice
                    </span>
                    <h2 style="margin: 16px 0 6px 0; color: #0f172a; font-size: 20px; font-weight: 800;">
                      Hello ${recipientName || 'Intern'},
                    </h2>
                    <div style="margin-top: 16px;">
                      ${formattedParagraphs}
                    </div>

                    ${ctaButtonHtml}

                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #475569; font-size: 14px; font-weight: 700;">Best regards,</p>
                      <p style="margin: 4px 0 0 0; color: #1e293b; font-size: 14px; font-weight: 800;">ZAYA CODE HUB Team</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 30px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: 600;">
                ZAYA CODE HUB • Technical Training & Internship Portal
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                This message was sent from the administrator portal. Reply directly to <a href="mailto:zayacodehub@gmail.com" style="color: #64748b;">zayacodehub@gmail.com</a> if you have any questions.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
