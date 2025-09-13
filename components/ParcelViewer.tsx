'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/lib/supabase/database.types'

type Parcel = Database['public']['Tables']['parcels']['Row'] & {
  parcel_metadata: Database['public']['Tables']['parcel_metadata']['Row'][]
}

interface ParcelViewerProps {
  parcel: Parcel
}

export default function ParcelViewer({ parcel }: ParcelViewerProps) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    }

    loadLeaflet()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="status-badge status-verified">✓ Verified</span>
      default:
        return <span className="status-badge status-pending">{status}</span>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Land Parcel {parcel.survey_no}
          </h1>
          {getStatusBadge(parcel.verification_status)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Location</p>
            <p className="text-lg text-gray-900">{parcel.district}, {parcel.state}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Survey Number</p>
            <p className="text-lg text-gray-900">{parcel.survey_no}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">FMB ID</p>
            <p className="text-lg text-gray-900">{parcel.fmb_id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Verification Score</p>
            <p className="text-lg text-gray-900">{parcel.verification_score}/100</p>
          </div>
        </div>

        {parcel.village && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Village</p>
            <p className="text-lg text-gray-900">
              {parcel.village}
              {parcel.taluk && `, ${parcel.taluk}`}
            </p>
          </div>
        )}

        {parcel.area_hectares && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Area</p>
            <p className="text-lg text-gray-900">{parcel.area_hectares} hectares</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Parcel Location</h2>
        <div 
          id="map" 
          className="h-96 w-full rounded-lg border border-gray-200"
          style={{ minHeight: '400px' }}
        >
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading map...
            </div>
          )}
        </div>
      </div>

      {/* Verification Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm font-medium">{parcel.verification_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Score</span>
                <span className="text-sm font-medium">{parcel.verification_score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Verified Date</span>
                <span className="text-sm font-medium">
                  {parcel.verified_at ? formatDate(parcel.verified_at) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Blockchain Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Canonical Key</span>
                <span className="text-sm font-mono text-gray-900 break-all">
                  {parcel.canonical_key}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm font-medium">
                  {formatDate(parcel.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {parcel.verification_notes && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Verification Notes</h4>
            <p className="text-sm text-blue-700">{parcel.verification_notes}</p>
          </div>
        )}
      </div>

      {/* Metadata */}
      {parcel.parcel_metadata && parcel.parcel_metadata.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
          <div className="space-y-2">
            {parcel.parcel_metadata[0].ipfs_cid && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">IPFS CID</span>
                <a 
                  href={`https://ipfs.io/ipfs/${parcel.parcel_metadata[0].ipfs_cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-primary-600 hover:text-primary-800 break-all"
                >
                  {parcel.parcel_metadata[0].ipfs_cid}
                </a>
              </div>
            )}
            {parcel.parcel_metadata[0].metadata_hash && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Metadata Hash</span>
                <span className="text-sm font-mono text-gray-900 break-all">
                  {parcel.parcel_metadata[0].metadata_hash}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
