
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';
import { Order } from '@/types/product';
import { formatDate } from '@/lib/utils';

interface ShippingDetailsModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ShippingDetailsModal: React.FC<ShippingDetailsModalProps> = ({ order, open, onOpenChange }) => {
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert("Please allow popups for this website to print shipping details.");
      return;
    }
    
    // Generate HTML content for the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Details - Order #${order.id.substring(0, 8)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 10px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section h2 {
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 150px 1fr;
              gap: 8px;
            }
            .info-label {
              font-weight: bold;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Shipping Details</h1>
              <p>Order #${order.id.substring(0, 8)} - ${formatDate(order.created_at)}</p>
            </div>
            
            <div class="section">
              <h2>Shipping Address</h2>
              <div class="info-grid">
                <span class="info-label">Name:</span>
                <span>${order.shipping_address.fullName}</span>
                
                <span class="info-label">Address:</span>
                <span>${order.shipping_address.address}</span>
                
                <span class="info-label">City:</span>
                <span>${order.shipping_address.city}</span>
                
                <span class="info-label">State:</span>
                <span>${order.shipping_address.state}</span>
                
                <span class="info-label">ZIP Code:</span>
                <span>${order.shipping_address.zipCode}</span>
                
                <span class="info-label">Country:</span>
                <span>${order.shipping_address.country}</span>
                
                <span class="info-label">Phone:</span>
                <span>${order.shipping_address.phone}</span>
              </div>
            </div>
            
            <div class="section">
              <h2>Order Details</h2>
              <div class="info-grid">
                <span class="info-label">Order ID:</span>
                <span>${order.id}</span>
                
                <span class="info-label">Order Date:</span>
                <span>${formatDate(order.created_at)}</span>
                
                <span class="info-label">Payment Method:</span>
                <span>${order.payment_method}</span>
              </div>
            </div>
            
            <div class="section">
              <h2>Items</h2>
              <table border="1" cellpadding="5" cellspacing="0" width="100%">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items?.map(item => `
                    <tr>
                      <td>${item.product?.name || 'Product #' + item.product_id.substring(0, 8)}</td>
                      <td>${item.quantity}</td>
                      <td>$${item.price.toFixed(2)}</td>
                      <td>$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('') || 'No items found'}
                </tbody>
              </table>
            </div>
            
            <div class="section">
              <h2>Delivery Instructions</h2>
              <div class="info-grid">
                <span class="info-label">Status:</span>
                <span>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </div>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 30px;">
              <button onclick="window.print()">Print Shipping Label</button>
            </div>
          </div>
          <script>
            // Automatically open print dialog
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Shipping Details</DialogTitle>
          <DialogDescription>
            Order #{order.id.substring(0, 8)} - {formatDate(order.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="bg-muted/50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Shipping Address</h3>
            <div className="text-sm space-y-1">
              <p>{order.shipping_address.fullName}</p>
              <p>{order.shipping_address.address}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
              </p>
              <p>{order.shipping_address.country}</p>
              <p>{order.shipping_address.phone}</p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button variant="default" size="sm" onClick={() => window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(order.shipping_address, null, 2))}`)} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShippingDetailsModal;
