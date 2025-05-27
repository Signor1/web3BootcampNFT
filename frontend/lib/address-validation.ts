import type { AddressData } from "@/app/page";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEthereumAddress(address: string): ValidationResult {
  // Remove whitespace
  const cleanAddress = address.trim();

  // Check if it's a valid hex string with 0x prefix
  if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
    return {
      isValid: false,
      error: "Invalid Ethereum address format",
    };
  }

  // Basic checksum validation (simplified)
  const hasUpperCase = /[A-F]/.test(cleanAddress.slice(2));
  const hasLowerCase = /[a-f]/.test(cleanAddress.slice(2));

  // If it has mixed case, it should be a valid checksum
  if (hasUpperCase && hasLowerCase) {
    // In a real implementation, you would validate the actual checksum
    // For this demo, we'll assume mixed case addresses are valid
    return { isValid: true };
  }

  // All lowercase or all uppercase addresses are valid
  return { isValid: true };
}

export function checkForDuplicates(addresses: AddressData[]): {
  addressesWithDuplicates: AddressData[];
  duplicateCount: number;
} {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  let duplicateCount = 0;

  // First pass: identify duplicates
  addresses.forEach((addr) => {
    const normalizedAddress = addr.address.toLowerCase();
    if (seen.has(normalizedAddress)) {
      duplicates.add(normalizedAddress);
    } else {
      seen.add(normalizedAddress);
    }
  });

  // Second pass: mark duplicates
  const addressesWithDuplicates = addresses.map((addr) => {
    const normalizedAddress = addr.address.toLowerCase();
    if (duplicates.has(normalizedAddress)) {
      duplicateCount++;
      return {
        ...addr,
        validationStatus: "duplicate" as const,
      };
    }
    return addr;
  });

  return { addressesWithDuplicates, duplicateCount };
}

export async function checkOnChainDuplicates(
  addresses: string[]
): Promise<string[]> {
  // Simulate on-chain duplicate check
  // In a real implementation, this would query your NFT contract
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // For demo purposes, randomly mark some addresses as already having NFTs
  return addresses.filter(() => Math.random() > 0.9);
}
