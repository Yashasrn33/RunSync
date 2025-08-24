import { useState } from "react";
import Profile from "./Profile";
import Matches from "./Matches";
import MyRuns from "./MyRuns";
import Discover from "./Discover";
import { Button } from "@/components/ui/button";

type TabType = "profile" | "matches" | "myruns" | "discover";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      // Reload to trigger auth check and return to login
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      // Still reload to clear state
      window.location.reload();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg relative overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-running text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-secondary">RunMate</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-neutral hover:text-secondary"
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </header>



      {/* Tab Content */}
      <div className="pb-20">
        {activeTab === "profile" && <Profile />}
        {activeTab === "matches" && <Matches />}
        {activeTab === "myruns" && <MyRuns />}
        {activeTab === "discover" && <Discover />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 py-2 flex flex-col items-center space-y-1 transition-colors ${
              activeTab === "profile" ? "text-primary" : "text-neutral hover:text-primary"
            }`}
            onClick={() => setActiveTab("profile")}
            data-testid="nav-profile"
          >
            <i className="fas fa-user text-sm"></i>
            <span className="text-xs font-medium">Profile</span>
          </button>
          <button
            className={`flex-1 py-2 flex flex-col items-center space-y-1 transition-colors ${
              activeTab === "matches" ? "text-primary" : "text-neutral hover:text-primary"
            }`}
            onClick={() => setActiveTab("matches")}
            data-testid="nav-matches"
          >
            <i className="fas fa-running text-sm"></i>
            <span className="text-xs font-medium">Matches</span>
          </button>
          <button
            className={`flex-1 py-2 flex flex-col items-center space-y-1 transition-colors ${
              activeTab === "myruns" ? "text-primary" : "text-neutral hover:text-primary"
            }`}
            onClick={() => setActiveTab("myruns")}
            data-testid="nav-myruns"
          >
            <i className="fas fa-list text-sm"></i>
            <span className="text-xs font-medium">My Runs</span>
          </button>
          <button
            className={`flex-1 py-2 flex flex-col items-center space-y-1 transition-colors ${
              activeTab === "discover" ? "text-primary" : "text-neutral hover:text-primary"
            }`}
            onClick={() => setActiveTab("discover")}
            data-testid="nav-discover"
          >
            <i className="fas fa-search text-sm"></i>
            <span className="text-xs font-medium">Runs</span>
          </button>
        </div>
      </div>
    </div>
  );
}
