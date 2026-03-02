// PrivacyPolicy.jsx (React example)
import React from "react";
import { Helmet } from "react-helmet-async";
const PrivacyPolicy = () => {
  return (
    <React.Fragment>
    <Helmet>
      <title>Privacy Policy - Panchmeshali</title>
       <meta
          name="description"
          content="Read Panchmeshali's privacy policy on how we protect user data and content."
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Privacy Policy - Panchmeshali" />
        <meta
          property="og:description"
          content="Read Panchmeshali's privacy policy on how we protect user data and content."
        />
        <meta property="og:url" content="https://www.panchmeshali.com/privacy" />
        <meta
          property="og:image"
          content="https://www.panchmeshali.com/logo.png"
        />
    </Helmet>

    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website or services.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Personal information like name, email, and contact details.</li>
        <li>Information automatically collected such as IP address, browser type, and usage data.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-4">
        <li>To provide, maintain, and improve our services.</li>
        <li>To communicate with you regarding updates or promotions.</li>
        <li>To monitor usage and enhance security.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Sharing Your Information</h2>
      <p className="mb-4">
        We do not sell your personal information. We may share information with trusted third-party service providers to help operate our services.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
      <p className="mb-4">
        We use cookies and similar technologies to enhance your experience. You can manage cookie preferences in your browser settings.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
      <p className="mb-4">
        You have the right to access, update, or delete your personal information. For any requests, please contact us at pachmeshalii@gmail.com.
      </p>

      <h2 className="text-2xl font-semibold mb-4">Changes to this Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.
      </p>

      <p className="text-sm text-gray-500 mt-6">Last updated: August 18, 2025</p>
    </div>
    </React.Fragment>
  );
};

export default PrivacyPolicy;
