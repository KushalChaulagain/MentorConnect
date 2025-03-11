"use client";

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
  skills: z.array(z.string()).optional(),
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
      skills: [],
    },
    // Important: This prevents form reset when tab changes
    mode: "onChange"
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
  
  // Memoize fetchProfile to prevent unnecessary refetches
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
        skills: profileData.skills || [],
      });
      
      // Mark as fetched to prevent unnecessary refreshes
      setProfileFetched(true);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [form, profileFetched, loading]);
  
  // Modify the page effect to manage window focus events
  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
    
    // Fetch profile initially
    fetchProfile();
    
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
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Log all state for debugging
      console.log("--- FORM SUBMISSION ---");
      console.log("Form values:", values);
      console.log("Saved form data:", formData);
      console.log("Skills:", skills);
      console.log("Timezone:", values.timezone);
      
      // Get current values from all tabs
      const currentValues = form.getValues();
      console.log("Current form values:", currentValues);
      
      // Save values to localStorage for persistence
      if (values.timezone) {
        localStorage.setItem('profileTimezone', values.timezone);
      }
      if (values.location) {
        localStorage.setItem('profileLocation', values.location);
      }
      
      // Upload image if changed
      let imageUrl = undefined;
      if (avatarPreview && !avatarPreview.startsWith("http")) {
        console.log("Uploading new profile image...");
        try {
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: avatarPreview }),
          });
          
          if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            console.error("Image upload error:", error);
            toast.error(`Failed to upload image: ${error.details || error.error || "Unknown error"}`);
          } else {
            const uploadData = await uploadResponse.json();
            imageUrl = uploadData.imageUrl;
            console.log("Image uploaded successfully:", imageUrl);
          }
        } catch (uploadError) {
          console.error("Image upload exception:", uploadError);
          toast.error("Failed to upload image. Please try again.");
        }
      }
      
      // Create a complete profile update object with all fields
      const completeFormData = {
        name: values.name || formData.name || "",
        title: values.title || formData.title || "",
        bio: values.bio || formData.bio || "",
        location: values.location || formData.location || "",
        company: values.company || formData.company || "",
        website: values.website || formData.website || "",
        githubUrl: values.githubUrl || formData.githubUrl || "",
        linkedinUrl: values.linkedinUrl || formData.linkedinUrl || "",
        timezone: values.timezone || formData.timezone || "",
        yearsOfExperience: values.yearsOfExperience || formData.yearsOfExperience || 0,
        skills: skills.length > 0 ? skills : (formData.skills || []),
        ...(imageUrl && { image: imageUrl }),
      };
      
      console.log("Complete form data being sent:", completeFormData);
      
      // Update profile
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeFormData),
      });
      
      const responseData = await response.json();
      console.log("Update profile response:", responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update profile");
      }
      
      // Success
      toast.success("Profile updated successfully");
      
      // Refresh the profile data
      fetchProfile();
      
      // Redirect to profile page
      router.push("/dashboard/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Modified tab change function to ensure form data is preserved
  const handleTabChange = (value: string) => {
    // Get current form state
    const currentValues = form.getValues();
    
    // Log for debugging
    console.log(`Tab changing from ${activeTab} to ${value}`);
    console.log("Current form values:", currentValues);
    
    // Save specific values to localStorage
    if (currentValues.timezone) {
      localStorage.setItem('profileTimezone', currentValues.timezone);
    }
    if (currentValues.location) {
      localStorage.setItem('profileLocation', currentValues.location);
    }
    
    // Merge with existing form data
    setFormData(prev => {
      const updated = { ...prev, ...currentValues };
      console.log("Updated form data:", updated);
      return updated;
    });
    
    // Update form with merged data 
    setTimeout(() => {
      // This ensures the form is updated after the tab switch
      form.reset(formData);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="general" type="button" onClick={(e) => e.preventDefault()}>General</TabsTrigger>
              <TabsTrigger value="professional" type="button" onClick={(e) => e.preventDefault()}>Professional</TabsTrigger>
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
                  </div>
                  
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-md mb-2 min-h-[80px]">
                        {skills.map((skill, index) => (
                          <div 
                            key={index}
                            className="bg-muted px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </div>
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
                </CardContent>
              </Card>
            </TabsContent>
            
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
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
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