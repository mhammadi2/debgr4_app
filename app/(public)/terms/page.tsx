"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function TermsAndConditionsPage() {
  const [isClient, setIsClient] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    setIsClient(true);

    // Handle smooth scrolling to sections
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPos = window.scrollY + 100;

      sections.forEach((section) => {
        const element = section as HTMLElement;
        if (
          element.offsetTop <= scrollPos &&
          element.offsetTop + element.offsetHeight > scrollPos
        ) {
          setActiveSection(element.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Login
            </Link>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="text-sm">Last updated: December 15, 2024</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Terms and Conditions
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using our
              services. By accessing or using DeBugR4, you agree to be bound by
              these terms.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { id: "acceptance", title: "1. Acceptance of Terms" },
                { id: "definitions", title: "2. Definitions" },
                { id: "account", title: "3. User Accounts" },
                { id: "products", title: "4. Products and Services" },
                { id: "orders", title: "5. Orders and Payment" },
                { id: "shipping", title: "6. Shipping and Delivery" },
                { id: "returns", title: "7. Returns and Refunds" },
                { id: "intellectual", title: "8. Intellectual Property" },
                { id: "privacy", title: "9. Privacy Policy" },
                { id: "prohibited", title: "10. Prohibited Uses" },
                { id: "limitation", title: "11. Limitation of Liability" },
                { id: "termination", title: "12. Termination" },
                { id: "governing", title: "13. Governing Law" },
                { id: "contact", title: "14. Contact Information" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left p-2 rounded text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-gray max-w-none">
            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                1. Acceptance of Terms
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Welcome to DeBugR4! These Terms and Conditions ("Terms")
                  govern your use of our website, mobile application, and
                  services (collectively, the "Service") operated by DeBugR4
                  ("us", "we", or "our").
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by
                  these Terms. If you disagree with any part of these terms,
                  then you may not access the Service.
                </p>
                <p>
                  We reserve the right to update these Terms at any time.
                  Changes will be effective immediately upon posting. Your
                  continued use of the Service constitutes acceptance of the
                  updated Terms.
                </p>
              </div>
            </section>

            {/* Section 2: Definitions */}
            <section id="definitions" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="space-y-2">
                  <li>
                    <strong>"Account"</strong> means a unique account created
                    for you to access our Service.
                  </li>
                  <li>
                    <strong>"Company"</strong> (referred to as "we", "us", or
                    "our") refers to DeBugR4.
                  </li>
                  <li>
                    <strong>"Service"</strong> refers to the website, mobile
                    application, and related services.
                  </li>
                  <li>
                    <strong>"User"</strong> or "You" refers to the individual
                    accessing or using the Service.
                  </li>
                  <li>
                    <strong>"Content"</strong> refers to any text, images,
                    videos, or other materials on our Service.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3: User Accounts */}
            <section id="account" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold">3.1 Account Creation</h3>
                <p>
                  To use certain features of our Service, you must create an
                  account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                </ul>

                <h3 className="text-lg font-semibold">
                  3.2 Account Responsibilities
                </h3>
                <p>
                  You are responsible for maintaining the confidentiality of
                  your account and password. You agree to notify us immediately
                  of any unauthorized use of your account.
                </p>

                <h3 className="text-lg font-semibold">
                  3.3 Account Termination
                </h3>
                <p>
                  We may terminate or suspend your account at our sole
                  discretion, without notice, for conduct that violates these
                  Terms or is harmful to other users or our business.
                </p>
              </div>
            </section>

            {/* Section 4: Products and Services */}
            <section id="products" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                4. Products and Services
              </h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold">
                  4.1 Product Information
                </h3>
                <p>
                  We strive to provide accurate product descriptions, pricing,
                  and availability. However, we do not warrant that product
                  descriptions are accurate, complete, reliable, current, or
                  error-free.
                </p>

                <h3 className="text-lg font-semibold">4.2 Pricing</h3>
                <p>
                  All prices are subject to change without notice. We reserve
                  the right to modify prices at any time. The price charged will
                  be the price displayed at the time of purchase.
                </p>

                <h3 className="text-lg font-semibold">4.3 Availability</h3>
                <p>
                  Product availability is subject to change. We reserve the
                  right to discontinue any product at any time without notice.
                </p>
              </div>
            </section>

            {/* Section 5: Orders and Payment */}
            <section id="orders" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Orders and Payment</h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold">5.1 Order Acceptance</h3>
                <p>
                  We reserve the right to refuse or cancel any order for any
                  reason, including suspected fraud, product unavailability, or
                  errors in pricing.
                </p>

                <h3 className="text-lg font-semibold">5.2 Payment Methods</h3>
                <p>
                  We accept various payment methods including credit cards,
                  debit cards, and digital payment services. Payment is due at
                  the time of order.
                </p>

                <h3 className="text-lg font-semibold">
                  5.3 Payment Processing
                </h3>
                <p>
                  All payments are processed securely through third-party
                  payment processors. We do not store your payment information
                  on our servers.
                </p>
              </div>
            </section>

            {/* Section 6: Shipping and Delivery */}
            <section id="shipping" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                6. Shipping and Delivery
              </h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold">6.1 Shipping Methods</h3>
                <p>
                  We offer various shipping options with different delivery
                  times and costs. Shipping costs are calculated at checkout
                  based on your location and chosen method.
                </p>

                <h3 className="text-lg font-semibold">6.2 Delivery Times</h3>
                <p>
                  Delivery times are estimates and may vary due to factors
                  beyond our control. We are not responsible for delays caused
                  by shipping carriers or customs.
                </p>

                <h3 className="text-lg font-semibold">6.3 Risk of Loss</h3>
                <p>
                  Risk of loss and title for products pass to you upon delivery
                  to the shipping carrier.
                </p>
              </div>
            </section>

            {/* Section 7: Returns and Refunds */}
            <section id="returns" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                7. Returns and Refunds
              </h2>
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-semibold">7.1 Return Policy</h3>
                <p>
                  We accept returns within 30 days of delivery for most items in
                  their original condition. Some items may have specific return
                  restrictions.
                </p>

                <h3 className="text-lg font-semibold">7.2 Return Process</h3>
                <p>
                  To initiate a return, contact our customer service team. We
                  will provide instructions and a return authorization number.
                </p>

                <h3 className="text-lg font-semibold">7.3 Refunds</h3>
                <p>
                  Refunds will be processed to the original payment method
                  within 5-10 business days after we receive and process your
                  return.
                </p>
              </div>
            </section>

            {/* Section 8: Intellectual Property */}
            <section id="intellectual" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                8. Intellectual Property
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  The Service and its original content, features, and
                  functionality are and will remain the exclusive property of
                  DeBugR4 and its licensors. The Service is protected by
                  copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You may not modify, reproduce, distribute, or create
                  derivative works based on our Service without our express
                  written permission.
                </p>
              </div>
            </section>

            {/* Section 9: Privacy Policy */}
            <section id="privacy" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Privacy Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains
                  how we collect, use, and protect your information when you use
                  our Service.
                </p>
                <p>
                  By using our Service, you agree to the collection and use of
                  information in accordance with our Privacy Policy.
                </p>
              </div>
            </section>

            {/* Section 10: Prohibited Uses */}
            <section id="prohibited" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Prohibited Uses</h2>
              <div className="space-y-4 text-gray-700">
                <p>You agree not to use the Service:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    For any unlawful purpose or to solicit others to perform
                    unlawful acts
                  </li>
                  <li>
                    To violate any international, federal, provincial, or state
                    regulations, rules, laws, or local ordinances
                  </li>
                  <li>
                    To infringe upon or violate our intellectual property rights
                    or the intellectual property rights of others
                  </li>
                  <li>
                    To harass, abuse, insult, harm, defame, slander, disparage,
                    intimidate, or discriminate
                  </li>
                  <li>To submit false or misleading information</li>
                  <li>
                    To upload or transmit viruses or any other type of malicious
                    code
                  </li>
                  <li>
                    To spam, phish, pharm, pretext, spider, crawl, or scrape
                  </li>
                  <li>For any obscene or immoral purpose</li>
                  <li>
                    To interfere with or circumvent the security features of the
                    Service
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 11: Limitation of Liability */}
            <section id="limitation" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                11. Limitation of Liability
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  To the fullest extent permitted by law, DeBugR4 shall not be
                  liable for any indirect, incidental, special, consequential,
                  or punitive damages, including without limitation, loss of
                  profits, data, use, goodwill, or other intangible losses.
                </p>
                <p>
                  Our total liability to you for all claims arising out of or
                  relating to these Terms or the Service shall not exceed the
                  amount paid by you to us in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            {/* Section 12: Termination */}
            <section id="termination" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">12. Termination</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may terminate or suspend your account and bar access to the
                  Service immediately, without prior notice or liability, under
                  our sole discretion, for any reason whatsoever and without
                  limitation.
                </p>
                <p>
                  Upon termination, your right to use the Service will cease
                  immediately. If you wish to terminate your account, you may
                  simply discontinue using the Service.
                </p>
              </div>
            </section>

            {/* Section 13: Governing Law */}
            <section id="governing" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  These Terms shall be interpreted and governed by the laws of
                  the jurisdiction in which DeBugR4 operates, without regard to
                  its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising under these Terms shall be resolved in
                  the courts of competent jurisdiction in our operating
                  location.
                </p>
              </div>
            </section>

            {/* Section 14: Contact Information */}
            <section id="contact" className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                14. Contact Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions about these Terms and Conditions,
                  please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-semibold">Email</p>
                        <p className="text-sm text-gray-600">
                          legal@debugr4.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-semibold">Phone</p>
                        <p className="text-sm text-gray-600">
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start md:col-span-2">
                      <MapPin className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-sm text-gray-600">
                          123 Business Street
                          <br />
                          Suite 100
                          <br />
                          City, State 12345
                          <br />
                          United States
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            © 2024 DeBugR4. All rights reserved. |
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-500 ml-1"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
