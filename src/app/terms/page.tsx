"use client";

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen font-sans pb-24 md:pb-8 pt-0 md:pt-8 max-w-5xl mx-auto">

      {/* Desktop Page Header */}
      <div className="hidden md:flex flex-col mb-4 px-1 lg:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm md:text-base lg:text-lg text-slate-500 font-medium">Last updated: August 22, 2026</p>
      </div>

      {/* Content */}
      <div className="space-y-8 mt-2 px-4 md:px-0">
        <p className="text-[#ea580c] text-[15px] sm:text-base leading-relaxed font-medium">
          Welcome to Moncradle! By accessing or using our Kitchen Partner App, web dashboard, and related services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
        </p>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">1. Acceptance of Terms</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            These Terms form a legally binding contract between your kitchen business and Moncradle. By registering for a kitchen partner account, you represent that you have the legal authority to bind your business, hold valid food safety and operational licenses, and agree to these Terms.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">2. Independent Partner Status</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            You acknowledge and agree that your relationship with Moncradle is that of an independent business partner. Nothing in these Terms creates an employment, partnership, joint venture, or agency relationship between you and Moncradle. You are solely responsible for your own staff, kitchen operations, and legal compliance.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">3. Service & Quality Obligations</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-3">As a Moncradle Kitchen Partner, you strictly agree to:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-[15px]">
            <li>Prepare all meals in strict accordance with the provided dietary requirements and recipes for pediatric nutrition.</li>
            <li>Maintain the highest standards of food safety, hygiene, and cleanliness at all times, and regularly submit required hygiene logs via the App.</li>
            <li>Ensure orders are prepared and marked "Ready" promptly within the requested timeframe.</li>
            <li>Use appropriate, safe, and tamper-evident packaging before handing orders to delivery partners.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">4. App Usage & Content</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-3">
            Moncradle grants you a personal, non-exclusive, non-transferable license to use the Kitchen App for the purpose of receiving and managing orders. You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-[15px]">
            <li>Modify, copy, distribute, or reverse engineer the App or any of its contents.</li>
            <li>Provide false information regarding order statuses or hygiene logs.</li>
            <li>Use the Services for any unauthorized or illegal purpose.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">5. Payments and Payouts</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            Your earnings are calculated based on completed and successfully dispatched orders, subject to Moncradle's current commercial agreements and commission structures. Payouts are processed on a scheduled basis. Moncradle reserves the right to withhold or adjust payments in the event of proven food quality issues, missing items, or policy violations.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">6. Limitation of Liability</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            To the maximum extent permitted by law, Moncradle shall not be liable for any indirect, incidental, special, or consequential damages, or any loss of profits, arising from your use of the Services or any issues arising from the food prepared by your kitchen. You remain fully liable for the safety and quality of the meals you prepare.
          </p>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">7. Account Suspension & Termination</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            Moncradle reserves the right to temporarily suspend or permanently terminate your account if you violate these terms, fail hygiene inspections, receive repeated critical complaints regarding food safety, or fail to maintain valid operational licenses.
          </p>
        </div>

        <div className="pb-8">
          <h2 className="text-lg sm:text-xl font-medium text-slate-900 mb-3 tracking-tight">8. Contact Information</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">If you have any questions about these Terms, please contact our legal team at:</p>
          <a href="mailto:legal@moncradle.com" className="inline-block mt-2 font-medium text-[#ea580c] hover:underline">
            legal@moncradle.com
          </a>
        </div>
      </div>
    </div>
  );
}
