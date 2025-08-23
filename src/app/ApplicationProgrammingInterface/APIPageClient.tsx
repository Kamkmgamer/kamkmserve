"use client";

import { useState, useMemo } from "react";
import { Disclosure } from "@headlessui/react";
import {
  ChevronUpIcon,
  ClipboardCopyIcon,
  ChevronDownIcon,
} from "@heroicons/react/outline";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";

// Types
export type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  desc?: string;
  query?: string[];
  bodyExample?: object | string;
  example?: string;
};

// TODO: Replace placeholder with actual sections data
const sections: { title: string; endpoints: Endpoint[] }[] = [
  /* …as before… */
];

function MethodBadge({ method }: { method: Endpoint["method"] }) {
  const color = {
    GET: "emerald",
    POST: "blue",
    PATCH: "amber",
    DELETE: "rose",
  }[method];
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold text-${color}-800 bg-${color}-100 rounded`}
    >
      {method}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="ml-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      <ClipboardCopyIcon className="h-4 w-4" />
    </button>
  );
}

export default function APIPageClient() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query) return sections;
    const q = query.toLowerCase();
    return sections
      .map((sec) => ({
        ...sec,
        endpoints: sec.endpoints.filter(
          (ep) =>
            ep.path.toLowerCase().includes(q) ||
            ep.method.includes(q) ||
            (ep.desc?.toLowerCase().includes(q) ?? false)
        ),
      }))
      .filter((sec) => sec.endpoints.length);
  }, [query]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur p-4 z-10 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-bold">API Reference</h1>
        <input
          type="search"
          placeholder="Search endpoints..."
          className="mt-2 w-full rounded border px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 sticky top-20 p-4 space-y-2">
          {sections.map((sec) => (
            <a
              key={sec.title}
              href={`#${sec.title}`}
              className="block text-slate-600 dark:text-slate-400 hover:underline"
            >
              {sec.title}
            </a>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 px-4 py-8 space-y-8">
          {filtered.map((section) => (
            <section id={section.title} key={section.title}>
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.endpoints.map((ep, idx) => (
                  <Disclosure as="div" key={idx} className="border rounded-lg overflow-hidden">
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="w-full flex justify-between items-center px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                          <div className="flex items-center gap-3">
                            <MethodBadge method={ep.method} />
                            <code className="font-mono">{ep.path}</code>
                          </div>
                          {open ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </Disclosure.Button>
                        <Disclosure.Panel className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                          {ep.desc && (
                            <p className="mb-2 text-slate-600 dark:text-slate-400">{ep.desc}</p>
                          )}
                          {ep.query?.length ? (
                            <div className="mb-2">
                              <p className="font-medium text-xs">Query params</p>
                              <ul className="list-disc list-inside text-sm">
                                {ep.query.map((q) => (
                                  <li key={q}>
                                    <code className="font-mono">{q}</code>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {ep.bodyExample && (
                            <div className="mb-2">
                              <p className="font-medium text-xs">Body</p>
                              <div className="relative">
                                <SyntaxHighlighter
                                  language="json"
                                  style={tomorrow}
                                  customStyle={{ borderRadius: "0.375rem" }}
                                >
                                  {typeof ep.bodyExample === "string"
                                    ? ep.bodyExample
                                    : JSON.stringify(ep.bodyExample, null, 2)}
                                </SyntaxHighlighter>
                                <div className="absolute top-2 right-2">
                                  <CopyButton
                                    text={
                                      typeof ep.bodyExample === "string"
                                        ? ep.bodyExample
                                        : JSON.stringify(ep.bodyExample, null, 2)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {ep.example && (
                            <div>
                              <p className="font-medium text-xs">Example</p>
                              <div className="relative">
                                <SyntaxHighlighter
                                  language="bash"
                                  style={tomorrow}
                                  customStyle={{ borderRadius: "0.375rem" }}
                                >
                                  {ep.example}
                                </SyntaxHighlighter>
                                <div className="absolute top-2 right-2">
                                  <CopyButton text={ep.example} />
                                </div>
                              </div>
                            </div>
                          )}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-12 p-4 border rounded bg-slate-50 dark:bg-slate-800">
            <h3 className="font-semibold">Notes</h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>
                Timestamps are ISO strings; some fields may be <code>null</code>.
              </li>
              <li>Auth required on certain endpoints (e.g., Clerk user).</li>
              <li>
                CSV exports have <code>text/csv</code> + download headers.
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
