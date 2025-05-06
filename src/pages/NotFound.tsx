
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if this is a post-payment redirect
  const isStripeRedirect = location.pathname.startsWith('/order-confirmation') && !location.pathname.includes('/order-confirmation/');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {isStripeRedirect ? (
          <>
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Payment Redirect Issue</h1>
            <p className="text-gray-600 mb-6">
              Your payment may have been processed, but we encountered an issue with the redirect.
              Please check your orders section to see if your order was completed.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                to="/marketplace" 
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 inline-flex items-center justify-center"
              >
                Continue Shopping
              </Link>
              <Link
                to="/"
                className="text-gray-600 flex items-center justify-center gap-2 hover:text-gray-800"
              >
                <ArrowLeft size={16} />
                Return to Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
            <Link 
              to="/" 
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Return to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NotFound;
