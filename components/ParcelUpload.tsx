'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { verifyParcelData, validateBhoomiData, validateFMBData } from '@/lib/verification/parcel-verification'
import { getIPFSClient } from '@/lib/ipfs/ipfs-client'

interface ParcelUploadProps {}

export default function ParcelUpload({}: ParcelUploadProps) {
  const [bhoomiFile, setBhoomiFile] = useState<File | null>(null)
  const [fmbFile, setFmbFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()

  const handleBhoomiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/json') {
      setBhoomiFile(file)
      setError('')
    } else {
      setError('Please select a valid JSON file for Bhoomi data')
    }
  }

  const handleFmbFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/json') {
      setFmbFile(file)
      setError('')
    } else {
      setError('Please select a valid JSON file for FMB data')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bhoomiFile || !fmbFile) {
      setError('Please select both Bhoomi and FMB files')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Read and parse files
      const bhoomiText = await bhoomiFile.text()
      const fmbText = await fmbFile.text()
      
      const bhoomiData = JSON.parse(bhoomiText)
      const fmbData = JSON.parse(fmbText)

      // Validate data
      const bhoomiValidation = validateBhoomiData(bhoomiData)
      if (!bhoomiValidation.isValid) {
        setError(`Bhoomi data validation failed: ${bhoomiValidation.errors.join(', ')}`)
        return
      }

      const fmbValidation = validateFMBData(fmbData)
      if (!fmbValidation.isValid) {
        setError(`FMB data validation failed: ${fmbValidation.errors.join(', ')}`)
        return
      }

      // Verify parcel data
      const verification = verifyParcelData(bhoomiData, fmbData)
      
      if (!verification.isValid) {
        setError(`Parcel verification failed: ${verification.errors.join(', ')}`)
        return
      }

      // Upload files to Supabase Storage
      const bhoomiFileName = `bhoomi-${Date.now()}.json`
      const fmbFileName = `fmb-${Date.now()}.json`

      const { error: bhoomiUploadError } = await supabase.storage
        .from('parcel-documents')
        .upload(bhoomiFileName, bhoomiFile)

      if (bhoomiUploadError) {
        setError(`Failed to upload Bhoomi file: ${bhoomiUploadError.message}`)
        return
      }

      const { error: fmbUploadError } = await supabase.storage
        .from('parcel-documents')
        .upload(fmbFileName, fmbFile)

      if (fmbUploadError) {
        setError(`Failed to upload FMB file: ${fmbUploadError.message}`)
        return
      }

      // Get file URLs
      const { data: bhoomiUrlData } = supabase.storage
        .from('parcel-documents')
        .getPublicUrl(bhoomiFileName)

      const { data: fmbUrlData } = supabase.storage
        .from('parcel-documents')
        .getPublicUrl(fmbFileName)

      // Create parcel record
      const { data: parcel, error: parcelError } = await supabase
        .from('parcels')
        .insert({
          canonical_key: verification.canonicalKey,
          state: bhoomiData.state,
          district: bhoomiData.district,
          survey_no: bhoomiData.survey_no,
          fmb_id: fmbData.fmb_id,
          village: bhoomiData.village,
          taluk: bhoomiData.taluk,
          area_hectares: bhoomiData.area_hectares || fmbData.area_hectares,
          geometry: fmbData.geometry,
          bhoomi_data: bhoomiData,
          fmb_data: fmbData,
          verification_score: verification.score,
          verification_notes: verification.warnings.join('; '),
        })
        .select()
        .single()

      if (parcelError) {
        setError(`Failed to create parcel record: ${parcelError.message}`)
        return
      }

      // Create metadata record
      const { error: metadataError } = await supabase
        .from('parcel_metadata')
        .insert({
          parcel_id: parcel.id,
          bhoomi_document_url: bhoomiUrlData.publicUrl,
          fmb_document_url: fmbUrlData.publicUrl,
        })

      if (metadataError) {
        setError(`Failed to create metadata record: ${metadataError.message}`)
        return
      }

      setSuccess('Parcel uploaded successfully! It will be reviewed by our team.')
      setBhoomiFile(null)
      setFmbFile(null)
      
      // Reset file inputs
      const bhoomiInput = document.getElementById('bhoomi-file') as HTMLInputElement
      const fmbInput = document.getElementById('fmb-file') as HTMLInputElement
      if (bhoomiInput) bhoomiInput.value = ''
      if (fmbInput) fmbInput.value = ''

    } catch (err) {
      setError(`An error occurred: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="bhoomi-file" className="label">
          Bhoomi Data (JSON)
        </label>
        <input
          id="bhoomi-file"
          type="file"
          accept=".json"
          onChange={handleBhoomiFileChange}
          className="input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload the Bhoomi JSON file containing land parcel information
        </p>
      </div>

      <div>
        <label htmlFor="fmb-file" className="label">
          FMB Data (GeoJSON)
        </label>
        <input
          id="fmb-file"
          type="file"
          accept=".json"
          onChange={handleFmbFileChange}
          className="input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload the FMB GeoJSON file containing parcel geometry
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-error-50 p-3">
          <div className="text-sm text-error-700">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-success-50 p-3">
          <div className="text-sm text-success-700">{success}</div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !bhoomiFile || !fmbFile}
        className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading...' : 'Upload Parcel'}
      </button>
    </form>
  )
}
