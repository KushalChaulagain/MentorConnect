"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronRight, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  yearsOfExperience: z.number().min(1, "Years of experience must be at least 1"),
  expertise: z.array(z.string()).min(1, "Please select at least one area of expertise"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL"),
  timezone: z.string().min(1, "Please select your timezone"),
})

type FormData = z.infer<typeof formSchema>

const steps = [
  {
    id: "personal",
    title: "Personal Info",
  },
  {
    id: "professional",
    title: "Professional Details",
  },
  {
    id: "expertise",
    title: "Expertise",
  },
]

const profileSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  company: z.string().optional(),
  experience: z.string(),
  expertise: z.array(z.string()),
  skills: z.array(z.string()),
  hourlyRate: z.number().min(1, 'Hourly rate must be at least 1'),
  languages: z.array(z.string()),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  website: z.string().url().optional(),
});

export default function MentorProfileSetup() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { data: session, update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      jobTitle: "",
      company: "",
      yearsOfExperience: 0,
      expertise: [],
      bio: "",
      linkedinUrl: "",
      timezone: "",
    },
  })

  const onSubmit = async (values: FormData) => {
    try {
      console.log('1. Starting form submission...');
      // Validate all required fields before submission
      const isValid = await form.trigger();
      if (!isValid) {
        console.log('Form validation failed:', form.formState.errors);
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly.",
          variant: "destructive",
        });
        return;
      }
      console.log('2. Form validation passed');

      setIsSubmitting(true);
      console.log('3. Preparing API request with values:', values);

      const requestBody = {
        title: values.jobTitle,
        company: values.company,
        bio: values.bio,
        expertise: values.expertise,
        languages: ["JavaScript"],
        skills: values.expertise,
        experience: `${values.yearsOfExperience} years`,
        interests: [],
        goals: [],
        hourlyRate: 50,
        github: "",
        linkedin: values.linkedinUrl,
        website: "",
      };
      console.log('4. Request body prepared:', requestBody);

      console.log('5. Sending API request...');
      const response = await fetch("/api/mentor/profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('6. API Response received:', data);

      if (!response.ok) {
        console.log('7. API request failed:', response.status, response.statusText);
        throw new Error(data.message || "Failed to create profile");
      }
      console.log('7. API request successful');

      // Mark the final step as complete
      setStep(steps.length);
      console.log('8. Final step marked as complete');
      
      toast({
        title: "Success",
        description: "Your mentor profile has been created successfully.",
      });
      console.log('9. Success toast shown');
      
      console.log('10. Updating session...');
      try {
        await update({
          ...session,
          user: {
            ...session?.user,
            ...data.user,
          },
        });
        console.log('11. Session updated successfully with data:', data.user);

        // Wait for session to be updated
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('12. Attempting redirection...');
        window.location.href = '/dashboard/mentor?fromOnboarding=true';
      } catch (error) {
        console.error('Session update error:', error);
        toast({
          title: "Error",
          description: "Failed to update session. Please try refreshing the page.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0))

  // Update the progress steps rendering to handle completed state
  const isStepComplete = (stepIndex: number) => {
    if (isSubmitting && stepIndex === steps.length - 1) return true;
    return step > stepIndex;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Update the session with the new image URL
      await update({
        ...session,
        user: {
          ...session?.user,
          image: data.url,
        },
      });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
    <nav className="border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold text-[#6366F1]">MentorConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{session?.user?.name || "Guest"}</span>
            <div className="relative">
              <Avatar 
                className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                <AvatarImage 
                  src={session?.user?.image || "/placeholder.svg"} 
                  alt={session?.user?.name || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gray-800 text-gray-200">
                  {session?.user?.name ? session.user.name.substring(0, 2).toUpperCase() : "U"}
                </AvatarFallback>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                )}
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#6366F1] to-purple-500 bg-clip-text text-transparent">
          Become a Mentor
        </h1>
        <p className="text-gray-400 text-center max-w-xl mx-auto">
          Share your expertise and help others grow while earning an average of NPR 30,000 per month
        </p>
      </div>


      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isStepComplete(i)
                    ? "bg-[#6366F1] border-[#6366F1] text-white"
                    : step === i
                      ? "border-[#6366F1] text-[#6366F1]"
                      : "border-gray-700 text-gray-500",
                )}
              >
                {isStepComplete(i) ? <Check className="w-5 h-5" /> : <span>{i + 1}</span>}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("w-16 h-0.5", isStepComplete(i) ? "bg-[#6366F1]" : "bg-gray-700")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-gray-300">
                        Username
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        {...form.register("fullName")}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                      {form.formState.errors.fullName && (
                        <p className="text-sm text-red-400">{form.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-gray-300">
                        Your Location
                      </Label>
                      <Select onValueChange={(value) => form.setValue("timezone", value)}>
                        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select your location" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="kathmandu" className="text-white hover:bg-gray-700">
                            Kathmandu Valley
                          </SelectItem>
                          <SelectItem value="madhesh" className="text-white hover:bg-gray-700">
                            Madhesh Province
                          </SelectItem>
                          <SelectItem value="bagmati" className="text-white hover:bg-gray-700">
                            Bagmati Province
                          </SelectItem>
                          <SelectItem value="gandaki" className="text-white hover:bg-gray-700">
                            Gandaki Province
                          </SelectItem>
                          <SelectItem value="lumbini" className="text-white hover:bg-gray-700">
                            Lumbini Province
                          </SelectItem>
                          <SelectItem value="karnali" className="text-white hover:bg-gray-700">
                            Karnali Province
                          </SelectItem>
                          <SelectItem value="sudurpaschim" className="text-white hover:bg-gray-700">
                            Sudurpaschim Province
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-gray-300">
                        Current Role
                      </Label>
                      <Input
                        id="jobTitle"
                        placeholder="Senior Software Engineer"
                        {...form.register("jobTitle")}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-300">
                        Company
                      </Label>
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        {...form.register("company")}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience" className="text-gray-300">
                        Years of Experience
                      </Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        {...form.register("yearsOfExperience", { valueAsNumber: true })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="expertise" className="text-gray-300">
                        Areas of Expertise
                      </Label>
                      <Select
                        onValueChange={(value) => {
                          const current = form.getValues("expertise")
                          if (!current.includes(value)) {
                            form.setValue("expertise", [...current, value])
                          }
                        }}
                      >
                        <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select your expertise" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="frontend" className="text-white hover:bg-gray-700">
                            Frontend Development
                          </SelectItem>
                          <SelectItem value="backend" className="text-white hover:bg-gray-700">
                            Backend Development
                          </SelectItem>
                          <SelectItem value="mobile" className="text-white hover:bg-gray-700">
                            Mobile Development
                          </SelectItem>
                          <SelectItem value="devops" className="text-white hover:bg-gray-700">
                            DevOps
                          </SelectItem>
                          <SelectItem value="ai" className="text-white hover:bg-gray-700">
                            AI/ML
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.watch("expertise").map((item) => (
                          <div
                            key={item}
                            className="bg-[#6366F1]/10 text-[#6366F1] px-3 py-1 rounded-md text-sm border border-[#6366F1]/20"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-gray-300">
                        Professional Bio
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about your experience and what you can offer as a mentor..."
                        className="min-h-[100px] bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        {...form.register("bio")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl" className="text-gray-300">
                        LinkedIn Profile
                      </Label>
                      <Input
                        id="linkedinUrl"
                        placeholder="https://www.linkedin.com/in/john-doe/"
                        {...form.register("linkedinUrl")}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 0}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Previous
              </Button>

              {step === steps.length - 1 ? (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Profile
                </Button>
              ) : (
                <Button type="button" onClick={nextStep} className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>  
)
}

