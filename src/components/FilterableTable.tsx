import React, { useState } from "react";
import { FaSort, FaSortUp, FaSortDown, FaSearch } from "react-icons/fa";

// Define column configuration type
type ColumnConfig<T> = {
  key: keyof T | string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
};

// Define filter configuration type
type FilterConfig = {
  type: "text" | "select";
  options?: { value: string; label: string }[];
};

type FilterableTableProps<T> = {
  data: T[];
  columns: ColumnConfig<T>[];
  filters?: Record<string, FilterConfig>;
  caption?: string;
  className?: string;
  actions?: (item: T) => React.ReactNode;
};

function FilterableTable<T extends Record<string, any>>({
  data,
  columns,
  filters = {},
  caption,
  className = "",
  actions,
}: FilterableTableProps<T>) {
  // States for sorting
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });

  // States for filtering
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  // States for search
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data based on filter values and search term
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Check if item matches all filter values
      const matchesFilters = Object.entries(filterValues).every(
        ([key, value]) => {
          if (!value) return true;
          const itemValue = key.includes(".")
            ? key.split(".").reduce((obj, k) => obj?.[k], item)
            : item[key];
          return String(itemValue).toLowerCase() === value.toLowerCase();
        }
      );

      // Check if item matches search term
      const matchesSearch =
        !searchTerm ||
        columns.some((column) => {
          const colKey = column.key as string;
          const itemValue = colKey.includes(".")
            ? colKey.split(".").reduce((obj, k) => obj?.[k], item)
            : item[colKey];
          return String(itemValue)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        });

      return matchesFilters && matchesSearch;
    });
  }, [data, filterValues, searchTerm, columns]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const key = sortConfig.key as string;
      const aValue = key.includes(".")
        ? key.split(".").reduce((obj, k) => obj?.[k], a)
        : a[key];
      const bValue = key.includes(".")
        ? key.split(".").reduce((obj, k) => obj?.[k], b)
        : b[key];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === "ascending" ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" | null = "ascending";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = null;
      }
    }

    setSortConfig({ key: direction ? key : null, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="filterable-table-container">
      <div className="table-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filters-container">
          {Object.entries(filters).map(([key, config]) => (
            <div key={key} className="filter-item">
              {config.type === "select" ? (
                <select
                  value={filterValues[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="filter-select"
                >
                  <option value="">All {key}</option>
                  {config.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={`Filter by ${key}...`}
                  value={filterValues[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="filter-input"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className={`custom-table ${className}`}>
          {caption && <caption className="table-caption">{caption}</caption>}
          <thead className="table-header">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={column.sortable ? "sortable-header" : ""}
                  onClick={
                    column.sortable
                      ? () => handleSort(column.key as string)
                      : undefined
                  }
                >
                  {column.header}
                  {column.sortable && (
                    <span className="sort-icon">
                      {sortConfig.key !== column.key && <FaSort />}
                      {sortConfig.key === column.key &&
                        sortConfig.direction === "ascending" && <FaSortUp />}
                      {sortConfig.key === column.key &&
                        sortConfig.direction === "descending" && <FaSortDown />}
                    </span>
                  )}
                </th>
              ))}
              {actions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody className="table-body">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="no-data"
                >
                  No data found
                </td>
              </tr>
            ) : (
              sortedData.map((item, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => {
                    const key = column.key as string;
                    const value = key.includes(".")
                      ? key.split(".").reduce((obj, k) => obj?.[k], item)
                      : item[key];

                    return (
                      <td key={colIndex}>
                        {column.render ? column.render(item, rowIndex) : value}
                      </td>
                    );
                  })}
                  {actions && <td className="actions-cell">{actions(item)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FilterableTable;
