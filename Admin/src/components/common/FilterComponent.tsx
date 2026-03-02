import React, { useState } from "react";
import { ChevronDown } from "lucide-react";


interface FilterComponentProps {
  func: () => void;  
}

const FilterComponent: React.FC<FilterComponentProps> = ({ ...func }) => {
  // states
  console.log("function=============>", func);
  // return(<>hi</>)
  return (
    <div className="w-full mt-2 mb-2 bg-white shadow-lg rounded-2xl">
      {/* Header / Toggle */}
      <button
        onClick={() => func.handleOPen()}
        className="w-full flex justify-between items-center px-4 py-3 sm:py-4"
      >
        <h2 className="text-lg font-semibold">Use Filters</h2>
        <span
          className={`transform transition-transform duration-300 ${
            func.isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <ChevronDown />
        </span>
      </button>

      {/* Collapsible Body */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          func.isOpen ? "max-h-screen p-4 sm:p-6 space-y-4" : "max-h-0"
        }`}
      >
        {func.filterFields.map((field, idx) => {
          switch (field.type) {
            case "text":
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0"
                >
                  <label className="font-medium text-gray-700 sm:w-32">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              );
          case "button":
                return (
                  <div key={idx} className="flex justify-start">
                    <button
                      type="button"
                      onClick={field.onClick}
                      className={`${
                        field.variant === "primary"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      } px-6 py-2 rounded-md transition-colors duration-200`}
                    >
                      {field.label}
                    </button>
                  </div>
                );
            case "checkbox":
              return (
                <div
                  key={idx}
                  className="flex items-center space-x-3 sm:space-x-4"
                >
                  <input
                    id={`checkbox-${idx}`}
                    type="checkbox"
                    checked={field.checked}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`checkbox-${idx}`}
                    className="font-medium text-gray-700"
                  >
                    {field.label}
                  </label>
                </div>
              );

            case "select-dropdown":
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0"
                >
                  <label className="font-medium text-gray-700 sm:w-32">
                    {field.label}
                  </label>
                  <select
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="w-40  px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>
                        Select your Choice
                      </option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                   {/* Search Input */}
                <input
                  id="selectinput"
                  type="text"
                  placeholder="Search..."
                  value={field.searchValue}
                  onChange={(e) => field.onSearchChange(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                </div>
              );

         case "select":
          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0" 
            >
              <label className="font-medium text-gray-700 sm:w-32">
                {field.label}
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-2 w-full sm:flex-1">
                {/* Dropdown */}
                <select
                  id="select"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                   <option>
                        Select your Choice
                      </option>
                  {field.options
                    .filter((opt) =>
                      field.searchValue
                        ? opt.label.toLowerCase().includes(field.searchValue.toLowerCase())
                        : true
                    )
                    .map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>


                
              </div>
            </div>
          );

            case "buttonGroup":
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0"
                >
                  <label className="font-medium text-gray-700 sm:w-32">
                    {field.label}
                  </label>
                  <div className="flex gap-2">
                    {field.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={`px-4 py-2 rounded-md border transition-colors duration-150 ${
                          field.value === opt.value
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}

        {/* Apply Button */}
        <div className="flex justify-end gap-2">
          <button
            onClick={func.handleReset}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            Reset
          </button>
          <button
            onClick={func.handleApply}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
};

export default FilterComponent;
