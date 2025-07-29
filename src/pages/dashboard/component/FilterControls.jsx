// Create: src/pages/dashboard/component/FilterControls.jsx

import React from 'react';
import { Select, Option, Button } from "@material-tailwind/react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

export const FilterControls = ({ filters, updateFilter, toggleSortDirection }) => (
  <div className="flex gap-2 mb-4">
    <Select
      label="Filter Status"
      value={filters.status}
      onChange={(val) => updateFilter('status', val)}
      size="sm"
    >
      <Option value="all">All</Option>
      <Option value="pending">Pending</Option>
      <Option value="done">Completed</Option>
      <Option value="overdue">Overdue</Option>
    </Select>
    
    <div className="flex items-center">
      <Select
        label="Sort By"
        value={filters.sortField}
        onChange={(val) => updateFilter('sortField', val)}
        size="sm"
      >
        <Option value="dueDate">Due Date</Option>
        <Option value="vaccine">Vaccine Name</Option>
        <Option value="status">Status</Option>
      </Select>
      <Button 
        variant="text" 
        size="sm"
        onClick={toggleSortDirection}
        className="ml-2"
      >
        {filters.sortDirection === "asc" ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  </div>
);