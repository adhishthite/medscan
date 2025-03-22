import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { KeyRound, Loader2, ShieldCheck } from "lucide-react"

interface AuthPageProps {
  onAuthenticate: () => void
}

const AuthPage = ({ onAuthenticate }: AuthPageProps) => {
  const [key, setKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!key.trim()) {
      toast.error("Please enter your authentication key")
      return
    }
    
    setIsLoading(true)
    
    // Simulate API call for key verification
    setTimeout(() => {
      // For demo purposes, accept any key
      // In a real app, you would validate this with an actual API call
      
      // Set session timeout for 30 minutes
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      // Store authentication timestamp
      localStorage.setItem('authTimestamp', Date.now().toString());
      
      // Set timeout to logout after 30 minutes
      const logoutTimer = setTimeout(() => {
        // Clear auth data and reload page to logout
        localStorage.removeItem('authTimestamp');
        window.location.reload();
        toast.info("Session expired. Please authenticate again.");
      }, sessionTimeout);
      
      // Store timer ID in case we need to clear it
      window.sessionStorage.setItem('logoutTimerId', logoutTimer.toString());
      
      onAuthenticate();
      setIsLoading(false);
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/5 p-4">
      <motion.div 
        className="w-full max-w-7xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-muted/30 shadow-lg rounded-xl">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row">
              {/* Left side with logo and title */}
              <div className="lg:w-1/3 flex flex-col justify-center items-center border-r border-border/50 py-10 px-6 bg-muted/5">
                <div className="flex justify-center mb-4">
                  <motion.div 
                    className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary/90 to-primary/70 shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <KeyRound className="h-9 w-9 text-primary-foreground" />
                  </motion.div>
                </div>
                <h1 className="text-4xl font-bold text-center mb-2">
                  MedScan
                </h1>
                <p className="text-center text-muted-foreground">
                  Enter your authentication key to continue
                </p>
              </div>
              
              {/* Right side with input and button */}
              <div className="lg:w-2/3 p-10">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Authentication Key</label>
                    <Input
                      type="password"
                      placeholder="Enter your authentication key"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      className="shadow-sm font-mono text-lg py-6"
                      autoFocus
                    />
                  </div>
                  
                  <motion.div 
                    className="w-full"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-white font-medium py-6 text-lg" 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        "Authenticate"
                      )}
                    </Button>
                  </motion.div>
                  
                  <div className="text-xs text-center text-muted-foreground flex items-center justify-center space-x-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Secured with end-to-end encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default AuthPage