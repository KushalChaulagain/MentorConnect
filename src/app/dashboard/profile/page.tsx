"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Award,
    Briefcase,
    Building,
    Calendar,
    ChevronRight,
    Clock, Edit,
    ExternalLink, Github,
    Globe,
    Linkedin,
    Mail, MapPin,
    MessageSquare,
    User
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Define the user profile type
interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
  title?: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills?: string[];
  yearsOfExperience?: number;
  completionStatus?: number;
  timezone?: string;
  isMentor?: boolean;
}

// Define the mentor profile type
interface MentorProfile {
  id: string;
  userId: string;
  hourlyRate?: number;
  expertise?: string[];
  totalSessions?: number;
  totalEarnings?: number;
  averageRating?: number;
  totalStudents?: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      console.log("No session available, redirecting to login");
      router.push("/login");
      return;
    }
    
    console.log("Session available, fetching user profile:", session);
    // Fetch user profile with retry mechanism
    const fetchProfileWithRetry = async (retryCount = 0, maxRetries = 3) => {
      try {
        setLoading(true);
        
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
        console.log("Fetching profile from URL:", url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error fetching profile data (${response.status}):`, errorText);
          
          if (retryCount < maxRetries && (response.status === 401 || response.status === 500)) {
            console.log(`Retrying profile fetch (${retryCount + 1}/${maxRetries})...`);
            // Wait a bit before retrying (exponential backoff)
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchProfileWithRetry(retryCount + 1, maxRetries);
          }
          
          toast.error(`Failed to load profile data: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch profile data: ${response.status} ${response.statusText}`);
        }
        
        const profileData = await response.json();
        console.log("Profile data loaded:", profileData);
        
        // Ensure timezone and location are set from localStorage if available
        if (savedTimezone && !profileData.timezone) {
          profileData.timezone = savedTimezone;
        }
        if (savedLocation && !profileData.location) {
          profileData.location = savedLocation;
        }
        
        // Ensure yearsOfExperience is a number
        if (profileData.yearsOfExperience) {
          if (typeof profileData.yearsOfExperience === 'string') {
            profileData.yearsOfExperience = parseInt(profileData.yearsOfExperience);
          } else {
            profileData.yearsOfExperience = Number(profileData.yearsOfExperience);
          }
          // Ensure it's a valid number (not NaN)
          if (isNaN(profileData.yearsOfExperience)) {
            profileData.yearsOfExperience = 0;
          }
          console.log("Years of experience converted to number:", profileData.yearsOfExperience);
        }
        
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile data. Please try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileWithRetry();
  }, [session, status, router]);

  // Add a separate useEffect to fetch mentor profile after user profile is loaded
  useEffect(() => {
    if (profile && profile.isMentor) {
      fetchMentorProfile();
    }
  }, [profile]);

  const fetchMentorProfile = async () => {
    try {
      // Only fetch mentor profile if user is a mentor (we'll know from the user profile)
      if (profile?.isMentor) {
        const response = await fetch("/api/profile/mentor");
        
        if (!response.ok) {
          // It's ok if this fails with 404 - they might not be a mentor
          if (response.status !== 404) {
            const errorText = await response.text();
            console.error(`Error fetching mentor profile (${response.status}):`, errorText);
            toast.error(`Failed to load mentor details: ${response.status} ${response.statusText}`);
          }
          return;
        }
        
        const mentorData = await response.json();
        console.log("Mentor profile data loaded:", mentorData);
        setMentorProfile(mentorData);
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
      // Only show error toast if this is actually a mentor
      if (profile?.isMentor) {
        toast.error("Failed to load mentor details. Please try refreshing the page.");
      }
    }
  };

  const handleEditProfile = () => {
    router.push("/dashboard/profile/edit");
  };

  const handleCreateMentorProfile = () => {
    router.push("/dashboard/mentor/setup");
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
      {/* Profile Header */}
      <div className="mb-8">
        <div className="relative w-full h-48 rounded-lg bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="relative -mt-16 px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-background rounded-full">
              <AvatarImage src={profile?.image} alt={profile?.name} />
              <AvatarFallback className="text-3xl">
                {profile?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pt-5 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile?.name}</h1>
                  <p className="text-muted-foreground">{profile?.title}</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleEditProfile}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </Button>
                  
                  {!mentorProfile && (
                    <Button 
                      onClick={handleCreateMentorProfile}
                      className="flex items-center gap-2"
                    >
                      <User size={16} />
                      Become a Mentor
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                {profile?.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin size={16} className="mr-1" />
                    {profile.location}
                  </div>
                )}
                
                {profile?.timezone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock size={16} className="mr-1" />
                    {profile.timezone.replace('_', ' ')}
                  </div>
                )}
                
                {profile?.company && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building size={16} className="mr-1" />
                    {profile.company}
                  </div>
                )}
                
                {profile?.yearsOfExperience > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase size={16} className="mr-1" />
                    {profile.yearsOfExperience} {profile.yearsOfExperience === 1 ? 'year' : 'years'} experience
                  </div>
                )}
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail size={16} className="mr-1" />
                  {profile?.email}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {profile?.skills?.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Completion Card */}
      {profile?.completionStatus && profile.completionStatus < 100 && (
        <Card className="mb-8 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">Complete your profile</h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Complete your profile to increase your visibility to potential mentees.
                </p>
              </div>
              <Button 
                onClick={handleEditProfile}
                variant="outline" 
                className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                Continue Setup
              </Button>
            </div>
            <div className="mt-4">
              <Progress 
                value={profile.completionStatus} 
                className="h-2 bg-amber-200 dark:bg-amber-900" 
                indicatorClassName="bg-amber-500 dark:bg-amber-500"
              />
              <p className="text-xs mt-1 text-amber-700 dark:text-amber-400">
                {profile.completionStatus}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Profile Completed Badge */}
      {profile?.completionStatus && profile.completionStatus === 100 && (
        <div className="mb-8 flex items-center justify-center">
          <Badge variant="outline" className="py-1.5 px-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
            <Award className="w-4 h-4 mr-2" />
            Profile Complete
          </Badge>
        </div>
      )}
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {profile?.bio || "No bio provided yet."}
                  </p>
                </CardContent>
              </Card>
              
              {/* Mentor Stats Section (if user is a mentor) */}
              {mentorProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Mentor Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">Sessions</h3>
                        <p className="text-2xl font-bold mt-1">{mentorProfile.totalSessions}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">Students</h3>
                        <p className="text-2xl font-bold mt-1">{mentorProfile.totalStudents}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">Rating</h3>
                        <p className="text-2xl font-bold mt-1">{mentorProfile.averageRating}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">Earnings</h3>
                        <p className="text-2xl font-bold mt-1">Rs. {mentorProfile.totalEarnings}</p>
                      </div>
                    </div>
                    
                    {mentorProfile.expertise && mentorProfile.expertise.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Areas of Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {mentorProfile.expertise.map((item, index) => (
                            <Badge key={index} variant="secondary">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Hourly Rate</h3>
                        <p className="text-xl font-bold mt-1">Rs. {mentorProfile.hourlyRate}/hr</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/mentor')}>
                        Mentor Dashboard <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        <span className="text-sm font-medium">Session Scheduled</span>
                        <span className="text-xs text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Intro to React Hooks with John Smith
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-green-500 pl-4 py-2">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-green-500" />
                        <span className="text-sm font-medium">New Review</span>
                        <span className="text-xs text-muted-foreground">5 days ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        "Great mentor, explains concepts very clearly. Would recommend!"
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-purple-500 pl-4 py-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-purple-500" />
                        <span className="text-sm font-medium">New Message</span>
                        <span className="text-xs text-muted-foreground">1 week ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sarah has sent you a new message
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact & Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Contact & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.website && (
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors"
                    >
                      <Globe size={16} />
                      <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink size={14} className="ml-auto opacity-70" />
                    </a>
                  )}
                  
                  {profile?.githubUrl && (
                    <a 
                      href={profile.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors"
                    >
                      <Github size={16} />
                      <span>{profile.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>
                      <ExternalLink size={14} className="ml-auto opacity-70" />
                    </a>
                  )}
                  
                  {profile?.linkedinUrl && (
                    <a 
                      href={profile.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors"
                    >
                      <Linkedin size={16} />
                      <span>LinkedIn Profile</span>
                      <ExternalLink size={14} className="ml-auto opacity-70" />
                    </a>
                  )}
                  
                  {!profile?.website && !profile?.githubUrl && !profile?.linkedinUrl && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No social links added yet. Add them in your profile settings.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Timezone */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Timezone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-sm">{profile?.timezone || "Not set"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Your local time is used to display available session slots correctly.
                  </p>
                </CardContent>
              </Card>
              
              {/* Upcoming Sessions Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Calendar size={20} className="mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">No upcoming sessions</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push('/dashboard/sessions')}
                  >
                    View Calendar
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Sessions</CardTitle>
              <CardDescription>View and manage your past and upcoming sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                This tab is a placeholder. Click on the "View Calendar" button to navigate to your sessions calendar.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => router.push('/dashboard/sessions')}
              >
                View Calendar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Availability</CardTitle>
              <CardDescription>Set your weekly availability for mentorship sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                This tab is a placeholder. Click on the "Manage Availability" button to set your available time slots.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => router.push('/dashboard/availability')}
              >
                Manage Availability
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium">Profile Information</h3>
                    <p className="text-sm text-muted-foreground">Update your personal and professional details</p>
                  </div>
                  <Button variant="outline" onClick={handleEditProfile}>Edit</Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium">Password & Security</h3>
                    <p className="text-sm text-muted-foreground">Manage your password and security settings</p>
                  </div>
                  <Button variant="outline" onClick={() => router.push('/dashboard/settings/security')}>Manage</Button>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Customize which notifications you receive</p>
                  </div>
                  <Button variant="outline" onClick={() => router.push('/dashboard/settings/notifications')}>Configure</Button>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium">Connected Accounts</h3>
                    <p className="text-sm text-muted-foreground">Manage your linked social and external accounts</p>
                  </div>
                  <Button variant="outline" onClick={() => router.push('/dashboard/settings/connections')}>Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 