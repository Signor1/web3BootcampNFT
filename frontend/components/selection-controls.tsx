"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Loader2, AlertTriangle } from "lucide-react"

interface SelectionControlsProps {
    selectedCount: number
    canMint: boolean
    onBatchMint: () => void
    isLoading: boolean
}

export function SelectionControls({ selectedCount, canMint, onBatchMint, isLoading }: SelectionControlsProps) {
    return (
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Selected:</span>
                            <Badge
                                variant={selectedCount > 5 ? "destructive" : "default"}
                                className={
                                    selectedCount > 5
                                        ? "bg-red-100 text-red-800 border-red-300"
                                        : selectedCount > 0
                                            ? "bg-blue-100 text-blue-800 border-blue-300"
                                            : "bg-gray-100 text-gray-800 border-gray-300"
                                }
                            >
                                {selectedCount}/5
                            </Badge>
                        </div>

                        {selectedCount > 5 && (
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm">Maximum 5 addresses can be selected for batch minting</span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={onBatchMint}
                        disabled={!canMint || isLoading}
                        className="gap-2"
                        size="lg"
                        variant={canMint && !isLoading ? "default" : "secondary"}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        {isLoading ? "Minting..." : "Batch Mint"}
                    </Button>
                </div>

                {selectedCount > 0 && selectedCount <= 5 && !isLoading && (
                    <div className="mt-3 text-sm text-gray-600">
                        Ready to mint {selectedCount} NFT{selectedCount !== 1 ? "s" : ""} to selected addresses
                    </div>
                )}

                {isLoading && (
                    <div className="mt-3 text-sm text-blue-600">
                        Minting in progress... Please wait for all transactions to complete.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
