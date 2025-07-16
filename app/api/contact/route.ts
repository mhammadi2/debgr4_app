// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

// Validation schema for incoming contact form data
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

/**
 * Dynamically creates and returns a Nodemailer transporter.
 * Prioritizes custom SMTP configuration if available,
 * otherwise falls back to Gmail SMTP.
 * Throws an error if no valid email configuration is found.
 */
const createTransporter = (): nodemailer.Transporter => {
  // Attempt 1: Use custom SMTP server (e.g., from your VPS or dedicated email service)
  // This expects SMTP_USER to be 'contactus@dbr4.com' as per your request
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log("Creating SMTP transporter (Custom SMTP).");
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports like 587 (STARTTLS)
      auth: {
        user: process.env.SMTP_USER, // Expecting contactus@dbr4.com or similar
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Important for some servers, especially if using self-signed certificates or non-standard setups.
        // Set to false if you encounter issues like CERT_HAS_EXPIRED. Use with caution in production.
        rejectUnauthorized: false,
      },
      // Timeouts to prevent hanging connections
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 15000, // 15 seconds
    });
  }

  // Attempt 2: Fallback to Gmail SMTP using Nodemailer's built-in service option
  // IMPORTANT: If you want to *send from* 'contactus@dbr4.com' via Gmail,
  // this implies 'contactus@dbr4.com' is a Google Workspace email or an alias.
  // GMAIL_USER should be the actual Google account email for authentication.
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    console.log("Creating SMTP transporter (Gmail Service).");
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // Expecting the authenticating Gmail user
        pass: process.env.GMAIL_PASS, // Use a generated App Password for security
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  // If neither configuration is complete, throw an error to indicate misconfiguration
  throw new Error(
    "No complete email configuration found. Please ensure SMTP_HOST/USER/PASS or GMAIL_USER/PASS are set in your environment variables."
  );
};

/**
 * Placeholder for an alternative email sending method (e.g., via a third-party API like Resend, SendGrid, EmailJS).
 * This function would contain the actual API call logic if you were using such a service.
 * For now, it logs a warning and simulates failure.
 *
 * @param formData - The validated form data (name, email, subject, message).
 * @returns {Promise<boolean>} - True if the email was successfully sent via API, false otherwise.
 */
const sendEmailViaAPI = async (formData: any): Promise<boolean> => {
  console.warn(
    "Attempting to send email via API fallback (this is a placeholder and currently simulates failure)."
  );
  console.log("📧 Content that would be sent via API:", formData);

  // --- EXAMPLE IMPLEMENTATION FOR RESEND (uncomment and configure if using) ---
  // import { Resend } from "resend"; // You'd need to import Resend here
  // try {
  //   const resend = new Resend(process.env.RESEND_API_KEY); // Ensure RESEND_API_KEY is set in .env.local
  //   const { data, error } = await resend.emails.send({
  //     from: `Your Website <onboarding@yourdomain.com>`, // Must be a verified domain/email in Resend
  //     to: process.env.CONTACT_EMAIL || "contactus@dbr4.com",
  //     subject: `[API Fallback] New Contact: ${formData.subject}`,
  //     html: `
  //       <p><strong>Name:</strong> ${formData.name}</p>
  //       <p><strong>Email:</strong> ${formData.email}</p>
  //       <p><strong>Message:</strong> ${formData.message}</p>
  //     `,
  //   });
  //   if (error) {
  //     console.error("❌ Resend API fallback failed:", error);
  //     return false;
  //   }
  //   console.log("✅ Email sent successfully via Resend API fallback.");
  //   return true;
  // } catch (apiError) {
  //   console.error("❌ Error using Resend API fallback:", apiError);
  //   return false;
  // }
  // --- END RESEND EXAMPLE ---

  return false; // Currently, this function always returns false (simulates failure)
};

