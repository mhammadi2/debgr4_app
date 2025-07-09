import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send main email to you
    const { data, error } = await resend.emails.send({
      from: "DeBugR4 Contact <noreply@yourdomain.com>",
      to: [process.env.CONTACT_EMAIL || "your.gmail@gmail.com"],
      subject: `🔔 New Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #3b82f6); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🚀 New Contact from DeBugR4</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold; color: #555;">👤 Name:</td>
                  <td style="padding: 10px; color: #777;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold; color: #555;">📧 Email:</td>
                  <td style="padding: 10px; color: #777;">${email}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px; font-weight: bold; color: #555;">📝 Subject:</td>
                  <td style="padding: 10px; color: #777;">${subject}</td>
                </tr>
              </table>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <h3 style="color: #333; margin-top: 0;">💬 Message:</h3>
                <p style="color: #555; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; margin-top: 15px; font-size: 14px;">
                <strong>📅 Received:</strong> ${new Date().toLocaleString()}<br>
                <strong>🔗 Reply to:</strong> ${email}
              </div>
            </div>
          </div>
        </div>
      `,
      replyTo: email,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw error;
    }

    console.log("✅ Main email sent via Resend");

    // Send confirmation email to user
    const confirmationResult = await resend.emails.send({
      from: "DeBugR4 Team <noreply@yourdomain.com>",
      to: [email],
      subject: "✅ Thank you for contacting DeBugR4!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #3b82f6); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 Thank You!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p style="font-size: 18px; color: #333; margin-bottom: 15px;">Hi ${name},</p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
                Thank you for contacting DeBugR4! We have received your message and will respond within 24 hours.
              </p>
              
              <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p style="margin: 0; color: #0369a1;"><strong>📝 Your message:</strong> ${subject}</p>
                <p style="margin: 5px 0 0 0; color: #0369a1; font-size: 14px;">Sent: ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background: #dcfce7; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4 style="color: #166534; margin: 0 0 10px 0;">What happens next?</h4>
                <ul style="color: #166534; margin: 0; padding-left: 20px;">
                  <li>✅ We'll review your message</li>
                  <li>✅ Our team will respond within 24 hours</li>
                  <li>✅ You'll receive a detailed response via email</li>
                </ul>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
                For urgent matters, call us at <strong>📞 (331) 588-5937</strong> during business hours.
              </p>
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #333; font-weight: bold;">
                  Best regards,<br>
                  🚀 The DeBugR4 Team
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>DeBugR4 - IC & Electronic Design<br>
              📧 info@debugr4.com | 📞 (331) 588-5937</p>
            </div>
          </div>
        </div>
      `,
    });

    if (confirmationResult.error) {
      console.warn("⚠️ Confirmation email failed:", confirmationResult.error);
    } else {
      console.log("✅ Confirmation email sent via Resend");
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ Contact form error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to send message. Please try again or call us directly at (331) 588-5937.",
      },
      { status: 500 }
    );
  }
}
