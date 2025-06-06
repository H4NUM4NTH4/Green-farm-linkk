-- Enable Row Level Security on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Farmers can view orders with their products" ON public.orders;
DROP POLICY IF EXISTS "Farmers can update orders with their products" ON public.orders;

-- Create policies for users
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policies for farmers
CREATE POLICY "Farmers can view orders with their products"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    WHERE order_items.order_id = orders.id
    AND order_items.farmer_id = auth.uid()
  )
);

CREATE POLICY "Farmers can update orders with their products"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    WHERE order_items.order_id = orders.id
    AND order_items.farmer_id = auth.uid()
  )
);

-- Grant necessary permissions
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role; 