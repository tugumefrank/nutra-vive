'use client';

import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Send, Facebook, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

export default function ShareButton({
  url,
  title,
  description = '',
  image = '',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url,
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(image);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleSharePlatform = (platformUrl: string) => {
    window.open(platformUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Native Share (if supported) */}
        {navigator.share && navigator.canShare && navigator.canShare(shareData) && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Social Media Platforms */}
        <DropdownMenuItem onClick={() => handleSharePlatform(shareUrls.whatsapp)}>
          <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSharePlatform(shareUrls.telegram)}>
          <Send className="mr-2 h-4 w-4 text-blue-500" />
          Telegram
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSharePlatform(shareUrls.facebook)}>
          <Facebook className="mr-2 h-4 w-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSharePlatform(shareUrls.twitter)}>
          <Twitter className="mr-2 h-4 w-4 text-sky-500" />
          Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSharePlatform(shareUrls.linkedin)}>
          <div className="mr-2 h-4 w-4 bg-blue-700 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">in</span>
          </div>
          LinkedIn
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleSharePlatform(shareUrls.email)}>
          <div className="mr-2 h-4 w-4 bg-gray-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs">@</span>
          </div>
          Email
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-600" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}