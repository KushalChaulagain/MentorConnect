"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"

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
  const { toast } = useToast()
  const router = useRouter()

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
      setIsSubmitting(true)
      console.log('Submitting form with values:', values)

      const response = await fetch("/api/mentor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your mentor profile has been created successfully.",
        })
        
        console.log('Profile created successfully, redirecting to dashboard...')

        router.push('/dashboard/mentor')
      } else {
        throw new Error(data.message || "Failed to create profile")
      }
    } catch (error) {
      console.error('Profile creation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0))

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
       <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">{/* You can add a logo or site name here if needed */}</div>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">John Doe</span>
            <Avatar>
              <AvatarImage src="vercel.svg" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>

            </Avatar>
          </div>
        </div>
      </div>
    </nav>
    <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">Become a Mentor</h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Share your expertise and help others grow while earning an average of $1,000 USD per month
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                    step > i
                      ? "bg-primary border-primary text-primary-foreground"
                      : step === i
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground",
                  )}
                >
                  {step > i ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("w-12 h-0.5 mx-2", step > i ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" placeholder="John Doe" {...form.register("fullName")} />
                        {form.formState.errors.fullName && (
                          <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Your Timezone</Label>
                        <Select onValueChange={(value) => form.setValue("timezone", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                            <SelectItem value="est">Eastern Time (EST)</SelectItem>
                            <SelectItem value="gmt">GMT</SelectItem>
                            <SelectItem value="ist">India (IST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Current Role</Label>
                        <Input id="jobTitle" placeholder="Senior Software Engineer" {...form.register("jobTitle")} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" placeholder="Acme Inc." {...form.register("company")} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Input
                          id="yearsOfExperience"
                          type="number"
                          {...form.register("yearsOfExperience", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="expertise">Areas of Expertise</Label>
                        <Select
                          onValueChange={(value) => {
                            const current = form.getValues("expertise")
                            if (!current.includes(value)) {
                              form.setValue("expertise", [...current, value])
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your expertise" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frontend">Frontend Development</SelectItem>
                            <SelectItem value="backend">Backend Development</SelectItem>
                            <SelectItem value="mobile">Mobile Development</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                            <SelectItem value="ai">AI/ML</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch("expertise").map((item) => (
                            <div
                              key={item}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about your experience and what you can offer as a mentor..."
                          className="min-h-[100px]"
                          {...form.register("bio")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                        <Input
                          id="linkedinUrl"
                          placeholder="https://www.linkedin.com/in/john-doe/"
                          {...form.register("linkedinUrl")}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0}>
                  Previous
                </Button>

                {step === steps.length - 1 ? (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Profile
                  </Button>
                ) : (
                  <Button type="button" onClick={nextStep}>
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

