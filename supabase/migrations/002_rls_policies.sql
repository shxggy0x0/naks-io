-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Parcels policies
CREATE POLICY "Users can view own parcels" ON parcels
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own parcels" ON parcels
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own parcels" ON parcels
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all parcels" ON parcels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

CREATE POLICY "Admins can update all parcels" ON parcels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

-- Public read access for verified parcels (for public viewer)
CREATE POLICY "Public can view verified parcels" ON parcels
  FOR SELECT USING (verification_status = 'verified');

-- Parcel metadata policies
CREATE POLICY "Users can view own parcel metadata" ON parcel_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parcels 
      WHERE parcels.id = parcel_metadata.parcel_id 
      AND parcels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own parcel metadata" ON parcel_metadata
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM parcels 
      WHERE parcels.id = parcel_metadata.parcel_id 
      AND parcels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all parcel metadata" ON parcel_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

CREATE POLICY "Admins can update all parcel metadata" ON parcel_metadata
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

-- Public read access for verified parcel metadata
CREATE POLICY "Public can view verified parcel metadata" ON parcel_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parcels 
      WHERE parcels.id = parcel_metadata.parcel_id 
      AND parcels.verification_status = 'verified'
    )
  );

-- Tokens policies
CREATE POLICY "Users can view own tokens" ON tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM parcels 
      WHERE parcels.id = tokens.parcel_id 
      AND parcels.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all tokens" ON tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

CREATE POLICY "Admins can insert tokens" ON tokens
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

CREATE POLICY "Admins can update tokens" ON tokens
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

-- Public read access for tokens
CREATE POLICY "Public can view tokens" ON tokens
  FOR SELECT USING (true);

-- Owners policies
CREATE POLICY "Users can view own ownership" ON owners
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all ownership" ON owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

CREATE POLICY "Admins can insert ownership" ON owners
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

CREATE POLICY "Admins can update ownership" ON owners
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

-- Public read access for ownership
CREATE POLICY "Public can view ownership" ON owners
  FOR SELECT USING (true);

-- Transfers policies
CREATE POLICY "Users can view own transfers" ON transfers
  FOR SELECT USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

CREATE POLICY "Admins can view all transfers" ON transfers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

CREATE POLICY "Admins can insert transfers" ON transfers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'reviewer')
    )
  );

-- Public read access for transfers
CREATE POLICY "Public can view transfers" ON transfers
  FOR SELECT USING (true);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
