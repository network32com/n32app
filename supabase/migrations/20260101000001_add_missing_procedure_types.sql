-- Add missing values to procedure_type enum
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'rct';
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'restorations';
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'cosmetics';
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'prosthesis';
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'periodontic_surgeries';
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'implants';
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'extractions';
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'surgeries';
ALTER TYPE procedure_type ADD VALUE IF NOT EXISTS 'fmr';
