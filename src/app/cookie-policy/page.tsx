import React from 'react';

export default function CookiePolicyPage() {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Cookie Policy</h1>
          <p className="text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-foreground space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
              They are widely used to make websites work or work more efficiently, as well as to provide information to 
              the owners of the site. Cookies enable our systems to recognize your browser and capture and remember certain information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
            <p className="leading-relaxed mb-4">
              We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard 
              options for disabling cookies without completely disabling the functionality and features they add to this site.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Authentication:</strong> We use cookies to identify you when you visit our website and as you navigate our platform, especially within the admin and intern portals.</li>
              <li><strong>Status:</strong> We use cookies to help us determine if you are logged into our secure environment.</li>
              <li><strong>Security:</strong> We use cookies as an element of the security measures used to protect user accounts, including preventing fraudulent use of login credentials.</li>
              <li><strong>Preferences:</strong> We use cookies to store your preferences, such as your theme (Light/Dark mode) settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Types of Cookies We Use</h2>
            <p className="leading-relaxed mb-4">
              We utilize the following types of cookies:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Essential Cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features.</li>
              <li><strong>Functional Cookies:</strong> These cookies are used to enhance the performance and functionality of our website but are non-essential to their use.</li>
              <li><strong>Analytics Cookies:</strong> These cookies collect information that is used in aggregate form to help us understand how our website is being used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Third-Party Cookies</h2>
            <p className="leading-relaxed">
              In some special cases, we also use cookies provided by trusted third parties. This site uses analytics solutions 
              to help us understand how you use the site and ways that we can improve your experience. These cookies may track 
              things such as how long you spend on the site and the pages that you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Managing Cookies</h2>
            <p className="leading-relaxed">
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the 
              ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be 
              personalized to you. It may also stop you from saving customized settings like login information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions or concerns regarding our Cookie Policy, please contact us at 
              <strong> privacy@zayacodehub.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
