
-- Check if the column exists before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'order_items'
      AND column_name = 'farmer_id'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN farmer_id UUID;
  END IF;
END
$$;
