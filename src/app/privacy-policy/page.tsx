import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-foreground space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to ZAYA CODE HUB. We respect your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
              our website or use our services, including our internship programs and software development solutions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              We may collect personal identification information from you in a variety of ways, including, but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and location when you register for an account or apply for an internship.</li>
              <li><strong>Professional Data:</strong> Resumes, portfolios, GitHub links, and educational background provided during the application process.</li>
              <li><strong>Usage Data:</strong> Information on how the Service is accessed and used, including your IP address, browser type, and page interactions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-4">
              We use the collected data for various purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our Service.</li>
              <li>To notify you about changes to our Service.</li>
              <li>To review and process internship applications.</li>
              <li>To manage intern accounts and track task submissions.</li>
              <li>To provide customer support and respond to inquiries.</li>
              <li>To detect, prevent, and address technical issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <p className="leading-relaxed">
              We use administrative, technical, and physical security measures to help protect your personal information. 
              While we have taken reasonable steps to secure the personal information you provide to us, please be aware 
              that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission 
              can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Sharing</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or rent your personal identification information to others. We may share generic 
              aggregated demographic information not linked to any personal identification information regarding visitors 
              and users with our business partners, trusted affiliates, and advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Data Rights</h2>
            <p className="leading-relaxed">
              Depending on your location, you may have the following rights regarding your personal data: the right to access, 
              the right to rectification, the right to erasure, the right to restrict processing, the right to data portability, 
              and the right to object. If you wish to exercise any of these rights, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:<br /><br />
              <strong>ZAYA CODE HUB</strong><br />
              Email: privacy@zayacodehub.com<br />
              Address: 123 Tech Avenue, Suite 500, Silicon Valley, CA 94025
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
