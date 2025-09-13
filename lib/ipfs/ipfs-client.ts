import { Web3Storage } from 'web3.storage'
import CryptoJS from 'crypto-js'

export interface IPFSMetadata {
  name: string
  description: string
  image?: string
  external_url?: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties: {
    canonical_key: string
    state: string
    district: string
    survey_no: string
    fmb_id: string
    village?: string
    taluk?: string
    area_hectares?: number
    verification_score: number
    verification_status: string
    created_at: string
    ipfs_cid: string
  }
}

export interface PrivateMetadata {
  owner_id: string
  bhoomi_data: any
  fmb_data: any
  documents: {
    bhoomi_document_url?: string
    fmb_document_url?: string
    other_documents?: any[]
  }
  kyc_data?: any
  created_at: string
}

export class IPFSClient {
  private client: Web3Storage

  constructor(token: string) {
    this.client = new Web3Storage({ token })
  }

  /**
   * Upload file to IPFS and return CID
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const cid = await this.client.put([file])
      return cid
    } catch (error) {
      console.error('Error uploading file to IPFS:', error)
      throw new Error('Failed to upload file to IPFS')
    }
  }

  /**
   * Upload JSON data to IPFS and return CID
   */
  async uploadJSON(data: any, filename: string = 'data.json'): Promise<string> {
    try {
      const jsonString = JSON.stringify(data, null, 2)
      const file = new File([jsonString], filename, { type: 'application/json' })
      const cid = await this.client.put([file])
      return cid
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error)
      throw new Error('Failed to upload JSON to IPFS')
    }
  }

  /**
   * Create and upload public metadata for a parcel token
   */
  async createParcelMetadata(
    parcelData: {
      canonical_key: string
      state: string
      district: string
      survey_no: string
      fmb_id: string
      village?: string
      taluk?: string
      area_hectares?: number
      verification_score: number
      verification_status: string
      created_at: string
      geometry: any
    }
  ): Promise<{ cid: string; metadata: IPFSMetadata }> {
    const metadata: IPFSMetadata = {
      name: `Land Parcel ${parcelData.survey_no}`,
      description: `Verified land parcel in ${parcelData.district}, ${parcelData.state}. Survey No: ${parcelData.survey_no}`,
      external_url: `${process.env.NEXT_PUBLIC_APP_URL}/parcel/${parcelData.canonical_key}`,
      attributes: [
        {
          trait_type: 'State',
          value: parcelData.state
        },
        {
          trait_type: 'District',
          value: parcelData.district
        },
        {
          trait_type: 'Survey Number',
          value: parcelData.survey_no
        },
        {
          trait_type: 'FMB ID',
          value: parcelData.fmb_id
        },
        {
          trait_type: 'Verification Score',
          value: parcelData.verification_score
        },
        {
          trait_type: 'Verification Status',
          value: parcelData.verification_status
        }
      ],
      properties: {
        canonical_key: parcelData.canonical_key,
        state: parcelData.state,
        district: parcelData.district,
        survey_no: parcelData.survey_no,
        fmb_id: parcelData.fmb_id,
        village: parcelData.village,
        taluk: parcelData.taluk,
        area_hectares: parcelData.area_hectares,
        verification_score: parcelData.verification_score,
        verification_status: parcelData.verification_status,
        created_at: parcelData.created_at,
        ipfs_cid: '' // Will be set after upload
      }
    }

    // Add area attribute if available
    if (parcelData.area_hectares) {
      metadata.attributes.push({
        trait_type: 'Area (Hectares)',
        value: parcelData.area_hectares
      })
    }

    // Add village and taluk attributes if available
    if (parcelData.village) {
      metadata.attributes.push({
        trait_type: 'Village',
        value: parcelData.village
      })
    }

    if (parcelData.taluk) {
      metadata.attributes.push({
        trait_type: 'Taluk',
        value: parcelData.taluk
      })
    }

    const cid = await this.uploadJSON(metadata, 'metadata.json')
    metadata.properties.ipfs_cid = cid

    return { cid, metadata }
  }

  /**
   * Create and upload private metadata for a parcel
   */
  async createPrivateMetadata(
    ownerId: string,
    bhoomiData: any,
    fmbData: any,
    documents: {
      bhoomi_document_url?: string
      fmb_document_url?: string
      other_documents?: any[]
    },
    kycData?: any
  ): Promise<{ cid: string; metadata: PrivateMetadata }> {
    const metadata: PrivateMetadata = {
      owner_id: ownerId,
      bhoomi_data: bhoomiData,
      fmb_data: fmbData,
      documents,
      kyc_data: kycData,
      created_at: new Date().toISOString()
    }

    const cid = await this.uploadJSON(metadata, 'private-metadata.json')
    return { cid, metadata }
  }

  /**
   * Retrieve data from IPFS using CID
   */
  async getData(cid: string): Promise<any> {
    try {
      const response = await this.client.get(cid)
      if (!response) {
        throw new Error('No data found for CID')
      }

      const files = await response.files()
      if (files.length === 0) {
        throw new Error('No files found in IPFS response')
      }

      const file = files[0]
      const text = await file.text()
      return JSON.parse(text)
    } catch (error) {
      console.error('Error retrieving data from IPFS:', error)
      throw new Error('Failed to retrieve data from IPFS')
    }
  }

  /**
   * Generate Merkle root for metadata verification
   */
  generateMerkleRoot(metadata: any): string {
    const metadataString = JSON.stringify(metadata, Object.keys(metadata).sort())
    return CryptoJS.SHA256(metadataString).toString()
  }

  /**
   * Verify metadata integrity using Merkle root
   */
  verifyMetadataIntegrity(metadata: any, expectedHash: string): boolean {
    const actualHash = this.generateMerkleRoot(metadata)
    return actualHash === expectedHash
  }
}

// Singleton instance
let ipfsClient: IPFSClient | null = null

export function getIPFSClient(): IPFSClient {
  if (!ipfsClient) {
    const token = process.env.WEB3_STORAGE_TOKEN
    if (!token) {
      throw new Error('WEB3_STORAGE_TOKEN environment variable is required')
    }
    ipfsClient = new IPFSClient(token)
  }
  return ipfsClient
}
