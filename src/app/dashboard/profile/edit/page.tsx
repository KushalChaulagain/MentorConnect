"use client";

import SkillBadge from "@/components/SkillBadge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Briefcase,
  Building,
  Clock,
  Github,
  Globe,
  Linkedin,
  Loader2,
  MapPin,
  Upload
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Form schema using zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(2, "Title must be at least 2 characters").optional(),
  bio: z.string().min(10, "Bio must be at least 10 characters").optional(),
  location: z.string().min(2, "Location must be at least 2 characters").optional(),
  company: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Please enter a valid GitHub URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  timezone: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0).optional(),
  hourlyRate: z.coerce.number().min(10, "Hourly rate must be at least Rs. 10").optional(),
  skills: z.array(z.string()).optional(),
  // Added for mentees
  learningGoals: z.string().optional(),
  skillLevel: z.string().optional(),
  areasOfInterest: z.string().optional(),
  learningStyle: z.string().optional(),
  careerGoals: z.string().optional(),
  currentChallenges: z.string().optional(),
  education: z.string().optional(),
});

// Define interface for our form values
type FormValues = z.infer<typeof formSchema>;

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [formData, setFormData] = useState<Partial<FormValues>>({});
  const [profileFetched, setProfileFetched] = useState(false);
  const [userRole, setUserRole] = useState<"mentor" | "mentee" | null>(null);
  
  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      location: "",
      company: "",
      website: "",
      githubUrl: "",
      linkedinUrl: "",
      timezone: "",
      yearsOfExperience: 0,
      hourlyRate: 0,
      skills: [],
      // Added for mentees
      learningGoals: "",
      skillLevel: "",
      areasOfInterest: "",
      learningStyle: "",
      careerGoals: "",
      currentChallenges: "",
      education: "",
    },
    // This will ensure validation doesn't block submission - we'll handle errors manually
    mode: "onSubmit"
  });
  
  // Add this effect to store form values in localStorage when they change
  useEffect(() => {
    // When form values change, save them to localStorage
    const saveFormToLocalStorage = () => {
      const values = form.getValues();
      if (values.timezone) {
        localStorage.setItem('profileTimezone', values.timezone);
      }
      if (values.location) {
        localStorage.setItem('profileLocation', values.location);
      }
    };

    // Debounce the save operation to avoid too many localStorage writes
    const timeoutId = setTimeout(saveFormToLocalStorage, 1000);
    return () => clearTimeout(timeoutId);
  }, [form]);
  
  // Replace the fetchProfile function with the updated version
  const fetchProfile = useCallback(async () => {
    // Skip fetching if we've already loaded the profile
    if (profileFetched && !loading) {
      console.log("Profile already fetched, skipping refetch");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching profile data...");
      
      // Get saved values from localStorage if they exist
      const savedTimezone = localStorage.getItem('profileTimezone') || '';
      const savedLocation = localStorage.getItem('profileLocation') || '';
      console.log("Using saved timezone from localStorage:", savedTimezone);
      console.log("Using saved location from localStorage:", savedLocation);
      
      // Include saved values as query parameters
      const queryParams = new URLSearchParams();
      if (savedTimezone) queryParams.append('savedTimezone', savedTimezone);
      if (savedLocation) queryParams.append('savedLocation', savedLocation);
      
      // Make API request with query parameters
      const url = `/api/profile${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      console.log("Fetching from URL:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      
      const profileData = await response.json();
      console.log("Fetched profile data:", profileData);
      
      // Store the full profile data for reference
      setFormData(profileData);
      
      // Set avatar preview
      setAvatarPreview(profileData.image || null);
      
      // Set skills
      setSkills(profileData.skills || []);
      
      // Set form values, using fetched data, with preference to localStorage values
      form.reset({
        name: profileData.name || "",
        title: profileData.title || "",
        bio: profileData.bio || "",
        location: savedLocation || profileData.location || "",
        company: profileData.company || "",
        website: profileData.website || "",
        githubUrl: profileData.githubUrl || "",
        linkedinUrl: profileData.linkedinUrl || "",
        timezone: savedTimezone || profileData.timezone || "",
        yearsOfExperience: profileData.yearsOfExperience || 0,
        hourlyRate: profileData.hourlyRate || 0,
        skills: profileData.skills || [],
        // Include mentee-specific fields
        learningGoals: profileData.learningGoals || "",
        skillLevel: profileData.skillLevel || "",
        areasOfInterest: profileData.areasOfInterest || "",
        learningStyle: profileData.learningStyle || "",
        careerGoals: profileData.careerGoals || "",
        currentChallenges: profileData.currentChallenges || "",
        education: profileData.education || "",
      });
      
      // Log form values after reset for debugging
      console.log("Form values after reset:", form.getValues());
      
      // Mark as fetched to prevent unnecessary refreshes
      setProfileFetched(true);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [form, profileFetched, loading]);
  
  // Add after fetchProfile function
  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user-role');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      } else {
        // Default to mentee if role can't be determined
        setUserRole("mentee");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      // Default to mentee if there's an error
      setUserRole("mentee");
    }
  };
  
  // Replace the useEffect that fetches profile data
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    // First fetch the user role
    const fetchAndSetup = async () => {
      await fetchUserRole();
      await fetchProfile();
    };
    
    fetchAndSetup();
    
    // Disable auto-refresh on focus
    const disableAutoRefresh = () => {
      // This helps prevent Next.js from auto-refreshing when the tab gets focus
      window.addEventListener('focus', (e) => e.stopPropagation(), true);
    };
    
    disableAutoRefresh();
    
    return () => {
      // Clean up by removing event listener
      window.removeEventListener('focus', (e) => e.stopPropagation(), true);
    };
  }, [session, status, router, fetchProfile]);
  
  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast.error("Image size should be less than 1MB");
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Handle adding a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      form.setValue('skills', updatedSkills);
      setNewSkill("");
    }
  };
  
  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    form.setValue('skills', updatedSkills);
  };
  
  // Clean up handleManualSubmit to only include essential console logs
  const handleManualSubmit = async () => {
    // Get current form values
    const values = form.getValues();
    console.log("Form submission started with values:", values);
    
    try {
      setIsSubmitting(true);
      
      // Create complete form data object with explicit defaults for all fields
      const completeFormData = {
        name: values.name || "",
        title: values.title || "",
        bio: values.bio || "",
        location: values.location || "",
        company: values.company || "",
        website: values.website || "",
        githubUrl: values.githubUrl || "",
        linkedinUrl: values.linkedinUrl || "",
        timezone: values.timezone || "",
        yearsOfExperience: values.yearsOfExperience || 0,
        hourlyRate: values.hourlyRate || 0,
        skills: skills.length > 0 ? skills : [],
        ...(avatarPreview && !avatarPreview.startsWith("http") && { image: avatarPreview }),
        // Always include mentee fields regardless of role with explicit defaults
        learningGoals: values.learningGoals || "",
        skillLevel: values.skillLevel || "",
        areasOfInterest: values.areasOfInterest || "",
        learningStyle: values.learningStyle || "",
        careerGoals: values.careerGoals || "",
        currentChallenges: values.currentChallenges || "",
        education: values.education || "",
      };
      
      console.log("Sending data to API:", completeFormData);
      
      // Direct API call bypassing form validation
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(completeFormData),
        });
        
        console.log("API response status:", response.status);
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
          console.log("API response data received");
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError);
          console.log("Raw response:", responseText);
        }
        
        if (!response.ok) {
          throw new Error(responseData?.error || `Failed with status: ${response.status}`);
        }
        
        // Success
        toast.success("Profile updated successfully");
        
        // Redirect to profile page after a small delay
        setTimeout(() => {
          router.push("/dashboard/profile");
        }, 500);
      } catch (apiError) {
        console.error("API request error:", apiError);
        toast.error(`Failed to update profile: ${apiError instanceof Error ? apiError.message : "API error"}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(`Form error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fix the handleTabChange function to properly preserve form data
  const handleTabChange = (value: string) => {
    // Get current form state
    const currentValues = form.getValues();
    console.log(`Tab changing from ${activeTab} to ${value}`);
    
    // Save specific values to localStorage
    if (currentValues.timezone) {
      localStorage.setItem('profileTimezone', currentValues.timezone);
    }
    if (currentValues.location) {
      localStorage.setItem('profileLocation', currentValues.location);
    }
    
    // Create a merged object directly instead of relying on state update
    const updatedFormData = { ...formData, ...currentValues };
    
    // Update the formData state
    setFormData(updatedFormData);
    
    // Update form with merged data 
    // Use the merged data directly instead of relying on the state update
    setTimeout(() => {
      form.reset(updatedFormData);
      console.log("Form reset with merged data after tab change");
    }, 50);
    
    // Change tab
    setActiveTab(value);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/profile")}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>
      
      <Form {...form}>
        <form className="space-y-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="general" type="button" onClick={(e) => e.preventDefault()}>General</TabsTrigger>
              {userRole === "mentor" ? (
                <TabsTrigger value="professional" type="button" onClick={(e) => e.preventDefault()}>Professional</TabsTrigger>
              ) : (
                <TabsTrigger value="learning" type="button" onClick={(e) => e.preventDefault()}>Learning</TabsTrigger>
              )}
              <TabsTrigger value="social" type="button" onClick={(e) => e.preventDefault()}>Social Links</TabsTrigger>
            </TabsList>
            
            {/* General Info Tab */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your basic personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-24 w-24 border-2 border-muted">
                        <AvatarImage src={avatarPreview || undefined} alt={form.getValues("name")} />
                        <AvatarFallback className="text-2xl">
                          {form.getValues("name").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center gap-2">
                        <label
                          htmlFor="avatar-upload"
                          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-md cursor-pointer"
                        >
                          <Upload size={14} />
                          Change Picture
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. 1MB max.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-1 grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Professional Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Software Engineer" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your title will be displayed on your profile
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself" 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Write a short introduction about yourself
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                              <div className="px-3 text-muted-foreground">
                                <MapPin size={16} />
                              </div>
                              <Input 
                                placeholder="City, Country" 
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <FormControl>
                            <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                              <div className="px-3 text-muted-foreground">
                                <Clock size={16} />
                              </div>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  console.log("Timezone selected:", value); // Debug logging
                                }} 
                                value={field.value || ""}
                              >
                                <SelectTrigger className="border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 pl-0">
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Asia/Kathmandu">Asia/Kathmandu (UTC+5:45)</SelectItem>
                                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</SelectItem>
                                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                                  <SelectItem value="America/New_York">America/New York (UTC-5)</SelectItem>
                                  <SelectItem value="America/Los_Angeles">America/Los Angeles (UTC-8)</SelectItem>
                                  <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                                  <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Your timezone will be used for scheduling sessions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Professional Tab */}
            {userRole === "mentor" && (
              <TabsContent value="professional">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Details</CardTitle>
                    <CardDescription>Update your professional information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company/Organization</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                                <div className="px-3 text-muted-foreground">
                                  <Building size={16} />
                                </div>
                                <Input 
                                  placeholder="Your company or organization" 
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                                <div className="px-3 text-muted-foreground">
                                  <Briefcase size={16} />
                                </div>
                                <Input 
                                  type="number"
                                  min={0}
                                  placeholder="Years of experience" 
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate (NPR)</FormLabel>
                            <FormControl>
                              <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                                <div className="px-3 text-muted-foreground">
                                  Rs.
                                </div>
                                <Input 
                                  type="number"
                                  min={10}
                                  placeholder="Your hourly rate in NPR" 
                                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Minimum hourly rate is Rs. 10 (required for verified mentor status)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md mb-2 min-h-[80px]">
                          {skills.map((skill, index) => (
                            <SkillBadge
                              key={index}
                              skill={skill}
                              onRemove={() => handleRemoveSkill(skill)}
                            />
                          ))}
                          {skills.length === 0 && (
                            <p className="text-sm text-muted-foreground p-2">
                              No skills added yet
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill (e.g. React, Python)"
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleAddSkill}
                          >
                            Add
                          </Button>
                        </div>
                        <FormDescription>
                          Add skills that showcase your expertise
                        </FormDescription>
                      </FormItem>
                    </div>
                    
                    {/* Add validation message for skills */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg flex items-start space-x-2">
                      <div className="text-amber-500 dark:text-amber-400 mt-0.5">ℹ️</div>
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">At least 3 skills required</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Add a minimum of 3 skills to achieve verified mentor status. You currently have {skills.length} skill{skills.length !== 1 ? 's' : ''}.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {/* Learning Tab */}
            {userRole === "mentee" && (
              <TabsContent value="learning">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Information</CardTitle>
                    <CardDescription>Update your learning preferences and goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="skillLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Skill Level</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your skill level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Your current programming skill level
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="learningStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Learning Style</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your learning style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="visual">Visual Learner</SelectItem>
                                <SelectItem value="practical">Project-Based</SelectItem>
                                <SelectItem value="theoretical">Theoretical</SelectItem>
                                <SelectItem value="pair">Pair Programming</SelectItem>
                                <SelectItem value="self-guided">Self-Guided</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How you prefer to learn new concepts
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="areasOfInterest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of Interest</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your main area of interest" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="frontend">Frontend Development</SelectItem>
                              <SelectItem value="backend">Backend Development</SelectItem>
                              <SelectItem value="fullstack">Full-Stack Development</SelectItem>
                              <SelectItem value="mobile">Mobile Development</SelectItem>
                              <SelectItem value="devops">DevOps & Cloud</SelectItem>
                              <SelectItem value="data">Data Science & ML</SelectItem>
                              <SelectItem value="gamedev">Game Development</SelectItem>
                              <SelectItem value="blockchain">Blockchain & Web3</SelectItem>
                              <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                              <SelectItem value="ui_ux">UI/UX Design</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your primary area of interest in tech
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="learningGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning Goals</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your primary learning goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="career_change">Career Change into Tech</SelectItem>
                              <SelectItem value="skill_improvement">Improve Current Skills</SelectItem>
                              <SelectItem value="new_tech">Learn New Technologies</SelectItem>
                              <SelectItem value="project_help">Complete Specific Project</SelectItem>
                              <SelectItem value="interview_prep">Interview Preparation</SelectItem>
                              <SelectItem value="entrepreneurship">Launch Tech Business</SelectItem>
                              <SelectItem value="certification">Prepare for Certification</SelectItem>
                              <SelectItem value="promotion">Prepare for Promotion</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your primary goal for seeking mentorship
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="careerGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Career Goals</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your career goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="junior_developer">Become Junior Developer</SelectItem>
                              <SelectItem value="mid_level">Reach Mid-Level Developer</SelectItem>
                              <SelectItem value="senior_developer">Become Senior Developer</SelectItem>
                              <SelectItem value="tech_lead">Become Tech Lead</SelectItem>
                              <SelectItem value="engineering_manager">Engineering Management</SelectItem>
                              <SelectItem value="startup_founder">Start My Own Company</SelectItem>
                              <SelectItem value="freelancer">Become Freelancer</SelectItem>
                              <SelectItem value="specialized_role">Specialize in Niche Area</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Where you want your career to go in the future
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentChallenges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Challenges</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your biggest challenge" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technical_skills">Technical Skills Gap</SelectItem>
                              <SelectItem value="project_structure">Project Organization</SelectItem>
                              <SelectItem value="code_quality">Improving Code Quality</SelectItem>
                              <SelectItem value="debugging">Debugging Complex Issues</SelectItem>
                              <SelectItem value="career_advancement">Career Advancement</SelectItem>
                              <SelectItem value="job_search">Finding a Job/Internship</SelectItem>
                              <SelectItem value="interview_preparation">Technical Interviews</SelectItem>
                              <SelectItem value="work_life_balance">Work-Life Balance</SelectItem>
                              <SelectItem value="imposter_syndrome">Imposter Syndrome</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The biggest challenge you're currently facing
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Educational Background</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your educational background" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="self_taught">Self-Taught</SelectItem>
                              <SelectItem value="bootcamp">Coding Bootcamp</SelectItem>
                              <SelectItem value="cs_degree">Computer Science Degree</SelectItem>
                              <SelectItem value="engineering_degree">Engineering Degree</SelectItem>
                              <SelectItem value="other_degree">Non-Tech Degree</SelectItem>
                              <SelectItem value="online_courses">Online Courses</SelectItem>
                              <SelectItem value="tech_job">Learning on the Job</SelectItem>
                              <SelectItem value="high_school">High School</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your educational background or learning path
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            {/* Social Links Tab */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Connect your social profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Website</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                            <div className="px-3 text-muted-foreground">
                              <Globe size={16} />
                            </div>
                            <Input 
                              placeholder="https://yourwebsite.com" 
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your personal website or portfolio
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Profile</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                            <div className="px-3 text-muted-foreground">
                              <Github size={16} />
                            </div>
                            <Input 
                              placeholder="https://github.com/yourusername" 
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                            <div className="px-3 text-muted-foreground">
                              <Linkedin size={16} />
                            </div>
                            <Input 
                              placeholder="https://linkedin.com/in/yourusername" 
                              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/profile")}
            >
              Cancel
            </Button>
            
            <Button 
              type="button" 
              disabled={isSubmitting}
              className="min-w-[120px]"
              onClick={(e) => {
                e.preventDefault();
                console.log("Save Changes button clicked directly");
                handleManualSubmit();
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 