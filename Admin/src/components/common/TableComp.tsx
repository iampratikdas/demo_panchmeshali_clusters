// import React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
interface TableCompProps {
  table_caption?: string;
  column?: {
    id: string;
    header_name?: string;
  }[];
  onclicks?: (row: { [key: string]: string }) => void | undefined;
  checkClick?:  boolean; 
  data?: Array<{ [key: string]: string }>;
}

export default function TableComp({
  column = [
    {
      id: "dummy",
      header_name: "dummy",
    },
  ],
  data = [],
  onclicks,
  checkClick,
  table_caption = "",
}: TableCompProps) {
  console.log("data========>", data, column);
  return (
    <Table>
      <TableCaption>{table_caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {column.map((item, index) => (
            <TableHead
              className="font-medium text-left"
              style={{ color: "#062165" }}
              key={index}
            >
              {item.header_name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex} onClick={onclicks ? () => onclicks(row) : undefined} style={{cursor :checkClick ? 'pointer' : ''}} >
            
            {column.map((col, colIndex) => (
              <TableCell
                className="font-medium text-left min-w-[200px]"
                key={colIndex}
              >
                {row[col.id]} 
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
