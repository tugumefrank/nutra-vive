"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconClassName?: string;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon,
  iconClassName = "text-emerald-600 dark:text-emerald-400",
  children,
}: PageHeaderProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            {icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: 0.2,
                }}
                className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/20"
              >
                <div className={`h-8 w-8 ${iconClassName}`}>{icon}</div>
              </motion.div>
            )}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h1>
              {description && (
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}
