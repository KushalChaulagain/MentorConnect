"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle2, InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileCompletionGuidanceProps {
  profile: {
    title?: string;
    bio?: string;
    location?: string;
    company?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    completionStatus?: number;
    isMentor?: boolean;
    learningGoals?: string;
    skillLevel?: string;
    areasOfInterest?: string;
    learningStyle?: string;
    careerGoals?: string;
    currentChallenges?: string;
    education?: string;
  };
}

export default function ProfileCompletionGuidance({ profile }: ProfileCompletionGuidanceProps) {
  const router = useRouter();

  // Define the requirements for mentees
  const menteeRequirements = [
    { name: "Title", field: "title", minLength: 1, isFilled: !!profile.title && profile.title.length >= 1 },
    { name: "Bio", field: "bio", minLength: 25, isFilled: !!profile.bio && profile.bio.length >= 25 },
    { name: "Learning Goals", field: "learningGoals", minLength: 1, isFilled: !!profile.learningGoals && profile.learningGoals.length >= 1 },
    { name: "Skill Level", field: "skillLevel", minLength: 1, isFilled: !!profile.skillLevel && profile.skillLevel.length >= 1 },
    { name: "Areas of Interest", field: "areasOfInterest", minLength: 1, isFilled: !!profile.areasOfInterest && profile.areasOfInterest.length >= 1 },
    { name: "Learning Style", field: "learningStyle", minLength: 1, isFilled: !!profile.learningStyle && profile.learningStyle.length >= 1 },
    { name: "Career Goals", field: "careerGoals", minLength: 1, isFilled: !!profile.careerGoals && profile.careerGoals.length >= 1 },
    { name: "Current Challenges", field: "currentChallenges", minLength: 1, isFilled: !!profile.currentChallenges && profile.currentChallenges.length >= 1 },
    { name: "Education", field: "education", minLength: 1, isFilled: !!profile.education && profile.education.length >= 1 },
    { name: "GitHub URL", field: "githubUrl", minLength: 1, isFilled: !!profile.githubUrl && profile.githubUrl.length >= 1 }
  ];

  // Define the requirements for mentors
  const mentorRequirements = [
    { name: "Title", field: "title", minLength: 1, isFilled: !!profile.title && profile.title.length >= 1 },
    { name: "Bio", field: "bio", minLength: 50, isFilled: !!profile.bio && profile.bio.length >= 50 },
    { name: "Location", field: "location", minLength: 1, isFilled: !!profile.location && profile.location.length >= 1 },
    { name: "Company", field: "company", minLength: 1, isFilled: !!profile.company && profile.company.length >= 1 },
    { name: "GitHub URL", field: "githubUrl", minLength: 5, isFilled: !!profile.githubUrl && profile.githubUrl.length >= 5 },
    { name: "LinkedIn URL", field: "linkedinUrl", minLength: 5, isFilled: !!profile.linkedinUrl && profile.linkedinUrl.length >= 5 }
  ];

  const requirements = profile.isMentor ? mentorRequirements : menteeRequirements;
  
  const handleEditProfile = () => {
    router.push("/dashboard/profile/edit");
  };

  // Calculate the completion status if not provided
  const completionStatus = profile.completionStatus ?? Math.round(
    (requirements.filter(r => r.isFilled).length / requirements.length) * 100
  );

  // Don't show the component if profile is 100% complete
  if (completionStatus === 100) {
    return null;
  }

  return (
    <Card className="mb-8 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Complete your profile
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p className="font-semibold mb-1">Profile Requirements:</p>
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      {requirements.map((req) => (
                        <li key={req.field} className={req.isFilled ? "text-green-500" : "text-red-400"}>
                          {req.name}: {req.minLength > 1 ? `min ${req.minLength} characters` : "Required"}
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {profile.isMentor
                ? "Complete your profile to increase your visibility to potential mentees."
                : "Complete your profile to improve mentor matching and find the right mentors for your learning journey."
              }
            </p>
          </div>
          <Button 
            onClick={handleEditProfile}
            variant="outline" 
            className="border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30"
          >
            Continue Setup
          </Button>
        </div>
        
        <div className="space-y-1 mb-4">
          {requirements.map((req) => (
            <div key={req.field} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {req.isFilled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className={req.isFilled ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-slate-300"}>
                  {req.name}
                </span>
                {!req.isFilled && req.minLength > 1 && (
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    (min {req.minLength} chars)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <Progress 
            value={completionStatus} 
            className="h-2 bg-slate-200 dark:bg-slate-800" 
            indicatorClassName="bg-cyan-500 dark:bg-cyan-500"
          />
          <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 flex justify-between">
            <span>{completionStatus}% complete</span>
            <span>{requirements.filter(r => r.isFilled).length} of {requirements.length} requirements met</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 