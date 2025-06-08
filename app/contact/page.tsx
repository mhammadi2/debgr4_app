"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  User,
  MessageCircle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner"; // Assuming you're using sonner for notifications

// Define interface for form data
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  // State management
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Form validation function
  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form before submission
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
        // Success handling
        toast.success("Message sent successfully!");
        setSubmitted(true);
        // Reset form data
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        // Error handling
        toast.error(result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable input component
  const ContactInput = ({
    name,
    label,
    type = "text",
    icon: Icon,
    value,
    onChange,
    isTextArea = false,
  }: {
    name: keyof ContactFormData;
    label: string;
    type?: string;
    icon: React.ElementType;
    value: string;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    isTextArea?: boolean;
  }) => {
    const commonClasses = `w-full px-3 py-2 border rounded-md focus:outline-none ${
      errors[name]
        ? "border-red-500 focus:ring-2 focus:ring-red-500"
        : "focus:ring-2 focus:ring-blue-500"
    }`;

    return (
      <div>
        <label htmlFor={name} className="flex items-center mb-2">
          <Icon className="mr-2 text-blue-600" />
          {label}
        </label>
        {isTextArea ? (
          <textarea
            id={name}
            name={name}
            required
            value={value}
            onChange={onChange}
            rows={4}
            className={commonClasses}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            required
            value={value}
            onChange={onChange}
            className={commonClasses}
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        )}
        {errors[name] && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="mr-1 w-4 h-4" /> {errors[name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Contact DeBugR4
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Have a project in mind or questions about our semiconductor design
          services? We're here to help you innovate.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white shadow-lg rounded-lg p-8"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <ContactInput
                name="name"
                label="Full Name"
                icon={User}
                value={formData.name}
                onChange={handleChange}
              />
              <ContactInput
                name="email"
                label="Email Address"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
              />
              <ContactInput
                name="subject"
                label="Subject"
                icon={MessageCircle}
                value={formData.subject}
                onChange={handleChange}
              />
              <ContactInput
                name="message"
                label="Your Message"
                icon={Send}
                value={formData.message}
                onChange={handleChange}
                isTextArea
              />

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-md transition-colors flex items-center justify-center ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                Message Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for reaching out. Our team will get back to you soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
              >
                Send Another Message
              </button>
            </div>
          )}
        </motion.div>

        {/* Contact Information Side */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-100 rounded-lg p-8 space-y-6"
        >
          {/* Contact Details Remain the Same */}
          {/* ... (previous contact details code) ... */}
        </motion.div>
      </div>
    </motion.div>
  );
}
