// lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  orderDetails: any
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p>Order Number: <strong>${orderNumber}</strong></p>
      <p>Total: ${orderDetails.total}</p>
      <p>We'll send you another email when your order ships.</p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Your Store" <noreply@yourstore.com>',
    to,
    subject: `Order Confirmation - ${orderNumber}`,
    html,
  });
}
