import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Preview,
  Section,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface OrderDetails {
  id: string;
  totalAmount: number;
  createdAt: Date;
}

interface OrderConfirmationTemplateProps {
  orderDetails: OrderDetails;
}

export const OrderConfirmationTemplate = ({
  orderDetails,
}: OrderConfirmationTemplateProps) => (
  <Html>
    <Head />
    <Preview>Your DeBugR4 Store Order Confirmation</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Thank you for your order!</Heading>
        <Text style={paragraph}>
          Hi, we're getting your order ready to be shipped. We will notify you
          when it has been sent.
        </Text>
        <Section style={detailsSection}>
          <Row>
            <Column style={detailsTitle}>Order Number</Column>
            <Column style={detailsValue}>
              {orderDetails.id.substring(0, 8)}
            </Column>
          </Row>
          <Row>
            <Column style={detailsTitle}>Order Date</Column>
            <Column style={detailsValue}>
              {orderDetails.createdAt.toLocaleDateString()}
            </Column>
          </Row>
        </Section>

        {/* You could map through order items here if you pass them in */}

        <Section style={totalSection}>
          <Row>
            <Column style={totalTitle}>Total</Column>
            <Column style={totalValue}>
              ${(orderDetails.totalAmount / 100).toFixed(2)}
            </Column>
          </Row>
        </Section>

        <Text style={footer}>
          DeBugR4 Store, 123 Tech Lane, Innovation City, 12345
        </Text>
      </Container>
    </Body>
  </Html>
);

// --- Styles ---
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
};
const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#1a1a1a",
};
const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#3c4043",
  padding: "0 20px",
};
const detailsSection = {
  padding: "0 20px",
  margin: "32px 0",
};
const detailsTitle = {
  color: "#6e6e6e",
  fontSize: "14px",
};
const detailsValue = {
  color: "#1a1a1a",
  fontSize: "14px",
  textAlign: "right" as const,
};
const totalSection = {
  padding: "0 20px",
  borderTop: "1px solid #e6ebf1",
  paddingTop: "20px",
};
const totalTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#3c4043",
};
const totalValue = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1a1a1a",
  textAlign: "right" as const,
};
const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};
