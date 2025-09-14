
import { AlertTriangle, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BillingBlock = () => {
  const handleContactSales = () => {
    // You can customize this with your actual sales contact method
    window.location.href = "mailto:sales@yourcompany.com?subject=Account Payment Issue";
  };

  const handleCallSales = () => {
    // You can customize this with your actual sales phone number
    window.location.href = "tel:+1234567890";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Account Suspended
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Your account access has been temporarily suspended due to an outstanding payment
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                We've detected an overdue payment on your account. To restore full access to your services, please contact our sales team immediately.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-center">
                Contact Our Sales Team
              </h3>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleContactSales}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Sales Team
                </Button>
                
                <Button 
                  onClick={handleCallSales}
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  size="lg"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Sales Team
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                Our sales team is available Monday - Friday, 9 AM - 6 PM EST
              </p>
              <p className="text-sm text-gray-500 mt-1">
                We'll help resolve your payment issue quickly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingBlock;
