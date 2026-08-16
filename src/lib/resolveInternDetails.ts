export function extractNameFromEmail(email: string): string {
  if (!email) return '';
  const username = email.split('@')[0].replace(/[0-9]/g, '');
  if (!username || username.toLowerCase() === 'intern') return '';
  
  const clean = username.replace(/[._-]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export function resolveInternName(profile?: any, application?: any, user?: any): string {
  // 1. Direct profile full_name if valid
  if (profile?.full_name && profile.full_name.trim() && profile.full_name !== 'Accepted Intern' && profile.full_name !== 'Portal User') {
    return profile.full_name.trim();
  }

  // 2. Application full_name if valid
  if (application?.full_name && application.full_name.trim()) {
    return application.full_name.trim();
  }

  // 3. User metadata full_name if valid
  if (user?.user_metadata?.full_name && user.user_metadata.full_name.trim() && user.user_metadata.full_name !== 'Portal User') {
    return user.user_metadata.full_name.trim();
  }

  // 4. Direct user full_name property
  if (user?.full_name && user.full_name.trim()) {
    return user.full_name.trim();
  }

  // 5. Extract name from email handle (e.g. shivshankarjayswal1@zayacodehub.com -> Shivshankar Jayswal)
  const targetEmail = profile?.email || user?.email || application?.email || '';
  const extracted = extractNameFromEmail(targetEmail);
  if (extracted) {
    return extracted;
  }

  return 'Verified Intern';
}

export function resolveInternPosition(profile?: any, application?: any, user?: any): string {
  if (profile?.position && profile.position !== 'Intern' && profile.position !== 'Processing Role...') {
    return profile.position.trim();
  }

  if (application?.position && application.position !== 'Intern') {
    return application.position.trim();
  }

  if (user?.user_metadata?.position) {
    return user.user_metadata.position.trim();
  }

  return 'Web Designer Intern';
}
