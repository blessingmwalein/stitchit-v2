import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon, CopyIcon } from 'lucide-react';

interface PhoneDisplayProps {
  phone: string;
  className?: string;
}

export function PhoneDisplay({ phone, className = '' }: PhoneDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono">{phone}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-6 w-6 p-0 hover:bg-gray-100"
      >
        {copied ? (
          <CheckIcon className="h-3 w-3 text-green-600" />
        ) : (
          <CopyIcon className="h-3 w-3 text-gray-500" />
        )}
      </Button>
    </div>
  );
}
