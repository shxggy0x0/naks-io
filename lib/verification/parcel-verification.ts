import CryptoJS from 'crypto-js'
import { GeoJSON } from 'geojson'

export interface BhoomiData {
  state: string
  district: string
  survey_no: string
  village?: string
  taluk?: string
  area_hectares?: number
  owner_name?: string
  patta_number?: string
  khata_number?: string
  [key: string]: any
}

export interface FMBData {
  fmb_id: string
  geometry: GeoJSON
  area_hectares?: number
  [key: string]: any
}

export interface VerificationResult {
  isValid: boolean
  score: number
  errors: string[]
  warnings: string[]
  canonicalKey: string
}

export interface VerificationConfig {
  areaTolerance: number // Percentage tolerance for area comparison
  geometryTolerance: number // Distance tolerance for geometry comparison (in meters)
  requiredFields: string[]
  optionalFields: string[]
}

const DEFAULT_CONFIG: VerificationConfig = {
  areaTolerance: 5, // 5% tolerance
  geometryTolerance: 10, // 10 meters
  requiredFields: ['state', 'district', 'survey_no', 'fmb_id'],
  optionalFields: ['village', 'taluk', 'area_hectares', 'owner_name']
}

/**
 * Generate canonical key for a parcel
 * Format: sha256(state|district|survey_no|fmb_id)
 */
export function generateCanonicalKey(
  state: string,
  district: string,
  survey_no: string,
  fmb_id: string
): string {
  const keyString = `${state}|${district}|${survey_no}|${fmb_id}`
  return CryptoJS.SHA256(keyString).toString()
}

/**
 * Normalize text for comparison (remove extra spaces, convert to lowercase)
 */
function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Calculate area of a polygon in hectares
 */
function calculatePolygonArea(geometry: GeoJSON): number {
  if (geometry.type !== 'Polygon') {
    throw new Error('Only Polygon geometries are supported')
  }

  const coords = geometry.coordinates[0]
  let area = 0

  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i]
    const [x2, y2] = coords[i + 1]
    area += (x1 * y2 - x2 * y1)
  }

  // Convert to hectares (assuming coordinates are in degrees)
  // This is a rough approximation - for production, use a proper geodesic calculation
  return Math.abs(area) / 2 / 10000
}

/**
 * Calculate distance between two points in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Verify that Bhoomi data matches FMB data
 */
