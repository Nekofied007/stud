import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose prose-indigo max-w-none">
          <p className="text-gray-600 mb-4">
            <strong>Last Updated:</strong> November 9, 2025
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using STUD (Studying Till Unlocking Dreams), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, do not use our service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            STUD is an AI-powered learning platform that:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Imports YouTube playlists as educational courses</li>
            <li>Generates automated transcriptions using OpenAI Whisper</li>
            <li>Creates quiz questions from video transcripts using GPT-4</li>
            <li>Provides an AI tutor for answering questions using RAG (Retrieval-Augmented Generation)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">
            To use STUD, you must create an account. You agree to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your password</li>
            <li>Be responsible for all activities under your account</li>
            <li>Notify us immediately of any unauthorized account access</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Acceptable Use Policy</h2>
          <p className="mb-4">
            You agree NOT to:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Import copyrighted content without permission</li>
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Attempt to reverse engineer or hack the platform</li>
            <li>Upload malicious code or viruses</li>
            <li>Abuse the AI tutor with spam or inappropriate questions</li>
            <li>Share your account credentials with others</li>
            <li>Use automated tools to scrape or access the service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Content and Intellectual Property</h2>
          <p className="mb-4">
            <strong>Your Content:</strong> You retain ownership of any content you import (YouTube playlists). By using our service, you grant us a license to process and display this content for the purpose of providing our services.
          </p>
          <p className="mb-4">
            <strong>Generated Content:</strong> AI-generated content (transcriptions, quiz questions, tutor responses) is provided "as is" and may contain errors. You are responsible for verifying accuracy.
          </p>
          <p className="mb-4">
            <strong>Our Platform:</strong> All code, design, and platform features are owned by STUD and protected by copyright laws.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Third-Party Services</h2>
          <p className="mb-4">
            Our service relies on third-party APIs:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>YouTube API:</strong> Subject to YouTube's Terms of Service. We do not host or store YouTube videos.</li>
            <li><strong>OpenAI API:</strong> AI-generated content is subject to OpenAI's usage policies.</li>
          </ul>
          <p className="mb-4">
            We are not responsible for issues arising from these third-party services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Disclaimer of Warranties</h2>
          <p className="mb-4">
            STUD is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not guarantee:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Accuracy of AI-generated content (transcriptions, quizzes, tutor responses)</li>
            <li>Uninterrupted or error-free service</li>
            <li>Security against unauthorized access</li>
            <li>Availability of imported YouTube content (videos may be deleted by creators)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, STUD shall not be liable for:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Any indirect, incidental, special, or consequential damages</li>
            <li>Loss of data, profits, or business opportunities</li>
            <li>Damages arising from use of the service or reliance on AI-generated content</li>
            <li>Issues arising from third-party services (YouTube, OpenAI)</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Termination</h2>
          <p className="mb-4">
            We may terminate or suspend your account at any time for:
          </p>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li>Violation of these Terms of Service</li>
            <li>Fraudulent or illegal activity</li>
            <li>Abuse of the platform</li>
          </ul>
          <p className="mb-4">
            You may delete your account at any time from your profile settings.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Governing Law</h2>
          <p className="mb-4">
            These terms are governed by the laws of [Your Jurisdiction]. Any disputes shall be resolved in the courts of [Your Jurisdiction].
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Service, contact us at:
          </p>
          <p className="mb-4">
            Email: <a href="mailto:legal@stud.example.com" className="text-indigo-600 hover:text-indigo-500">legal@stud.example.com</a>
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

export default TermsPage;
