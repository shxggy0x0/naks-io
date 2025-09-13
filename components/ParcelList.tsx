'use client'

import { Database } from '@/lib/supabase/database.types'

type Parcel = Database['public']['Tables']['parcels']['Row']

interface ParcelListProps {
  parcels: Parcel[]
}

export default function ParcelList({ parcels }: ParcelListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="status-badge status-verified">Verified</span>
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>
      case 'under_review':
        return <span className="status-badge status-under-review">Under Review</span>
      case 'rejected':
        return <span className="status-badge status-rejected">Rejected</span>
      default:
        return <span className="status-badge status-pending">{status}</span>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (parcels.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No parcels</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by uploading your first land parcel.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {parcels.map((parcel) => (
        <div key={parcel.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {parcel.survey_no}
                </h3>
                {getStatusBadge(parcel.verification_status)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {parcel.district}, {parcel.state}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>FMB ID: {parcel.fmb_id}</span>
                {parcel.area_hectares && (
                  <span>Area: {parcel.area_hectares} ha</span>
                )}
                <span>Score: {parcel.verification_score}/100</span>
              </div>
              {parcel.village && (
                <p className="text-sm text-gray-500 mt-1">
                  Village: {parcel.village}
                  {parcel.taluk && `, Taluk: ${parcel.taluk}`}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {formatDate(parcel.created_at)}
              </p>
              {parcel.verification_notes && (
                <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                  {parcel.verification_notes}
                </p>
              )}
            </div>
          </div>
          
          {parcel.rejection_reason && (
            <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-md">
              <p className="text-sm text-error-700">
                <strong>Rejection reason:</strong> {parcel.rejection_reason}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
