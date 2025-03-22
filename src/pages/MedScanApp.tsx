import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, FileText, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import FileUpload from "@/components/FileUpload"
import ResultsView from "@/components/ResultsView"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { analyzeWithModel, MODELS } from "@/lib/model-service"
import { ModelProvider } from "@/lib/types"

// Define form schema
const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  patientAge: z.string().min(1, "Patient age is required"),
  additionalNotes: z.string().optional(),
  apiKey: z.string().min(1, "API key is required"),
  modelProvider: z.nativeEnum(ModelProvider),
})

type FormData = z.infer<typeof formSchema>

const MedScanApp = () => {
  const [files, setFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<string | null>(null)
  const [modelProvider, setModelProvider] = useState<ModelProvider>(ModelProvider.Gemini)

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      patientAge: "",
      additionalNotes: "",
      apiKey: "",
      modelProvider: ModelProvider.Gemini,
    },
  })

  // Watch for model provider changes
  const selectedModelProvider = form.watch("modelProvider");
  const selectedModel = MODELS.find(model => model.id === selectedModelProvider);

  const handleFileUpload = (acceptedFiles: File[]) => {
    // Limit to 5 files
    const totalFiles = [...files, ...acceptedFiles].slice(0, 5)
    setFiles(totalFiles)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async (data: FormData) => {
    if (files.length === 0) {
      toast.error("Please upload at least one medical document")
      return
    }

    setIsAnalyzing(true)
    setModelProvider(data.modelProvider)
    
    try {
      // Call our model service with the selected provider
      const analysisResult = await analyzeWithModel(
        data.modelProvider,
        {
          patientName: data.patientName,
          patientAge: data.patientAge,
          additionalNotes: data.additionalNotes,
          files,
        }, 
        data.apiKey
      );
      
      setResults(analysisResult);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Error analyzing documents. Please try again.");
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    form.reset()
    setFiles([])
    setResults(null)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="container mx-auto max-w-4xl">
          <motion.h1 
            className="text-3xl font-bold mb-6 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            MedScan Analysis
          </motion.h1>
          
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <ResultsView 
                  results={results} 
                  onNewScan={resetForm} 
                  modelName={MODELS.find(model => model.id === modelProvider)?.name}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                    <CardDescription>
                      Enter patient details and upload medical documents for analysis
                    </CardDescription>
                  </CardHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="patientName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Patient Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter patient name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="patientAge"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Patient Age</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter patient age" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="additionalNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter any additional information here" 
                                  className="min-h-32"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="modelProvider"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>AI Model</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-3"
                                >
                                  {MODELS.map(model => (
                                    <div key={model.id} className="flex items-start space-x-3 space-y-0">
                                      <RadioGroupItem value={model.id} id={model.id} />
                                      <div className="grid gap-1.5 leading-none">
                                        <Label
                                          htmlFor={model.id}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                          {model.name}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          {model.description}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password"
                                  placeholder={selectedModel?.apiKeyPlaceholder || "Enter your API key"} 
                                  {...field} 
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedModel?.apiKeyHelp}
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-4">
                          <div>
                            <FormLabel>Medical Documents</FormLabel>
                            <p className="text-sm text-muted-foreground mb-2">
                              Upload up to 5 medical documents (X-Rays, MRIs, CT Scans, etc.)
                            </p>
                            <FileUpload onFileUpload={handleFileUpload} />
                          </div>
                          
                          <AnimatePresence>
                            {files.length > 0 && (
                              <motion.div 
                                className="space-y-2"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <h4 className="text-sm font-medium">Uploaded Files ({files.length}/5)</h4>
                                <div className="space-y-2">
                                  {files.map((file, index) => (
                                    <motion.div 
                                      key={index} 
                                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 20 }}
                                      transition={{ duration: 0.2, delay: index * 0.05 }}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <FileText size={16} />
                                        <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => removeFile(index)}
                                      >
                                        <X size={16} />
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <motion.div 
                          className="w-full"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button type="submit" disabled={isAnalyzing} className="w-full">
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              "Submit for Analysis"
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer modelProvider={modelProvider} />
    </div>
  )
}

export default MedScanApp 