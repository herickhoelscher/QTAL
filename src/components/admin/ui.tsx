import Link from "next/link";
import type { ReactNode } from "react";
import type { ContentStatus } from "@prisma/client";

export function AdminHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="eyebrow bg-brand px-5 py-3 text-white transition-colors hover:bg-brand-dark"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusPill({ status }: { status: ContentStatus }) {
  const published = status === "PUBLISHED";
  return (
    <span
      className={
        "eyebrow inline-block rounded-full px-3 py-1 " +
        (published ? "bg-emerald-100 text-emerald-800" : "bg-surface-alt text-muted")
      }
    >
      {published ? "Publicado" : "Rascunho"}
    </span>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  headers: ReactNode[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-alt">
            {headers.map((header, index) => (
              <th key={index} className="eyebrow px-4 py-3 text-muted">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-line bg-surface p-12 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export function SavedNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="mb-6 border-l-2 border-emerald-600 bg-emerald-50 p-3 text-sm text-emerald-900">
      Alterações salvas.
    </p>
  );
}
