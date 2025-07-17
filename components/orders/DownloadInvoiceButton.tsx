'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface DownloadInvoiceButtonProps {
  orderId: string;
  orderNumber: string;
  className?: string;
}

export default function DownloadInvoiceButton({
  orderId,
  orderNumber,
  className,
}: DownloadInvoiceButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download invoice');
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      // You could add a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={handleDownloadInvoice}
      disabled={isDownloading}
    >
      <Download className="h-4 w-4 mr-1" />
      {isDownloading ? 'Downloading...' : 'Invoice'}
    </Button>
  );
}