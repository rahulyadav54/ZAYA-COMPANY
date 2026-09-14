'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatTaskDescription } from '@/lib/formatTaskDescription';

type TaskDescriptionProps = {
  description?: string | null;
  compact?: boolean;
  className?: string;
};

export default function TaskDescription({ description, compact = false, className = '' }: TaskDescriptionProps) {
  const markdown = formatTaskDescription(description);

  return (
    <div
      className={[
        'task-description',
        compact ? 'task-description-compact' : 'task-description-full',
        className,
      ].join(' ')}
    >
      <ReactMarkdown
        components={{
          h3: ({ children }) => (
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-900 dark:text-white mt-8 mb-3 first:mt-0 pb-2 border-b border-slate-200 dark:border-slate-700">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm md:text-[15px] leading-7 text-slate-600 dark:text-slate-300 mb-4 font-medium">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="space-y-3 mb-6 list-none pl-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-3 mb-6 list-decimal pl-5 marker:font-bold marker:text-blue-600">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex gap-3 text-sm md:text-[15px] leading-7 text-slate-600 dark:text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span className="flex-1 font-medium">{children}</span>
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-blue-600 underline underline-offset-2 break-all hover:text-blue-700"
            >
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
