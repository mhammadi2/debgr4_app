// File: lib/email.ts (Revised & Production-Ready)

import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { OrderConfirmationTemplate } from "@/components/emails/OrderConfirmationTemplate";

// ✅ 1. Define a specific type for order details to ensure type safety.
interface OrderDetailsForEmail {
  id: string;
  totalAmount: number; // Expect amount in cents
  createdAt: Date;
}

// ✅ 2. Create a single, validated transporter instance.
// This function ensures all required env vars are present before creating the transporter.
function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("Missing required SMTP environment variables.");
    // In production, you might want to throw an error to prevent the app from starting.
    // throw new Error("Missing required SMTP environment variables.");
    return null; // Return null if misconfigured
  }

  // ✅ 3. SECURITY: Use `secure: true` for production with port 465 (SMTPS).
  // For providers that use STARTTLS (port 587), `secure` is false but you enable it via `requireTLS: true`.
  // Using `secure: true` on port 465 is the most common and straightforward secure setup.
  const port = parseInt(SMTP_PORT, 10);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: port,
    secure: port === 465, // `true` for port 465, `false` for others like 587.
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

/**
 * Sends a transactional email.
 * @param to Recipient's email address.
 * @param subject The subject of the email.
 * @param html The HTML content of the email, rendered from a React component.
 */
async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.error("Email transporter is not configured. Email not sent.");
    return; // Abort if the transporter couldn't be created.
  }

  // ✅ 4. CRITICAL: Add robust error handling.
  try {
    await transporter.sendMail({
      from: `"DeBugR4 Store" <${process.env.SMTP_FROM || 'noreply@yourstore.com'}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

/**
 * Renders and sends the order confirmation email.
 * @param to Recipient's email address.
 * @param orderDetails The details of the order.
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: OrderDetailsForEmail
) {
  // ✅ 5. MAINTAINABILITY: Render a React component to HTML.
  const emailHtml = render(
    <OrderConfirmationTemplate orderDetails={orderDetails} />
  );
  
  const subject = `Order Confirmation #${orderDetails.id.substring(0, 8)}`;
  
  await sendEmail(to, subject, emailHtml);
}