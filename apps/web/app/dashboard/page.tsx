/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

type StoredToken = {
  token: string;
  createdAt: string;
  meta?: Record<string, any>;
};

export default function DashboardPage() {
  const [tokens, setTokens] = useState<StoredToken[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("codrel_tokens");
    if (saved) setTokens(JSON.parse(saved));
  }, []);

  function saveLocal(updated: StoredToken[]) {
    localStorage.setItem("codrel_tokens", JSON.stringify(updated));
    setTokens(updated);
  }

  async function generate() {
    setLoading(true);

    const res = await fetch("/api/auth/generateToken", { method: "GET" });
    const data = await res.json();

    setLoading(false);
    if (!data.token) return;

    const newToken: StoredToken = {
      token: data.token,
      createdAt: new Date().toISOString(),
      meta: data.meta || {},
    };

    const updated = [...tokens, newToken];
    saveLocal(updated);
  }

  function copyToken(t: string) {
    navigator.clipboard.writeText(t);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">API Tokens</h1>

      <button
        onClick={generate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? "Generating..." : "Generate New Token"}
      </button>

      {tokens.length === 0 && (
        <p className="mt-6 text-gray-500">No tokens created yet.</p>
      )}

      {tokens.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-md">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                  Token
                </th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                  Created At
                </th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {tokens.map((t, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 max-w-xs truncate font-mono text-sm text-gray-800">
                    {t.token}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => copyToken(t.token)}
                      className="px-3 py-1 text-sm bg-gray-800 text-white rounded hover:bg-black"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
