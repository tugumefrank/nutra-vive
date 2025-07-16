"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter description...",
  className = "",
  disabled = false,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (val?: string) => {
    onChange(val || "");
  };

  if (!isMounted) {
    return (
      <div className={`border border-gray-300 rounded-xl p-4 h-80 bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center h-full text-gray-500">
          Loading editor...
        </div>
      </div>
    );
  }

  return (
    <div className={`rich-text-editor ${className}`} data-color-mode="light">
      <MDEditor
        value={value}
        onChange={handleChange}
        preview="edit"
        hideToolbar={disabled}
        height={300}
        data-color-mode="light"
        visibleDragbar={false}
        textareaProps={{
          placeholder: placeholder,
          disabled: disabled,
          style: {
            fontSize: 14,
            lineHeight: 1.5,
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
          },
        }}
      />
    </div>
  );
};

export default RichTextEditor;