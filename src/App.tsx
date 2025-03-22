import { useState } from "react"
import AuthPage from "./pages/AuthPage"
import MedScanApp from "./pages/MedScanApp"
import { Toaster } from "@/components/ui/sonner"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authTimestamp, setAuthTimestamp] = useState<number | null>(null)

  // Check if session has expired (30 minutes = 1800000ms)
  const checkSessionExpiry = () => {
    if (authTimestamp && Date.now() - authTimestamp > 1800000) {
      setIsAuthenticated(false)
      setAuthTimestamp(null)
      return false
    }
    return true
  }

  const handleAuthenticate = () => {
    setIsAuthenticated(true)
    setAuthTimestamp(Date.now())
  }

  return (
    <>
      <Toaster />
      <div className="flex flex-col items-center justify-center min-h-svh">
        {isAuthenticated && checkSessionExpiry() ? (
          <MedScanApp />
        ) : (
          <AuthPage onAuthenticate={handleAuthenticate} />
        )}
      </div>
    </>
  )
}

export default App
