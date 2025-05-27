/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMemo, useState, useRef } from "react"
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type ColumnDef,
    getPaginationRowModel,
    type PaginationState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AddressData } from "@/app/page"
import {
    CheckCircle,
    XCircle,
    Copy,
    Clock,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"
import { toast } from "sonner"

interface AddressTableProps {
    data: AddressData[]
    selectedAddresses: Set<string>
    onSelectionChange: (addressId: string, selected: boolean) => void
    maxSelections: number
}

const columnHelper = createColumnHelper<AddressData>()

export function AddressTable({ data, selectedAddresses, onSelectionChange, maxSelections }: AddressTableProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 20,
    })

    const tableContainerRef = useRef<HTMLDivElement>(null)

    const columns = useMemo<ColumnDef<AddressData, any>[]>(
        () => [
            columnHelper.display({
                id: "select",
                header: ({ table }) => (
                    <div className="flex items-center">
                        <span className="text-xs font-medium">Select</span>
                    </div>
                ),
                cell: ({ row }) => {
                    const isSelected = selectedAddresses.has(row.original.id)
                    const isDisabled =
                        row.original.validationStatus !== "valid" ||
                        row.original.mintStatus !== "unminted" ||
                        (!isSelected && selectedAddresses.size >= maxSelections)

                    return (
                        <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={(checked) => {
                                onSelectionChange(row.original.id, !!checked)
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                    )
                },
                size: 60,
            }),
            columnHelper.accessor("address", {
                header: "Wallet Address",
                cell: ({ getValue, row }) => {
                    const address = getValue()
                    const isSelected = selectedAddresses.has(row.original.id)

                    return (
                        <div className={`flex items-center gap-2 ${isSelected ? "font-medium" : ""}`}>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                {`${address.slice(0, 6)}...${address.slice(-4)}`}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(address)
                                    toast.success("Address copied to clipboard")
                                }}
                                className="h-6 w-6 p-0 hover:bg-gray-200"
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    )
                },
            }),
            columnHelper.accessor("validationStatus", {
                header: "Validation Status",
                cell: ({ getValue }) => {
                    const status = getValue()
                    const config = {
                        valid: {
                            icon: CheckCircle,
                            color: "bg-green-100 text-green-800 border-green-200",
                            label: "Valid",
                        },
                        invalid: {
                            icon: XCircle,
                            color: "bg-red-100 text-red-800 border-red-200",
                            label: "Invalid",
                        },
                        duplicate: {
                            icon: XCircle,
                            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                            label: "Duplicate",
                        },
                    }

                    const { icon: Icon, color, label } = config[status]

                    return (
                        <Badge variant="outline" className={color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {label}
                        </Badge>
                    )
                },
            }),
            columnHelper.accessor("mintStatus", {
                header: "Mint Status",
                cell: ({ getValue, row }) => {
                    const status = getValue()
                    const config = {
                        unminted: {
                            icon: Clock,
                            color: "bg-gray-100 text-gray-800 border-gray-200",
                            label: "Unminted",
                        },
                        pending: {
                            icon: Loader2,
                            color: "bg-blue-100 text-blue-800 border-blue-200",
                            label: "Pending",
                            animate: true,
                        },
                        minted: {
                            icon: CheckCircle,
                            color: "bg-green-100 text-green-800 border-green-200",
                            label: `Minted #${row.original.tokenId}`,
                        },
                    }

                    const { icon: Icon, color, label, animate } = config[status]

                    return (
                        <Badge variant="outline" className={color}>
                            <Icon className={`h-3 w-3 mr-1 ${animate ? "animate-spin" : ""}`} />
                            {label}
                        </Badge>
                    )
                },
            }),
        ],
        [selectedAddresses, onSelectionChange, maxSelections],
    )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            pagination,
        },
    })

    const { rows } = table.getRowModel()

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 60,
        overscan: 5,
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Addresses ({data.length})</span>
                    <div className="text-sm font-normal text-gray-600">
                        Selected:{" "}
                        <span className={selectedAddresses.size > 5 ? "text-red-600 font-medium" : ""}>
                            {selectedAddresses.size}
                        </span>
                        /{maxSelections}
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Virtualized Table */}
                <div ref={tableContainerRef} className="h-[500px] overflow-auto border rounded-lg">
                    <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                                            >
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {virtualizer.getVirtualItems().map((virtualRow) => {
                                    const row = rows[virtualRow.index]
                                    const isSelected = selectedAddresses.has(row.original.id)

                                    return (
                                        <tr
                                            key={row.id}
                                            className={`
                        border-b hover:bg-gray-50 transition-colors
                        ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                      `}
                                            style={{
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length,
                                )}
                            </span>{" "}
                            of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-700">Rows per page:</p>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => {
                                    table.setPageSize(Number(e.target.value))
                                }}
                                className="h-8 w-16 rounded border border-gray-300 px-2 text-sm"
                            >
                                {[10, 20, 30, 50].map((pageSize) => (
                                    <option key={pageSize} value={pageSize}>
                                        {pageSize}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1 mx-2">
                                <span className="text-sm text-gray-700">
                                    Page{" "}
                                    <span className="font-medium">
                                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                    </span>
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Selection Info */}
                {selectedAddresses.size > 0 && (
                    <div className="text-xs text-gray-500 text-center bg-blue-50 p-2 rounded">
                        {selectedAddresses.size} address{selectedAddresses.size !== 1 ? "es" : ""} selected across all pages
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
