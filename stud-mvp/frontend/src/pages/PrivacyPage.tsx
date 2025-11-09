import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-indigo max-w-none">
          <p className="text-gray-600 mb-4">
            <strong>Last Updated:</strong> November 9, 2025
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>Account Information:</strong> Username, email address, and password (encrypted)</li>
            <li><strong>Usage Data:</strong> YouTube playlists you import, videos you watch, quiz answers, and tutor conversations</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device information, and access times</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Provide, maintain, and improve our learning platform</li>
            <li>Generate personalized quiz questions and AI tutor responses</li>
            <li>Communicate with you about updates and features</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Protect against fraud and unauthorized access</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Data Storage and Security</h2>
          <p className="mb-4">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Passwords are hashed using bcrypt (never stored in plain text)</li>
            <li>JWT tokens for secure authentication with 30-minute expiry</li>
            <li>HTTPS encryption for all data transmission</li>
            <li>Regular security audits and updates</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Third-Party Services</h2>
          <p className="mb-4">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>YouTube API:</strong> To fetch playlist and video metadata</li>
            <li><strong>OpenAI API:</strong> To generate transcriptions, quiz questions, and AI tutor responses</li>
            <li>These services have their own privacy policies governing their use of your information</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights (GDPR Compliance)</h2>
          <p className="mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>Access:</strong> Request a copy of all your personal data</li>
            <li><strong>Correction:</strong> Update your email or password at any time</li>
            <li><strong>Deletion:</strong> Delete your account and all associated data</li>
            <li><strong>Data Portability:</strong> Export your data in a structured format</li>
          </ul>
          <p className="mb-4">
            To exercise these rights, go to your profile settings or contact us at{' '}
            <a href="mailto:privacy@stud.example.com" className="text-indigo-600 hover:text-indigo-500">
              privacy@stud.example.com
            </a>
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Data Retention</h2>
          <p className="mb-4">
            We retain your data for as long as your account is active. When you delete your account:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>All personal information is permanently deleted within 30 days</li>
            <li>Anonymized usage statistics may be retained for analytics</li>
            <li>Backups are purged within 90 days</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Cookies</h2>
          <p className="mb-4">
            We use localStorage to store your JWT authentication token. No tracking cookies are used.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Children's Privacy</h2>
          <p className="mb-4">
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to This Policy</h2>
          <p className="mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated "Last Updated" date.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
          <p className="mb-4">
            If you have questions about this privacy policy, contact us at:
          </p>
          <p className="mb-4">
            Email: <a href="mailto:privacy@stud.example.com" className="text-indigo-600 hover:text-indigo-500">privacy@stud.example.com</a>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
