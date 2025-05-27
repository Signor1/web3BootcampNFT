"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { validateEthereumAddress, checkForDuplicates } from "@/lib/address-validation"
import type { AddressData } from "@/app/page"
import { toast } from "sonner"

interface CSVUploadSectionProps {
    onCSVParsed: (addresses: AddressData[]) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
}

export function CSVUploadSection({ onCSVParsed, isLoading, setIsLoading }: CSVUploadSectionProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [parseResults, setParseResults] = useState<{
        total: number
        valid: number
        invalid: number
        duplicates: number
    } | null>(null)

    const parseCSV = useCallback(
        async (file: File) => {
            setIsLoading(true)
            setParseResults(null)

            try {
                const text = await file.text()
                const lines = text.split("\n").filter((line) => line.trim())

                if (lines.length === 0) {
                    toast.error("CSV file is empty")
                    return
                }

                // Skip header if it exists
                const startIndex = lines[0].toLowerCase().includes("address") ? 1 : 0
                const addresses = lines.slice(startIndex).map((line) => line.trim().split(",")[0].trim())

                const addressData: AddressData[] = []
                let validCount = 0
                let invalidCount = 0

                // Validate each address
                for (let i = 0; i < addresses.length; i++) {
                    const address = addresses[i]
                    if (!address) continue

                    const validation = validateEthereumAddress(address)
                    const id = `addr_${i}_${Date.now()}`

                    addressData.push({
                        id,
                        address,
                        validationStatus: validation.isValid ? "valid" : "invalid",
                        mintStatus: "unminted",
                    })

                    if (validation.isValid) {
                        validCount++
                    } else {
                        invalidCount++
                    }
                }

                // Check for duplicates
                const { addressesWithDuplicates, duplicateCount } = checkForDuplicates(addressData)

                setParseResults({
                    total: addressData.length,
                    valid: validCount - duplicateCount,
                    invalid: invalidCount,
                    duplicates: duplicateCount,
                })

                onCSVParsed(addressesWithDuplicates)
                toast.success(`Parsed ${addressData.length} addresses from CSV`)
            } catch (error) {
                toast.error("Failed to parse CSV file")
                console.error("CSV parsing error:", error)
            } finally {
                setIsLoading(false)
            }
        },
        [onCSVParsed, setIsLoading],
    )

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]
            if (file) {
                setUploadedFile(file)
                parseCSV(file)
            }
        },
        [parseCSV],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.ms-excel": [".csv"],
        },
        maxFiles: 1,
        disabled: isLoading,
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    CSV Upload
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-300 hover:border-gray-400"}
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
          `}
                >
                    <input {...getInputProps()} />
                    {isLoading ? (
                        <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
                    ) : (
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    )}
                    {isLoading ? (
                        <p className="text-blue-600">Processing CSV file...</p>
                    ) : isDragActive ? (
                        <p className="text-blue-600">Drop the CSV file here...</p>
                    ) : (
                        <div>
                            <p className="text-gray-600 mb-2">Drag and drop a CSV file here, or click to select</p>
                            <p className="text-sm text-gray-500">CSV should contain Ethereum addresses (one per row)</p>
                        </div>
                    )}
                </div>

                {uploadedFile && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{uploadedFile.name}</span>
                        <span className="text-sm text-gray-500">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                )}

                {parseResults && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg border">
                            <div className="text-2xl font-bold text-gray-900">{parseResults.total}</div>
                            <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-2xl font-bold text-green-900">{parseResults.valid}</span>
                            </div>
                            <div className="text-sm text-green-700">Valid</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-center gap-1">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-2xl font-bold text-red-900">{parseResults.invalid}</span>
                            </div>
                            <div className="text-sm text-red-700">Invalid</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="text-2xl font-bold text-yellow-900">{parseResults.duplicates}</div>
                            <div className="text-sm text-yellow-700">Duplicates</div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
