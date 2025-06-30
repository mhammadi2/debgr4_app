// app/api/send-confirmation-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, name, orderDetails } = await request.json();

    if (!email || !orderDetails) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch order from database to ensure data is accurate
    const order = await prisma.order.findUnique({
      where: { orderId: orderDetails.orderId },
      include: {
        orderItems: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Create email transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Boolean(process.env.EMAIL_SERVER_SECURE),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Generate HTML for order items
    const itemsHtml = order.orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price.toFixed(
          2
        )}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    // Format shipping address
    const shippingAddress = order.shippingAddress;
    const formattedAddress = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}, ${shippingAddress.country}`;

    // Prepare email content
    const mailOptions = {
      from: `"DeBugR4 Shop" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Order Confirmation #${order.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4caf50; padding: 20px; text-align: center; color: white;">
            <h1>Thank You for Your Order!</h1>
            <p>Order #${order.orderId}</p>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello ${name},</p>
            <p>We're pleased to confirm your order has been received and is being processed. Here's a summary of your purchase:</p>
            
            <h2 style="color: #4caf50;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: left;">Quantity</th>
                  <th style="padding: 10px; text-align: left;">Price</th>
                  <th style="padding: 10px; text-align: left;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; font-weight: bold;">${order.totalAmount.toFixed(
                    2
                  )}</td>
                </tr>
              </tfoot>
            </table>
            
            <h2 style="color: #4caf50; margin-top: 30px;">Shipping Details</h2>
            <p><strong>Address:</strong> ${formattedAddress}</p>
            
            <p style="margin-top: 30px;">If you have any questions about your order, please contact our customer service at <a href="mailto:support@debugr4.com">support@debugr4.com</a>.</p>
            
            <p>Thank you for shopping with DeBugR4!</p>
          </div>
          
          <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>© 2025 DeBugR4. All rights reserved.</p>
            <p>Leading the Future of IC and Electronic Design and Support</p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Record that the email was sent
    await prisma.order.update({
      where: { id: order.id },
      data: {
        updatedAt: new Date(),
        // You could add a field to track email status if needed
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