export function verifyParcelData(
  bhoomiData: BhoomiData,
  fmbData: FMBData,
  config: VerificationConfig = DEFAULT_CONFIG
): VerificationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let score = 100

  // Generate canonical key
  const canonicalKey = generateCanonicalKey(
    bhoomiData.state,
    bhoomiData.district,
    bhoomiData.survey_no,
    fmbData.fmb_id
  )

  // Check required fields
  for (const field of config.requiredFields) {
    if (field === 'fmb_id') {
      if (!fmbData.fmb_id) {
        errors.push(`Missing required field: ${field}`)
        score -= 20
      }
    } else if (!bhoomiData[field]) {
      errors.push(`Missing required field: ${field}`)
      score -= 20
    }
  }

  // Verify state and district match (case-insensitive)
  if (bhoomiData.state && fmbData.state) {
    if (normalizeText(bhoomiData.state) !== normalizeText(fmbData.state)) {
      errors.push('State mismatch between Bhoomi and FMB data')
      score -= 30
    }
  }

  if (bhoomiData.district && fmbData.district) {
    if (normalizeText(bhoomiData.district) !== normalizeText(fmbData.district)) {
      errors.push('District mismatch between Bhoomi and FMB data')
      score -= 30
    }
  }

  // Verify area if both are provided
  if (bhoomiData.area_hectares && fmbData.area_hectares) {
    const areaDiff = Math.abs(bhoomiData.area_hectares - fmbData.area_hectares)
    const areaPercentDiff = (areaDiff / bhoomiData.area_hectares) * 100

    if (areaPercentDiff > config.areaTolerance) {
      errors.push(
        `Area mismatch: Bhoomi (${bhoomiData.area_hectares} ha) vs FMB (${fmbData.area_hectares} ha) - ${areaPercentDiff.toFixed(2)}% difference`
      )
      score -= 25
    } else if (areaPercentDiff > config.areaTolerance / 2) {
      warnings.push(
        `Area difference: ${areaPercentDiff.toFixed(2)}% (within tolerance but worth reviewing)`
      )
      score -= 5
    }
  }

  // Calculate area from geometry if not provided
  if (!fmbData.area_hectares && fmbData.geometry) {
    try {
      const calculatedArea = calculatePolygonArea(fmbData.geometry)
      fmbData.area_hectares = calculatedArea
      
      if (bhoomiData.area_hectares) {
        const areaDiff = Math.abs(bhoomiData.area_hectares - calculatedArea)
        const areaPercentDiff = (areaDiff / bhoomiData.area_hectares) * 100

        if (areaPercentDiff > config.areaTolerance) {
          errors.push(
            `Calculated area mismatch: Bhoomi (${bhoomiData.area_hectares} ha) vs calculated (${calculatedArea.toFixed(4)} ha) - ${areaPercentDiff.toFixed(2)}% difference`
          )
          score -= 25
        }
      }
    } catch (error) {
      errors.push(`Failed to calculate area from geometry: ${error}`)
      score -= 15
    }
  }

  // Verify geometry is valid
  if (!fmbData.geometry) {
    errors.push('Missing geometry data in FMB')
    score -= 30
  } else if (fmbData.geometry.type !== 'Polygon') {
    errors.push('Geometry must be a Polygon')
    score -= 30
  } else {
    const coords = fmbData.geometry.coordinates[0]
    if (coords.length < 4) {
      errors.push('Polygon must have at least 4 coordinates')
      score -= 20
    } else if (coords[0][0] !== coords[coords.length - 1][0] || 
               coords[0][1] !== coords[coords.length - 1][1]) {
      errors.push('Polygon must be closed (first and last coordinates must be the same)')
      score -= 20
    }
  }

  // Check for suspicious patterns
  if (bhoomiData.survey_no && bhoomiData.survey_no.length < 3) {
    warnings.push('Survey number seems unusually short')
    score -= 5
  }

  if (bhoomiData.area_hectares && bhoomiData.area_hectares > 1000) {
    warnings.push('Parcel area is unusually large (>1000 hectares)')
    score -= 5
  }

  if (bhoomiData.area_hectares && bhoomiData.area_hectares < 0.001) {
    warnings.push('Parcel area is unusually small (<0.001 hectares)')
    score -= 5
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score)

  return {
    isValid: errors.length === 0 && score >= 70,
    score,
    errors,
    warnings,
    canonicalKey
  }
}

/**
 * Validate Bhoomi JSON structure
 */
export function validateBhoomiData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('Bhoomi data must be a valid JSON object')
    return { isValid: false, errors }
  }

  const requiredFields = ['state', 'district', 'survey_no']
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      errors.push(`Missing or invalid required field: ${field}`)
    }
  }

  if (data.area_hectares && (typeof data.area_hectares !== 'number' || data.area_hectares < 0)) {
    errors.push('area_hectares must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate FMB GeoJSON structure
 */
export function validateFMBData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('FMB data must be a valid JSON object')
    return { isValid: false, errors }
  }

  if (!data.fmb_id || typeof data.fmb_id !== 'string' || data.fmb_id.trim() === '') {
    errors.push('Missing or invalid fmb_id')
  }

  if (!data.geometry) {
    errors.push('Missing geometry data')
  } else if (data.geometry.type !== 'Polygon') {
    errors.push('Geometry must be a Polygon')
  } else if (!data.geometry.coordinates || !Array.isArray(data.geometry.coordinates)) {
    errors.push('Invalid geometry coordinates')
  } else {
    const coords = data.geometry.coordinates[0]
    if (!Array.isArray(coords) || coords.length < 4) {
      errors.push('Polygon must have at least 4 coordinates')
    }
  }

  if (data.area_hectares && (typeof data.area_hectares !== 'number' || data.area_hectares < 0)) {
    errors.push('area_hectares must be a positive number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
