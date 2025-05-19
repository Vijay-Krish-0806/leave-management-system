import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  data: T[];
}

export function DataTable<T>({ caption, columns, data }: DataTableProps<T>) {
  return (
    <div className="table-container">
      <table className="custom-table">
        <caption className="table-caption">{caption}</caption>
        <thead className="table-header">
          <tr>
            <th>Index</th>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                {columns.map((col) => {
                  const cell =
                    typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode);
                  return <td key={col.header}>{cell}</td>;
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-4">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
