import React from "react";
import { FaSpinner } from "react-icons/fa";
export interface Column<T> {
  header: string | React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
}
interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  caption: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
}
/**
* @description Common Table component which can be used to show data in tabular format
* @param {TableProps<T>} {
  columns,
  data,
  caption,
  isLoading = false,
  isError = false,
  errorMessage = "Error loading data",
}
* @returns {JSX.Element}
*/
const Table = <T extends object>({
  columns,
  data,
  caption,
  isLoading = false,
  isError = false,
  errorMessage = "Error loading data",
}: TableProps<T>) => {
  if (isLoading) {
    return (
      <div className="loading">
        <FaSpinner className="spinner" />
      </div>
    );
  }
  if (isError) {
    return <div className="error">{errorMessage}</div>;
  }
  return (
    <div className="table-container">
      <table className="custom-table">
        <caption className="table-caption">{caption}</caption>
        <thead className="table-header">
          <tr>
            <th>Index</th>
            {columns.map((column) => (
              <th key={column.header as string}>
                {column.header as string | React.ReactNode}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={
                  (
                    item as {
                      id?: string | number;
                    } 
                  ).id ?? index
                }
              >
                <td>{index + 1}</td>
                {columns.map((column) => (
                  <td key={column.header as string}>
                    {typeof column.accessor === "function"
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="no-data-message">
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
