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
    <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 min-w-0 flex-1"
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
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
                className="p-2 sm:p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex-shrink-0"
              >
                <div className={`h-6 w-6 sm:h-8 sm:w-8 ${iconClassName}`}>{icon}</div>
              </motion.div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-slate-900 dark:text-slate-100 break-words">
                {title}
              </h1>
              {description && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 break-words">
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
            className="flex-shrink-0"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}
