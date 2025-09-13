'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Parcel = Database['public']['Tables']['parcels']['Row'] & {
  profiles: {
    full_name: string | null
    email: string | null
  }
}

interface AdminParcelListProps {
  parcels: Parcel[]
}

export default function AdminParcelList({ parcels }: AdminParcelListProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleStatusUpdate = async (parcelId: string, status: string, notes?: string) => {
    setLoading(parcelId)
    setError('')

    try {
      const { error } = await supabase
        .from('parcels')
        .update({
          verification_status: status,
          verification_notes: notes,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
        })
        .eq('id', parcelId)

      if (error) {
        setError(`Failed to update status: ${error.message}`)
      } else {
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (err) {
      setError(`An error occurred: ${err}`)
    } finally {
      setLoading(null)
    }
  }

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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (parcels.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No parcels</h3>
        <p className="mt-1 text-sm text-gray-500">No parcel submissions found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-error-50 p-3">
          <div className="text-sm text-error-700">{error}</div>
        </div>
      )}

      {parcels.map((parcel) => (
        <div key={parcel.id} className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {parcel.survey_no}
                </h3>
                {getStatusBadge(parcel.verification_status)}
                <span className="text-sm text-gray-500">
                  Score: {parcel.verification_score}/100
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Owner:</strong> {parcel.profiles.full_name || parcel.profiles.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Location:</strong> {parcel.district}, {parcel.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>FMB ID:</strong> {parcel.fmb_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Submitted:</strong> {formatDate(parcel.created_at)}
                  </p>
                  {parcel.area_hectares && (
                    <p className="text-sm text-gray-600">
                      <strong>Area:</strong> {parcel.area_hectares} hectares
                    </p>
                  )}
                  {parcel.village && (
                    <p className="text-sm text-gray-600">
                      <strong>Village:</strong> {parcel.village}
                      {parcel.taluk && `, ${parcel.taluk}`}
                    </p>
                  )}
                </div>
              </div>

              {parcel.verification_notes && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Notes:</strong> {parcel.verification_notes}
                  </p>
                </div>
              )}

              {parcel.rejection_reason && (
                <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-md">
                  <p className="text-sm text-error-700">
                    <strong>Rejection reason:</strong> {parcel.rejection_reason}
                  </p>
                </div>
              )}
            </div>

            <div className="ml-4 flex flex-col space-y-2">
              {parcel.verification_status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(parcel.id, 'under_review')}
                    disabled={loading === parcel.id}
                    className="btn btn-warning text-sm disabled:opacity-50"
                  >
                    {loading === parcel.id ? 'Updating...' : 'Mark Under Review'}
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Enter verification notes (optional):')
                      handleStatusUpdate(parcel.id, 'verified', notes || undefined)
                    }}
                    disabled={loading === parcel.id}
                    className="btn btn-success text-sm disabled:opacity-50"
                  >
                    {loading === parcel.id ? 'Updating...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:')
                      if (reason) {
                        handleStatusUpdate(parcel.id, 'rejected', reason)
                      }
                    }}
                    disabled={loading === parcel.id}
                    className="btn btn-error text-sm disabled:opacity-50"
                  >
                    {loading === parcel.id ? 'Updating...' : 'Reject'}
                  </button>
                </>
              )}

              {parcel.verification_status === 'under_review' && (
                <>
                  <button
                    onClick={() => {
                      const notes = prompt('Enter verification notes (optional):')
                      handleStatusUpdate(parcel.id, 'verified', notes || undefined)
                    }}
                    disabled={loading === parcel.id}
                    className="btn btn-success text-sm disabled:opacity-50"
                  >
                    {loading === parcel.id ? 'Updating...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:')
                      if (reason) {
                        handleStatusUpdate(parcel.id, 'rejected', reason)
                      }
                    }}
                    disabled={loading === parcel.id}
                    className="btn btn-error text-sm disabled:opacity-50"
                  >
                    {loading === parcel.id ? 'Updating...' : 'Reject'}
                  </button>
                </>
              )}

              {parcel.verification_status === 'verified' && (
                <span className="text-sm text-success-600 font-medium">
                  ✓ Verified
                </span>
              )}

              {parcel.verification_status === 'rejected' && (
                <span className="text-sm text-error-600 font-medium">
                  ✗ Rejected
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
