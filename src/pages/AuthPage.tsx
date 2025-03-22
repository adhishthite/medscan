import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

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
      onAuthenticate()
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex items-center justify-center w-full max-w-md px-4">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">MedScan</CardTitle>
          <CardDescription className="text-center">
            Enter your authentication key to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your authentication key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="text-center"
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Authenticate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default AuthPage 