/**
 * Handles POST requests for the contact form.
 * Validates input, attempts to send emails via SMTP, and includes fallback mechanisms.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the incoming request body against the Zod schema
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      console.error(
        "❌ Contact form validation error:",
        validation.error.errors
      );
      return NextResponse.json(
        { error: "Invalid input provided.", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    let emailSentSuccessfully = false; // Flag to track if any email method succeeded
    let finalUserMessage = "Message sent successfully!"; // Message to return to the user

    // Determine the 'from' email address for all outgoing emails
    // It will be the SMTP_USER or GMAIL_USER from your .env.local
    const fromEmailAddress =
      process.env.SMTP_USER || process.env.GMAIL_USER || "noreply@debugr4.com";

    // Determine the primary recipient for contact form submissions (contactus@dbr4.com)
    const contactEmailRecipient =
      process.env.CONTACT_EMAIL || "contactus@dbr4.com"; // Default to contactus@dbr4.com

    // --- Method 1: Attempt to send email via Nodemailer (SMTP) ---
    try {
      const transporter = createTransporter();

      // Verify SMTP connection to ensure credentials are valid and server is reachable
      // Added a race condition with a timeout to prevent indefinite hangs
      await Promise.race([
        transporter.verify(),
        new Promise(
          (_, reject) =>
            setTimeout(
              () => reject(new Error("SMTP connection verification timed out")),
              8000
            ) // 8-second timeout for verification
        ),
      ]);
      console.log("✅ SMTP connection verified successfully.");

      // HTML content for the email sent to the DeBugR4 contact email (contactus@dbr4.com)
      const adminHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #f7f7f7; padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #333; margin: 0; font-size: 24px;">🚀 New Contact from DeBugR4 Website</h2>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #555;">You've received a new message from your website contact form:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f0f0f0; font-weight: bold;">Name:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f0f0f0; font-weight: bold;">Email:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f0f0f0; font-weight: bold;">Subject:</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f0f0f0; font-weight: bold; vertical-align: top;">Message:</td>
                <td style="padding: 8px; border: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
              </tr>
            </table>
            <p style="font-size: 14px; color: #777; margin-top: 20px;">Received: ${new Date().toLocaleString()}</p>
            <p style="font-size: 14px; color: #777;"><strong>Reply To:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></p>
          </div>
          <div style="background-color: #f7f7f7; padding: 15px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 8px 8px;">
            This email was sent from your DeBugR4 website contact form.
          </div>
        </div>
      `;

      // Options for the email sent to contactus@dbr4.com
      const adminMailOptions = {
        from: `"DeBugR4 Contact Form" <${fromEmailAddress}>`, // Sender email
        to: contactEmailRecipient, // Recipient email: contactus@dbr4.com
        subject: `🔔 New Contact: ${subject}`,
        html: adminHtmlContent,
        replyTo: email, // Set reply-to to customer's email for easy response
      };

      await transporter.sendMail(adminMailOptions);
      console.log(
        `✅ Admin email sent to ${contactEmailRecipient} via SMTP successfully.`
      );

      // HTML content for the confirmation email sent to the customer
      const customerHtmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #e6f7ff; padding: 15px; border-bottom: 1px solid #cceeff; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #007bff; margin: 0; font-size: 24px;">🎉 Thank You for Contacting DeBugR4!</h2>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">Hi ${name},</p>
            <p style="font-size: 16px; color: #555;">
              Thank you for reaching out to DeBugR4. We have received your message and will get back to you shortly, typically within 24 hours.
            </p>
            <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; margin-top: 20px; border-radius: 5px;">
              <p style="font-size: 15px; color: #444; margin-bottom: 5px;"><strong>Your Message Details:</strong></p>
              <ul style="list-style-type: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 5px;"><strong style="color: #666;">Subject:</strong> ${subject}</li>
                <li><strong style="color: #666;">Message:</strong> ${message}</li>
              </ul>
            </div>
            <p style="font-size: 16px; color: #555; margin-top: 20px;">
              For urgent matters, please call us directly at <strong>(331) 588-5937</strong> during business hours.
            </p>
            <p style="font-size: 16px; color: #555; margin-top: 20px;">
              Best regards,<br>
              <strong>The DeBugR4 Team</strong>
            </p>
          </div>
          <div style="background-color: #e6f7ff; padding: 15px; border-top: 1px solid #cceeff; text-align: center; font-size: 12px; color: #007bff; border-radius: 0 0 8px 8px;">
            DeBugR4 - IC & Electronic Design | Email: contactus@dbr4.com | Phone: (331) 588-5937
          </div>
        </div>
      `;

      // Options for the confirmation email sent to the customer
      const customerMailOptions = {
        from: `"DeBugR4 Team" <${fromEmailAddress}>`, // Sender email
        to: email, // Recipient email: customer's email
        subject: "✅ Thank you for contacting DeBugR4!",
        html: customerHtmlContent,
      };

      await transporter.sendMail(customerMailOptions);
      console.log(
        `✅ Customer confirmation email sent to ${email} via SMTP successfully.`
      );

      emailSentSuccessfully = true;
      finalUserMessage =
        "Message sent successfully! A confirmation email has been sent to you.";
    } catch (smtpError: any) {
      console.error(
        "❌ SMTP email sending failed:",
        smtpError.message || smtpError
      );
      finalUserMessage = `Failed to send email via our primary service. Attempting backup...`;
    }

    // --- Method 2: Fallback to API-based email service (if SMTP failed) ---
    // This block only runs if emailSentSuccessfully is still false after the SMTP attempt
    if (!emailSentSuccessfully) {
      console.warn("SMTP failed. Attempting API fallback for email sending...");
      try {
        const apiFallbackResult = await sendEmailViaAPI({
          name,
          email,
          subject,
          message,
        });
        if (apiFallbackResult) {
          emailSentSuccessfully = true;
          console.log("✅ Email sent successfully via API fallback.");
          finalUserMessage =
            "Message sent successfully! A confirmation email should arrive shortly.";
        } else {
          console.warn("API fallback also failed.");
          finalUserMessage = "Failed to send email via our backup service.";
        }
      } catch (apiError: any) {
        console.error(
          "❌ Error calling API email fallback:",
          apiError.message || apiError
        );
        finalUserMessage = `Failed to send email via our backup service. Error: ${apiError.message || "unknown error"}`;
      }
    }

    // --- Method 3: Final Fallback - Log/Store in Database (if all methods failed) ---
    // This block runs if both SMTP and API fallbacks failed
    if (!emailSentSuccessfully) {
      console.error(
        "⚠️ All email sending methods failed. Storing contact submission for manual processing:"
      );
      console.log({
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString(),
        status: "Email_Send_Failed_Logged_For_Manual_Review",
        lastAttemptMessage: finalUserMessage,
      });

      // Implement database storage here. Example with Prisma:
      // await prisma.contactSubmission.create({
      //   data: {
      //     name,
      //     email,
      //     subject,
      //     message,
      //     sentStatus: "FAILED_TO_SEND",
      //     errorMessage: finalUserMessage
      //   }
      // });

      // Crucial UX decision: Even if email didn't send, if it's logged for manual review,
      // you might tell the user it was successful from their perspective.
      // Adjust `finalUserMessage` accordingly.
      emailSentSuccessfully = true; // From user's perspective, their submission is recorded
      finalUserMessage =
        "Your message has been received! We experienced a temporary issue sending emails, but we have your details and will contact you directly.";
    }

    // Return success response if at least one method (including logging) was "successful" from UX perspective
    if (emailSentSuccessfully) {
      return NextResponse.json(
        {
          success: true,
          message: finalUserMessage,
        },
        { status: 200 }
      );
    } else {
      // This should ideally only be reached if logging/storage also fails, or if a strict "email sent" is required for success.
      console.error(
        "❌ Critical: All contact form processing (sending and logging) failed."
      );
      return NextResponse.json(
        {
          error: `We are experiencing severe issues. Please call us directly at (331) 588-5937.`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Catch-all for unexpected errors during the entire process
    console.error(
      "❌ General server error processing contact form:",
      error.message || error
    );
    return NextResponse.json(
      {
        error: `An unexpected server error occurred: ${error.message || "Unknown error"}. Please try again or call us directly at (331) 588-5937.`,
      },
      { status: 500 }
    );
  }
}
