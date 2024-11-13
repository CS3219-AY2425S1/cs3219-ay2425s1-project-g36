import { Question } from "@/api/question-service/Question";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Column, ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import Difficulty from "../Difficulty";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Trash2 } from "lucide-react";
import TopicView from "./TopicView";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Converts a column header to make it sortable.
 * 
 * @param title The title of the column to make sortable.
 * @returns The column header, converted into a sortable format.
 */
const makeColumnSortable = (title : string) => ({ column } : { column : Column<Question> }) => {
  return (
    <Button 
      variant="ghost"
      className="pl-0"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      { title }
      { 
        (column.getIsSorted() === "asc") ?
          <ArrowUp className="ml-2 h-4 w-4" /> : 
        (column.getIsSorted() === "desc") ? 
          <ArrowDown className="ml-2 h-4 w-4" /> :
          <ArrowUpDown className="ml-2 h-4 w-4" />
      }
    </Button>
  )
}

/**
 * The difficulty order for sorting.
 */
const difficultyOrder = ["easy", "medium", "hard"];

/**
 * Gets the correct column customisation, depending on whether the user is an admin
 * or not. Non-admins shouldn't be able to see the `Actions` section.
 * 
 * @param onDelete What happens when a single question is deleted.
 * @param isAdmin Whether to show the `Actions` column or not (which is dependent on whether the user
 * is an admin).
 * 
 * @returns The column customisation for the ListQuestionTable.
 */
const getColumns = ( onDelete : (id : string) => void, isAdmin: boolean ) : ColumnDef<Question>[] => [
  {
    accessorKey: "id",
    header: makeColumnSortable("ID"),
  },
  {
    accessorKey: "title",
    header: makeColumnSortable("Title"),
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      const url = "/questions/"+id;
      const title = row.getValue("title") as string;

      return (
        <Link to={url}>
          {title}
        </Link>
      )
    }
  },
  {
    accessorKey: "difficulty",
    header: makeColumnSortable("Difficulty"),
    cell: ({ row }) => {
      const difficulty = row.getValue("difficulty") as "easy" | "medium" | "hard";

      return (
        <Difficulty type={ difficulty } />
      )
    },
    sortingFn: (rowA, rowB, columnId) => {
      const diffA = rowA.getValue(columnId) as string
      const diffB = rowB.getValue(columnId) as string
      return difficultyOrder.indexOf(diffA) - difficultyOrder.indexOf(diffB)
    },
  },
  {
    accessorKey: "topics",
    header: makeColumnSortable("Topics"),
    cell: ({ row }) => {
      const topics = row.getValue("topics") as string[];
      return (
        <TopicView topics={ topics } />
      );
    }
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return isAdmin ? (
        <div className="flex flex-row">
          <Button onClick={ () => onDelete(id) } variant="ghost" className="p-0">
            <Trash2 className="mr-2 h-4 w-4" />
          </Button>
          <Button variant="link" className="p-0">
            <a href={ "/questions/" + id}>
              <Pencil className="mr-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      ) : (
        <div className="flex flex-row">
          <Button variant="ghost" className="p-0">
          <a href={ "/questions/" + id}>
              <Eye className="mr-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      );
    }
  }
];

interface DataTableProps<TData, TValue> {
  loading : boolean;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({ loading, columns, data } : DataTableProps<TData, TValue>) {
  const [ sorting, setSorting ] = useState<SortingState>([]);
  const table = useReactTable({ 
    data, 
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    }
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          { loading ? (
            // Loading skeleton
            [...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6" /></TableCell>
                <TableCell><Skeleton className="h-6" /></TableCell>
                <TableCell><Skeleton className="h-6" /></TableCell>
                <TableCell><Skeleton className="h-6" /></TableCell>
                <TableCell><Skeleton className="h-6" /></TableCell>
              </TableRow>
            ))) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * Generates the table in the ListQuestionPage. Requires the following props:
 * - `onDelete`: What happens when a single question is deleted.
 * - `isAdmin`: Whether to show the `Actions` column or not (which is dependent on whether the user
 * is an admin).
 * 
 * @returns The generated table for the ListQuestionPage.
 */
export default function ListQuestionTable({ loading, onDelete, questions } : { loading : boolean, onDelete : (id : string) => void, questions : Question[] }) {
  const { auth } = useAuth();
  
  return (
    <DataTable loading={loading} columns={getColumns(onDelete, auth.isAdmin)} data={questions} />
  )
}