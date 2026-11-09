import React, { useState } from 'react';
import { X, Cloud, Check, Copy, ExternalLink, Zap } from 'lucide-react';

export default function CloudCronModal({ isOpen, onClose }) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app';
  const cronWebhookUrl = `${currentHost}/api/cron`;

  const githubWorkflowSnippet = `name: TNSTC 24/7 Bus Check
on:
  schedule:
    # Runs every 10 minutes, 24/7 even when your computer is OFF
    - cron: '*/10 * * * *'
  workflow_dispatch:

jobs:
  check-tnstc:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Vercel Notifier Endpoint
        run: |
          curl -X POST "${cronWebhookUrl}" \\
            -H "Content-Type: application/json" \\
            -d '{"bookings":[],"telegram":{"enabled":true}}'
`;

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 dark:bg-zinc-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-5 sm:p-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Running 24/7 When Your System Is Off</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Zero servers to maintain &bull; 100% Free on Vercel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 text-xs text-zinc-700 dark:text-zinc-300 flex-1">
          {/* Concept Explanation */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
              <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>How it works:</span>
            </div>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              When your browser tab is open on your phone or laptop, the frontend automatically polls TNSTC and triggers Telegram alerts.
            </p>
            <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
              When you close your laptop or turn off your machine, your deployed Vercel cloud function stays online. You can trigger it automatically using either method below:
            </p>
          </div>

          {/* Option A: Free Web Cron (Easiest, 1-Click) */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/90 border border-sky-300 dark:border-sky-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                Option A: Free Cron-Job.org (Recommended & Easiest)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold">
                Takes 1 min
              </span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <li>Sign up for free at <a href="https://cron-job.org" target="_blank" rel="noreferrer" className="text-sky-600 dark:text-sky-400 underline font-medium inline-flex items-center gap-0.5">cron-job.org <ExternalLink className="w-3 h-3" /></a></li>
              <li>Create a new Cronjob and set schedule to <strong>Every 5 or 10 minutes</strong>.</li>
              <li>Set the URL to your Vercel endpoint:</li>
            </ol>
            <div className="flex items-center gap-2 pt-1">
              <code className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 select-all truncate">
                {cronWebhookUrl}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(cronWebhookUrl, setCopiedUrl)}
                className="px-3 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Option B: Free GitHub Actions Workflow */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                Option B: GitHub Actions (Built into this repo)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                Automated
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This repository already includes a scheduled workflow at <code className="text-zinc-900 dark:text-zinc-200 font-mono font-medium">.github/workflows/bus_tracker.yml</code> that pings your Vercel URL on a recurring cron without your computer being on!
            </p>
            <div className="relative">
              <pre className="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-300 overflow-x-auto">
                {githubWorkflowSnippet}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(githubWorkflowSnippet, setCopiedWorkflow)}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedWorkflow ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWorkflow ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
