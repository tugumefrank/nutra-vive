import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrder } from "@/lib/actions/orderServerActions";
import jsPDF from "jspdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the order
    const { order, error } = await getOrder(id);

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Generate PDF
    const doc = new jsPDF();

    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(34, 139, 34); // Green color
    doc.text("NUTRA-VIVE", 20, 30);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Premium Organic Wellness Products", 20, 40);

    // Invoice Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", 150, 30);

    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice #: ${order.orderNumber}`, 150, 40);
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      150,
      50
    );
    doc.text(`Status: ${order.status.toUpperCase()}`, 150, 60);

    // Customer Information
    doc.setFontSize(12);
    doc.text("Bill To:", 20, 70);
    doc.setFontSize(10);
    doc.text(
      `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      20,
      80
    );
    if (order.shippingAddress.company) {
      doc.text(order.shippingAddress.company, 20, 90);
    }
    doc.text(
      order.shippingAddress.address1,
      20,
      order.shippingAddress.company ? 100 : 90
    );
    if (order.shippingAddress.address2) {
      doc.text(
        order.shippingAddress.address2,
        20,
        order.shippingAddress.company ? 110 : 100
      );
    }
    const cityLine = order.shippingAddress.company
      ? 120
      : order.shippingAddress.address2
        ? 110
        : 100;
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.zip}`,
      20,
      cityLine
    );
    doc.text(order.shippingAddress.country, 20, cityLine + 10);
    doc.text(`Email: ${order.email}`, 20, cityLine + 20);
    if (order.shippingAddress.phone) {
      doc.text(`Phone: ${order.shippingAddress.phone}`, 20, cityLine + 30);
    }

    // Items Table Header
    const tableStartY = 150;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    // Table headers
    doc.text("Item", 20, tableStartY);
    doc.text("Qty", 120, tableStartY);
    doc.text("Price", 140, tableStartY);
    doc.text("Total", 170, tableStartY);

    // Draw header line
    doc.line(20, tableStartY + 2, 190, tableStartY + 2);

    // Items
    let currentY = tableStartY + 15;
    order.items.forEach((item: any) => {
      doc.text(item.productName, 20, currentY);
      doc.text(item.quantity.toString(), 120, currentY);
      doc.text(`$${item.price.toFixed(2)}`, 140, currentY);
      doc.text(`$${item.totalPrice.toFixed(2)}`, 170, currentY);
      currentY += 10;
    });

    // Summary
    const summaryStartY = currentY + 20;
    doc.line(130, summaryStartY - 5, 190, summaryStartY - 5);

    doc.text("Subtotal:", 130, summaryStartY);
    doc.text(`$${order.subtotal.toFixed(2)}`, 170, summaryStartY);

    doc.text("Shipping:", 130, summaryStartY + 10);
    doc.text(`$${order.shippingAmount.toFixed(2)}`, 170, summaryStartY + 10);

    doc.text("Tax:", 130, summaryStartY + 20);
    doc.text(`$${order.taxAmount.toFixed(2)}`, 170, summaryStartY + 20);

    if (order.discountAmount > 0) {
      doc.text("Discount:", 130, summaryStartY + 30);
      doc.text(`-$${order.discountAmount.toFixed(2)}`, 170, summaryStartY + 30);
    }

    // Total line
    const totalY =
      order.discountAmount > 0 ? summaryStartY + 40 : summaryStartY + 30;
    doc.line(130, totalY - 2, 190, totalY - 2);
    doc.setFontSize(12);
    doc.text("Total:", 130, totalY + 5);
    doc.text(`$${order.totalAmount.toFixed(2)}`, 170, totalY + 5);

    // Payment Information
    doc.setFontSize(10);
    doc.text(
      `Payment Status: ${order.paymentStatus.toUpperCase()}`,
      20,
      totalY + 20
    );
    if (order.paymentMethod) {
      doc.text(`Payment Method: ${order.paymentMethod}`, 20, totalY + 30);
    }

    // Tracking Information
    if (order.trackingNumber) {
      doc.text(`Tracking Number: ${order.trackingNumber}`, 20, totalY + 40);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for your business!", 20, 280);
    doc.text(
      "For questions about this invoice, please contact us at support@nutraviveholistic.com",
      20,
      285
    );

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
