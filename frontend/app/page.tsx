"use client"

import { useState, useCallback } from "react"
import { CSVUploadSection } from "@/components/csv-upload-section"
import { AddressTable } from "@/components/address-table"
import { MintedNFTsPanel } from "@/components/minted-nfts-panel"
import { SelectionControls } from "@/components/selection-controls"
import { Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface AddressData {
  id: string
  address: string
  validationStatus: "valid" | "invalid" | "duplicate"
  mintStatus: "unminted" | "pending" | "minted"
  tokenId?: number
  mintDate?: Date
  transactionHash?: string
}

export interface MintedNFT {
  id: string
  address: string
  tokenId: number
  mintDate: Date
  transactionHash: string
}

export default function NFTBatchMinter() {
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set())
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showMintedPanel, setShowMintedPanel] = useState(false)

  const handleCSVParsed = useCallback((parsedAddresses: AddressData[]) => {
    setAddresses(parsedAddresses)
    setSelectedAddresses(new Set())
  }, [])

  const handleSelectionChange = useCallback((addressId: string, selected: boolean) => {
    setSelectedAddresses((prev) => {
      const newSelection = new Set(prev)
      if (selected && newSelection.size < 5) {
        newSelection.add(addressId)
      } else if (!selected) {
        newSelection.delete(addressId)
      }
      return newSelection
    })
  }, [])

  const handleBatchMint = useCallback(async () => {
    const selectedData = addresses.filter((addr) => selectedAddresses.has(addr.id))

    // Update status to pending
    setAddresses((prev) =>
      prev.map((addr) => (selectedAddresses.has(addr.id) ? { ...addr, mintStatus: "pending" as const } : addr)),
    )

    // Simulate minting process
    for (const addr of selectedData) {
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

      const tokenId = Math.floor(Math.random() * 10000) + 1
      const mintDate = new Date()
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`

      // Update address status to minted
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === addr.id ? { ...a, mintStatus: "minted" as const, tokenId, mintDate, transactionHash } : a,
        ),
      )

      // Add to minted NFTs
      setMintedNFTs((prev) => [
        ...prev,
        {
          id: addr.id,
          address: addr.address,
          tokenId,
          mintDate,
          transactionHash,
        },
      ])
    }

    setSelectedAddresses(new Set())
  }, [addresses, selectedAddresses])

  const selectedCount = selectedAddresses.size
  const canMint =
    selectedCount > 0 &&
    selectedCount <= 5 &&
    addresses
      .filter((addr) => selectedAddresses.has(addr.id))
      .every((addr) => addr.validationStatus === "valid" && addr.mintStatus === "unminted")

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NFT Batch Minter</h1>
          <p className="text-gray-600">Upload a CSV file with Ethereum addresses to batch mint NFTs</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className={`${showMintedPanel ? "xl:col-span-3" : "xl:col-span-4"} space-y-6`}>
            {/* CSV Upload Section */}
            <CSVUploadSection onCSVParsed={handleCSVParsed} isLoading={isLoading} setIsLoading={setIsLoading} />

            {/* Selection Controls */}
            {addresses.length > 0 && (
              <SelectionControls
                selectedCount={selectedCount}
                canMint={canMint}
                onBatchMint={handleBatchMint}
                isLoading={isLoading}
              />
            )}

            {/* Address Table */}
            {addresses.length > 0 && (
              <AddressTable
                data={addresses}
                selectedAddresses={selectedAddresses}
                onSelectionChange={handleSelectionChange}
                maxSelections={5}
              />
            )}
          </div>

          {/* Minted NFTs Panel */}
          <div className={`${showMintedPanel ? "xl:col-span-1" : "hidden xl:block xl:col-span-0"}`}>
            <MintedNFTsPanel mintedNFTs={mintedNFTs} />
          </div>
        </div>

        {/* Mobile Toggle for Minted Panel */}
        <div className="xl:hidden mt-6">
          <Button variant="outline" onClick={() => setShowMintedPanel(!showMintedPanel)} className="w-full">
            {showMintedPanel ? (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Hide Minted NFTs ({mintedNFTs.length})
              </>
            ) : (
              <>
                Show Minted NFTs ({mintedNFTs.length})
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
