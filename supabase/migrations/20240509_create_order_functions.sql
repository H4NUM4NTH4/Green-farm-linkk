
-- Function to create an order without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.create_order(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_shipping_address JSONB,
  p_payment_method TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  INSERT INTO public.orders (
    user_id,
    total_amount,
    shipping_address,
    payment_method,
    status
  ) VALUES (
    p_user_id,
    p_total_amount,
    p_shipping_address,
    p_payment_method,
    'pending'
  )
  RETURNING id INTO v_order_id;
  
  RETURN v_order_id;
END;
$$;

-- Function to add order items without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.add_order_item(
  p_order_id UUID,
  p_product_id UUID,
  p_quantity INTEGER,
  p_price NUMERIC,
  p_farmer_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.order_items (
    order_id,
    product_id,
    quantity,
    price,
    farmer_id
  ) VALUES (
    p_order_id,
    p_product_id,
    p_quantity,
    p_price,
    p_farmer_id
  );
END;
$$;
