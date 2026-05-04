"use client";

import { useState, ReactNode } from "react";

export default function Table<T extends Record<string, unknown>>({
  headers,
  data,
  children,
}: {
  headers: string[];
  data?: T[];
  children?: ReactNode;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  return (
    <div>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200 text-black">
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {children
            ? children
            : data
                ?.slice((page - 1) * pageSize, page * pageSize)
                .map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val as ReactNode}</td>
                    ))}
                  </tr>
                ))}
        </tbody>
      </table>

      {!children && data && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <span>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}