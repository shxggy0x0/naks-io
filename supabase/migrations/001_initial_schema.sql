-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'reviewer')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  kyc_provider TEXT,
  kyc_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parcels table
CREATE TABLE parcels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  canonical_key TEXT UNIQUE NOT NULL, -- sha256(state|district|survey_no|fmb_id)
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  survey_no TEXT NOT NULL,
  fmb_id TEXT NOT NULL,
  village TEXT,
  taluk TEXT,
  area_hectares DECIMAL(10,4),
  geometry GEOMETRY(POLYGON, 4326) NOT NULL,
  bhoomi_data JSONB,
  fmb_data JSONB,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'under_review')),
  verification_score INTEGER DEFAULT 0 CHECK (verification_score >= 0 AND verification_score <= 100),
  verification_notes TEXT,
  rejection_reason TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parcel_metadata table
CREATE TABLE parcel_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE NOT NULL,
  ipfs_cid TEXT,
  metadata_hash TEXT,
  bhoomi_document_url TEXT,
  fmb_document_url TEXT,
  other_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tokens table
CREATE TABLE tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE NOT NULL,
  token_id TEXT UNIQUE NOT NULL,
  contract_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL DEFAULT 137, -- Polygon mainnet
  mint_tx_hash TEXT,
  mint_block_number BIGINT,
  transfer_restricted BOOLEAN DEFAULT true,
  kyc_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create owners table
CREATE TABLE owners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token_id TEXT REFERENCES tokens(token_id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ownership_percentage DECIMAL(5,2) DEFAULT 100.00,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transfers table
CREATE TABLE transfers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  token_id TEXT REFERENCES tokens(token_id) ON DELETE CASCADE NOT NULL,
  from_address TEXT,
  to_address TEXT NOT NULL,
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  tx_hash TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('mint', 'transfer', 'burn')),
  kyc_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_parcels_canonical_key ON parcels(canonical_key);
CREATE INDEX idx_parcels_owner_id ON parcels(owner_id);
CREATE INDEX idx_parcels_verification_status ON parcels(verification_status);
CREATE INDEX idx_parcels_geometry ON parcels USING GIST(geometry);
CREATE INDEX idx_tokens_parcel_id ON tokens(parcel_id);
CREATE INDEX idx_tokens_token_id ON tokens(token_id);
CREATE INDEX idx_owners_token_id ON owners(token_id);
CREATE INDEX idx_owners_owner_id ON owners(owner_id);
CREATE INDEX idx_transfers_token_id ON transfers(token_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parcels_updated_at BEFORE UPDATE ON parcels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parcel_metadata_updated_at BEFORE UPDATE ON parcel_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tokens_updated_at BEFORE UPDATE ON tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_owners_updated_at BEFORE UPDATE ON owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit log trigger function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values)
  VALUES (
    COALESCE(NEW.owner_id, OLD.owner_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Add audit triggers
CREATE TRIGGER audit_parcels AFTER INSERT OR UPDATE OR DELETE ON parcels FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_tokens AFTER INSERT OR UPDATE OR DELETE ON tokens FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_owners AFTER INSERT OR UPDATE OR DELETE ON owners FOR EACH ROW EXECUTE FUNCTION create_audit_log();
