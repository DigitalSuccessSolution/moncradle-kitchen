"use client";

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen font-sans pb-24 md:pb-8 pt-0 md:pt-8 max-w-5xl mx-auto">

      {/* Desktop Page Header */}
      <div className="hidden md:flex flex-col mb-4 px-1 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm md:text-base lg:text-lg text-slate-500 font-medium">Last updated: August 22, 2026</p>
      </div>

      {/* Content */}
      <div className="space-y-8 mt-2 px-4 md:px-0">
        <p className="text-[#ea580c] text-[15px] sm:text-base leading-relaxed font-medium">
          Welcome to Moncradle! We are deeply committed to protecting your privacy and ensuring the security of the personal and business information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use the Moncradle Kitchen Partner App.
        </p>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">1. Information We Collect</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-3">
            We collect information that you provide directly to us when you register as a kitchen partner, manage your profile, log hygiene checks, or communicate with our support team. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-[15px]">
            <li><strong>Personal & Business Information:</strong> Kitchen name, owner name, email address, phone number, and physical address.</li>
            <li><strong>Compliance & Safety Data:</strong> Hygiene logs, FSSAI/Food license certificates, and kitchen inspection records.</li>
            <li><strong>Operational Data:</strong> Real-time status of orders, cooking batches, meal preparation times, and inventory data.</li>
            <li><strong>Financial Information:</strong> Bank account details for processing payouts.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">2. How We Use Your Information</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-3">
            The data we collect is used strictly to operate the platform securely and efficiently. Specifically, we use your information to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-[15px]">
            <li>Assign and manage pediatric meal orders accurately based on your kitchen's capacity and menu.</li>
            <li>Monitor and enforce strict food safety and hygiene compliance protocols.</li>
            <li>Provide real-time order tracking to parents (status updates like "Preparing", "Ready").</li>
            <li>Process payments, calculate your earnings, and generate financial reports.</li>
            <li>Send you important administrative notifications and order alerts via push notifications.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">3. Data Sharing & Disclosure</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-3">
            We share your information only to facilitate the meal preparation and delivery process:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-[15px]">
            <li><strong>With Customers:</strong> Your kitchen's name and general location may be visible to parents ordering meals.</li>
            <li><strong>With Delivery Partners:</strong> The pickup address, contact number, and order readiness status are shared with riders assigned to pick up orders from your kitchen.</li>
            <li><strong>Legal Requirements:</strong> If required by food safety authorities, law enforcement, or other legal processes, compliance and hygiene data may be disclosed.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">4. Data Security</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            We implement robust physical, technical, and administrative security measures to protect your kitchen's data from unauthorized access, disclosure, or destruction. We securely encrypt sensitive financial and compliance documents.
          </p>
        </div>

        <div className="pb-8">
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">5. Contact Us</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact our support team at:</p>
          <a href="mailto:kitchen-support@moncradle.com" className="inline-block mt-2 font-medium text-[#ea580c] hover:underline">
            kitchen-support@moncradle.com
          </a>
        </div>
      </div>
    </div>
  );
}
