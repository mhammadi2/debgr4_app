import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { z } from "zod";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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

    // Main email to you
    const mainEmail = {
      to: process.env.CONTACT_EMAIL || "your.gmail@gmail.com",
      from: "noreply@yourdomain.com", // Must be verified in SendGrid
      subject: `🔔 New Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact from DeBugR4</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
      replyTo: email,
    };

    // Confirmation email
    const confirmationEmail = {
      to: email,
      from: "noreply@yourdomain.com",
      subject: "✅ Thank you for contacting DeBugR4!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank You for Contacting DeBugR4!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for reaching out to us! We have received your message and will respond within 24 hours.</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Your message:</strong> ${subject}</p>
            <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Best regards,<br>The DeBugR4 Team</p>
        </div>
      `,
    };

    // Send emails
    await sgMail.send(mainEmail);
    console.log("✅ Main email sent via SendGrid");

    try {
      await sgMail.send(confirmationEmail);
      console.log("✅ Confirmation email sent via SendGrid");
    } catch (confirmError) {
      console.warn("⚠️ Confirmation email failed:", confirmError);
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ SendGrid error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to send message. Please try again or call us directly at (331) 588-5937.",
      },
      { status: 500 }
    );
  }
}
