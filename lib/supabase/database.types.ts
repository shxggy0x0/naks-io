export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'user' | 'admin' | 'reviewer'
          full_name: string | null
          email: string | null
          phone: string | null
          kyc_status: 'pending' | 'verified' | 'rejected'
          kyc_provider: string | null
          kyc_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'user' | 'admin' | 'reviewer'
          full_name?: string | null
          email?: string | null
          phone?: string | null
          kyc_status?: 'pending' | 'verified' | 'rejected'
          kyc_provider?: string | null
          kyc_reference?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'user' | 'admin' | 'reviewer'
          full_name?: string | null
          email?: string | null
          phone?: string | null
          kyc_status?: 'pending' | 'verified' | 'rejected'
          kyc_provider?: string | null
          kyc_reference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parcels: {
        Row: {
          id: string
          owner_id: string
          canonical_key: string
          state: string
          district: string
          survey_no: string
          fmb_id: string
          village: string | null
          taluk: string | null
          area_hectares: number | null
          geometry: unknown
          bhoomi_data: Json | null
          fmb_data: Json | null
          verification_status: 'pending' | 'verified' | 'rejected' | 'under_review'
          verification_score: number
          verification_notes: string | null
          rejection_reason: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          canonical_key: string
          state: string
          district: string
          survey_no: string
          fmb_id: string
          village?: string | null
          taluk?: string | null
          area_hectares?: number | null
          geometry: unknown
          bhoomi_data?: Json | null
          fmb_data?: Json | null
          verification_status?: 'pending' | 'verified' | 'rejected' | 'under_review'
          verification_score?: number
          verification_notes?: string | null
          rejection_reason?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          canonical_key?: string
          state?: string
          district?: string
          survey_no?: string
          fmb_id?: string
          village?: string | null
          taluk?: string | null
          area_hectares?: number | null
          geometry?: unknown
          bhoomi_data?: Json | null
          fmb_data?: Json | null
          verification_status?: 'pending' | 'verified' | 'rejected' | 'under_review'
          verification_score?: number
          verification_notes?: string | null
          rejection_reason?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parcel_metadata: {
        Row: {
          id: string
          parcel_id: string
          ipfs_cid: string | null
          metadata_hash: string | null
          bhoomi_document_url: string | null
          fmb_document_url: string | null
          other_documents: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          ipfs_cid?: string | null
          metadata_hash?: string | null
          bhoomi_document_url?: string | null
          fmb_document_url?: string | null
          other_documents?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          ipfs_cid?: string | null
          metadata_hash?: string | null
          bhoomi_document_url?: string | null
          fmb_document_url?: string | null
          other_documents?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      tokens: {
        Row: {
          id: string
          parcel_id: string
          token_id: string
          contract_address: string
          chain_id: number
          mint_tx_hash: string | null
          mint_block_number: number | null
          transfer_restricted: boolean
          kyc_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parcel_id: string
          token_id: string
          contract_address: string
          chain_id?: number
          mint_tx_hash?: string | null
          mint_block_number?: number | null
          transfer_restricted?: boolean
          kyc_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parcel_id?: string
          token_id?: string
          contract_address?: string
          chain_id?: number
          mint_tx_hash?: string | null
          mint_block_number?: number | null
          transfer_restricted?: boolean
          kyc_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      owners: {
        Row: {
          id: string
          token_id: string
          owner_id: string
          ownership_percentage: number
          acquired_at: string
          created_at: string
        }
        Insert: {
          id?: string
          token_id: string
          owner_id: string
          ownership_percentage?: number
          acquired_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          token_id?: string
          owner_id?: string
          ownership_percentage?: number
          acquired_at?: string
          created_at?: string
        }
      }
      transfers: {
        Row: {
          id: string
          token_id: string
          from_address: string | null
          to_address: string
          from_user_id: string | null
          to_user_id: string | null
          tx_hash: string
          block_number: number
          transfer_type: 'mint' | 'transfer' | 'burn'
          kyc_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          token_id: string
          from_address?: string | null
          to_address: string
          from_user_id?: string | null
          to_user_id?: string | null
          tx_hash: string
          block_number: number
          transfer_type: 'mint' | 'transfer' | 'burn'
          kyc_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          token_id?: string
          from_address?: string | null
          to_address?: string
          from_user_id?: string | null
          to_user_id?: string | null
          tx_hash?: string
          block_number?: number
          transfer_type?: 'mint' | 'transfer' | 'burn'
          kyc_verified?: boolean
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
