"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MintedNFT } from "@/app/page"
import { ExternalLink, Download, Calendar, Hash, Copy } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface MintedNFTsPanelProps {
    mintedNFTs: MintedNFT[]
}

export function MintedNFTsPanel({ mintedNFTs }: MintedNFTsPanelProps) {
    const exportToCSV = () => {
        if (mintedNFTs.length === 0) {
            toast.error("No minted NFTs to export")
            return
        }

        const headers = ["Address", "Token ID", "Mint Date", "Transaction Hash"]
        const csvContent = [
            headers.join(","),
            ...mintedNFTs.map((nft) =>
                [nft.address, nft.tokenId, format(nft.mintDate, "yyyy-MM-dd HH:mm:ss"), nft.transactionHash].join(","),
            ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `minted-nfts-${format(new Date(), "yyyy-MM-dd")}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success("Minted NFTs exported to CSV")
    }

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                    <span>Minted NFTs</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {mintedNFTs.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mintedNFTs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Hash className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No NFTs minted yet</p>
                        <p className="text-xs text-gray-400 mt-1">Minted NFTs will appear here</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {mintedNFTs.map((nft) => (
                                <div
                                    key={nft.id}
                                    className="p-3 border rounded-lg bg-green-50 border-green-200 hover:bg-green-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-white px-2 py-1 rounded font-mono">
                                                    {`${nft.address.slice(0, 6)}...${nft.address.slice(-4)}`}
                                                </code>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(nft.address)
                                                        toast.success("Address copied")
                                                    }}
                                                    className="h-5 w-5 p-0"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                            #{nft.tokenId}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                        <Calendar className="h-3 w-3" />
                                        {format(nft.mintDate, "MMM dd, HH:mm")}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs p-1 hover:bg-green-200"
                                        onClick={() => {
                                            window.open(`https://etherscan.io/tx/${nft.transactionHash}`, "_blank")
                                        }}
                                    >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View on Etherscan
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button onClick={exportToCSV} variant="outline" className="w-full gap-2" size="sm">
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
