import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ParcelViewer from '@/components/ParcelViewer'

interface ParcelPageProps {
  params: {
    canonicalKey: string
  }
}

export default async function ParcelPage({ params }: ParcelPageProps) {
  const supabase = createClient()
  
  const { data: parcel } = await supabase
    .from('parcels')
    .select(`
      *,
      parcel_metadata (
        ipfs_cid,
        metadata_hash,
        bhoomi_document_url,
        fmb_document_url
      )
    `)
    .eq('canonical_key', params.canonicalKey)
    .eq('verification_status', 'verified')
    .single()

  if (!parcel) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold text-primary-600">
                Naks.io
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
                Home
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ParcelViewer parcel={parcel} />
        </div>
      </div>
    </div>
  )
}
