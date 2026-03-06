import { ReactNode } from "react";

interface Column<T> {
  key: string;
  title: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  rows,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[700px] bg-[var(--surface)] text-sm">
        <thead>
          <tr className="bg-[var(--surface-soft)] text-left text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2 font-semibold">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-2 align-top text-[var(--text)]">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-6 text-center text-sm text-[var(--muted)]" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
