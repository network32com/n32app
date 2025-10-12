-- Add missing fields to clinics table
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS operating_hours TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.clinics.address IS 'Full street address of the clinic';
COMMENT ON COLUMN public.clinics.services IS 'Array of services offered by the clinic';
COMMENT ON COLUMN public.clinics.operating_hours IS 'Operating hours information';
