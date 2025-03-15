'use client';

import BookingForm from '@/components/BookingForm';
import SkillBadge from "@/components/SkillBadge";
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MentorProfile {
  id: string;
  title: string;
  company: string;
  bio: string;
  expertise: string[];
  languages: string[];
  skills: string[];
  experience: string;
  interests: string[];
  goals: string[];
  hourlyRate: number;
  rating: number;
  github: string;
  linkedin: string;
  website: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

export default function MentorProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  useEffect(() => {
    fetchMentorProfile();
  }, [params.id]);

  const fetchMentorProfile = async () => {
    try {
      const response = await fetch(`/api/mentor-profile/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch mentor profile');
      const data = await response.json();
      setMentorProfile(data);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentor profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!mentorProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4">
              <div className="relative h-24 w-24">
                <Image
                  src={mentorProfile.user.image || '/default-avatar.png'}
                  alt={mentorProfile.user.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{mentorProfile.user.name}</h1>
                <p className="text-gray-600">{mentorProfile.title}</p>
                {mentorProfile.company && (
                  <p className="text-gray-500">{mentorProfile.company}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-700">{mentorProfile.bio}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.expertise.map((item) => (
                    <span
                      key={item}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.skills.map((skill) => (
                    <SkillBadge 
                      key={skill} 
                      skill={skill} 
                      showRemoveButton={false}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {mentorProfile.languages.map((language) => (
                  <span
                    key={language}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Experience</h3>
              <p className="text-gray-700">{mentorProfile.experience}</p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {mentorProfile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Goals</h3>
              <div className="flex flex-wrap gap-2">
                {mentorProfile.goals.map((goal) => (
                  <span
                    key={goal}
                    className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-2xl font-bold">${mentorProfile.hourlyRate}</p>
              <p className="text-gray-500">per hour</p>
            </div>

            <div className="mt-6">
              <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Book a Session</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Book a Session</DialogTitle>
                    <DialogDescription>
                      Select your preferred date and time for the mentoring session.
                    </DialogDescription>
                  </DialogHeader>
                  <BookingForm
                    mentorProfileId={mentorProfile.id}
                    onBookingComplete={() => setIsBookingDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-6 space-y-4">
              {mentorProfile.github && (
                <a
                  href={mentorProfile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <span>GitHub</span>
                </a>
              )}
              {mentorProfile.linkedin && (
                <a
                  href={mentorProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <span>LinkedIn</span>
                </a>
              )}
              {mentorProfile.website && (
                <a
                  href={mentorProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 