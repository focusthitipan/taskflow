"use client";

import Link from "next/link";
import { Zap, ArrowRight, Home } from "lucide-react";
import { useT } from "@/components/layout/i18n-provider";

export default function NotFound() {
  const { t } = useT();

  return (
    <div className="min-h-screen bg-brand-50 dark:bg-navy-900 flex items-center justify-center p-5">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 gradient-brand" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 gradient-brand" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 gradient-brand" />
      </div>

      <div className="w-full max-w-[440px] relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center gradient-brand">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[22px] font-bold text-secondaryGray-900 dark:text-white leading-none">
              TaskFlow
            </p>
            <p className="text-sm text-secondaryGray-600 font-normal">
              Team Task Management
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-navy-800 rounded-[30px] p-5 sm:p-8 card-shadow text-center">
          {/* 404 Number */}
          <div className="relative mb-6">
            <p className="text-[72px] sm:text-[90px] font-bold leading-none select-none bg-gradient-to-br from-brand-400 to-brand-500 bg-clip-text text-transparent">
              404
            </p>
          </div>

          {/* Message */}
          <h1 className="text-[22px] font-bold text-secondaryGray-900 dark:text-white leading-none mb-2">
            {t.notFound.title}
          </h1>
          <p className="text-sm text-secondaryGray-600 font-normal mb-8">
            {t.notFound.description}
          </p>

          {/* Back button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-[44px] px-8 rounded-full text-white font-bold text-sm gradient-brand transition-all duration-250 ease hover:opacity-90"
          >
            <Home className="w-4 h-4" />
            {t.notFound.backHome}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
