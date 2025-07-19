"use client";

import { Button } from "@/components/ui/button";
import { Download, Printer, Share } from "lucide-react";

interface ClientButtonsProps {
  onShare?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
}

export function ClientButtons({ onShare, onPrint, onDownload }: ClientButtonsProps) {
  return (
    <>
      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20 gap-2"
          onClick={onShare}
        >
          <Share className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-white/20 dark:border-slate-700/20 gap-2"
          onClick={onPrint}
        >
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
        <Button
          size="sm"
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg gap-2"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </>
  );
}

export function TryAgainButton() {
  return (
    <Button onClick={() => window.location.reload()}>
      Try Again
    </Button>
  );
}

export function FloatingActionButtons({ onDownload, onPrint }: { onDownload?: () => void; onPrint?: () => void }) {
  return (
    <div className="fixed bottom-20 right-4 lg:hidden">
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          className="rounded-full h-12 w-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
          onClick={onDownload}
        >
          <Download className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full h-12 w-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-lg"
          onClick={onPrint}
        >
          <Printer className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}