import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-foreground space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="leading-relaxed">
              By accessing our website and using our services, you agree to be bound by these Terms of Service and all 
              applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from 
              using or accessing this site. The materials contained in this website are protected by applicable copyright 
              and trademark law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on ZAYA CODE HUB's 
              website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
              and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>Attempt to decompile or reverse engineer any software contained on ZAYA CODE HUB's website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Internship Program Guidelines</h2>
            <p className="leading-relaxed">
              Interns admitted to the ZAYA CODE HUB internship program agree to comply with all assigned tasks, coding standards, 
              and submission deadlines. Access to the intern portal is strictly for the authorized user, and sharing login 
              credentials is a violation of these terms, which may result in immediate termination from the program.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Disclaimer</h2>
            <p className="leading-relaxed">
              The materials on ZAYA CODE HUB's website are provided on an 'as is' basis. ZAYA CODE HUB makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied 
              warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual 
              property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Limitations</h2>
            <p className="leading-relaxed">
              In no event shall ZAYA CODE HUB or its suppliers be liable for any damages (including, without limitation, damages 
              for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials 
              on ZAYA CODE HUB's website, even if ZAYA CODE HUB or a ZAYA CODE HUB authorized representative has been notified orally 
              or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Revisions and Errata</h2>
            <p className="leading-relaxed">
              The materials appearing on ZAYA CODE HUB's website could include technical, typographical, or photographic errors. 
              ZAYA CODE HUB does not warrant that any of the materials on its website are accurate, complete, or current. ZAYA CODE HUB 
              may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Governing Law</h2>
            <p className="leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of California, United States, 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
