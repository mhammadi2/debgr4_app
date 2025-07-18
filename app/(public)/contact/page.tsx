// app/(public)/contact/page.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Send,
  User,
  MessageCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner"; // Ensure 'sonner' is installed and configured in your _app.tsx or layout.tsx

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactInputProps {
  name: string;
  label: string;
  type?: string;
  icon: React.ElementType;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
  isTextArea?: boolean;
  maxLength?: number;
  placeholder?: string;
}

const ContactInput: React.FC<ContactInputProps> = ({
  name,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  error,
  isTextArea = false,
  maxLength,
  placeholder,
}) => {
  const commonClasses = `w-full px-4 py-3 border rounded-lg focus:outline-none transition-all duration-200 resize-none ${
    error
      ? "border-red-500 focus:ring-2 focus:ring-red-500 bg-red-50"
      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
  }`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="flex items-center justify-between font-medium text-gray-700"
      >
        <span className="flex items-center">
          <Icon className="mr-2 text-blue-600" size={18} />
          {label}
        </span>
        {maxLength && (
          <span className="text-sm text-gray-500">
            {value.length}/{maxLength}
          </span>
        )}
      </label>

      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={6}
          maxLength={maxLength}
          className={commonClasses}
          placeholder={placeholder}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          className={commonClasses}
          placeholder={placeholder}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      )}

      {error && (
        <p
          id={`${name}-error`}
          className="text-red-500 text-sm flex items-center"
          role="alert"
        >
          <AlertCircle className="mr-1 w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const validation = useMemo(() => {
    const newErrors: Partial<ContactFormData> = {};

    if (formData.name.trim() && formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.subject.trim() && formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (formData.message.trim() && formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    return newErrors;
  }, [formData]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error as user types
      if (errors[name as keyof ContactFormData]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      toast.error("Please correct the errors in the form.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully!");
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setErrors({});
      } else {
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setErrors({});
  }, []);

  // Show loading skeleton during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-10 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded max-w-3xl mx-auto animate-pulse"></div>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white shadow-xl rounded-lg p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8 shadow-xl">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-white rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Contact DeBugR4
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have a project in mind or questions about our services? We're here
            to help you innovate.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white shadow-xl rounded-lg p-8"
          >
            {!submitted ? (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <Mail className="mr-3 text-blue-600" />
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <ContactInput
                    name="name"
                    label="Full Name"
                    icon={User}
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    maxLength={50}
                    placeholder="Enter your full name"
                  />

                  <ContactInput
                    name="email"
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    maxLength={100}
                    placeholder="Enter your email address"
                  />

                  <ContactInput
                    name="subject"
                    label="Subject"
                    icon={MessageCircle}
                    value={formData.subject}
                    onChange={handleChange}
                    error={errors.subject}
                    maxLength={100}
                    placeholder="Enter the subject of your message"
                  />

                  <ContactInput
                    name="message"
                    label="Your Message"
                    icon={Send}
                    value={formData.message}
                    onChange={handleChange}
                    error={errors.message}
                    isTextArea
                    maxLength={1000}
                    placeholder="Enter your message here. Please be as detailed as possible..."
                  />

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Form Completion:</span>
                      <span className="font-semibold">
                        {Object.values(formData).filter((v) => v.trim()).length}
                        /4 fields
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(Object.values(formData).filter((v) => v.trim()).length / 4) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center font-semibold text-lg ${
                      isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2" size={20} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle
                  className="mx-auto text-green-600 mb-6"
                  size={80}
                />
                <h2 className="text-3xl font-bold text-green-600 mb-4">
                  Message Sent Successfully!
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Thank you for reaching out. Our team will get back to you
                  within 24 hours.
                </p>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 font-semibold">
                      What happens next?
                    </p>
                    <ul className="text-green-700 text-sm mt-2 space-y-1">
                      <li>✓ You'll receive a confirmation email shortly</li>
                      <li>✓ Our team will review your message</li>
                      <li>✓ We'll respond within 24 hours</li>
                    </ul>
                  </div>
                  <button
                    onClick={resetForm}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Contact Information (Updated to use contactus@dbr4.com) */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8 shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Phone className="mr-3 text-green-600" />
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-green-100 p-3 rounded-full">
                  <Phone className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Call Us</h3>
                  <p className="text-gray-600 font-mono">(331) 588-5937</p>
                  <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Mail className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Email Us</h3>
                  <p className="text-gray-600">contactus@dbr4.com</p>{" "}
                  {/* Updated email */}
                  <p className="text-sm text-gray-500">
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>
              {/* Other contact info, services etc. */}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
