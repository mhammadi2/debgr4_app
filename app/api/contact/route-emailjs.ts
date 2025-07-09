import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    // Send email via EmailJS REST API
    const emailJSResponse = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            to_email: process.env.CONTACT_EMAIL || "your.gmail@gmail.com",
          },
        }),
      }
    );

    if (!emailJSResponse.ok) {
      throw new Error(`EmailJS failed: ${emailJSResponse.status}`);
    }

    console.log("✅ Email sent via EmailJS");

    // Send confirmation email
    const confirmationResponse = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_CONFIRMATION_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: {
            to_name: name,
            to_email: email,
            subject: subject,
            message: message,
          },
        }),
      }
    );

    if (confirmationResponse.ok) {
      console.log("✅ Confirmation email sent via EmailJS");
    } else {
      console.warn("⚠️ Confirmation email failed");
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ EmailJS error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to send message. Please try again or call us directly at (331) 588-5937.",
      },
      { status: 500 }
    );
  }
}
