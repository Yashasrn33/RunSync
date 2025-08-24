import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-light flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto">
        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-running text-white text-2xl"></i>
            </div>
            
            <h1 className="text-3xl font-bold text-secondary mb-4">RunMate</h1>
            <p className="text-neutral mb-8 leading-relaxed">
              Find your perfect running partner based on pace, location, and schedule. 
              Connect with runners who share your goals and availability.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-map-marker-alt text-accent text-sm"></i>
                </div>
                <span className="text-secondary">Match by location and pace</span>
              </div>
              
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar-alt text-accent text-sm"></i>
                </div>
                <span className="text-secondary">Sync your running schedule</span>
              </div>
              
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-accent text-sm"></i>
                </div>
                <span className="text-secondary">Connect with like-minded runners</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6 text-lg rounded-xl"
              onClick={() => window.location.reload()}
              data-testid="button-login"
            >
              Get Started
            </Button>
            
            <p className="text-xs text-neutral mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
