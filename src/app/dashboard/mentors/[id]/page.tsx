'use client';

import SkillBadge from "@/components/SkillBadge";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Code, Github, Globe, Linkedin, MessageSquare, Video } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MentorProfile {
  id: string;
  name: string;
  title: string;
  company: string | null;
  bio: string;
  expertise: string[];
  languages: string[];
  skills: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  github: string | null;
  linkedin: string | null;
  website: string | null;
  availability: {
    day: string;
    slots: { start: string; end: string }[];
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string;
    author: {
      name: string;
      image: string;
    };
    createdAt: string;
  }[];
}

export default function MentorProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const res = await fetch(`/api/mentors/${id}`);
        if (!res.ok) throw new Error('Failed to fetch mentor profile');
        const data = await res.json();
        setMentor(data);
      } catch (error) {
        console.error('Error fetching mentor profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Mentor not found
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The mentor profile you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}`} />
              <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-2xl font-bold">{mentor.name}</h1>
                <p className="text-muted-foreground">
                  {mentor.title}
                  {mentor.company && ` at ${mentor.company}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((exp) => (
                  <Badge key={exp} variant="secondary">
                    {exp}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {mentor.github && (
                  <a
                    href={mentor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {mentor.linkedin && (
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {mentor.website && (
                  <a
                    href={mentor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">Rs. {mentor.hourlyRate}/hr</p>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${
                        i < mentor.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 15.585l-7.07 3.715 1.35-7.87L.36 7.24l7.89-1.15L10 0l2.75 6.09 7.89 1.15-5.92 4.19 1.35 7.87L10 15.585z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                  <span className="ml-1">({mentor.totalReviews})</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{mentor.bio}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expertise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Programming Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((lang) => (
                      <Badge key={lang} variant="outline">
                        <Code className="h-3 w-3 mr-1" />
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill) => (
                      <SkillBadge 
                        key={skill} 
                        skill={skill}
                        showRemoveButton={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mentor.availability.map((day) => (
                  <div
                    key={day.day}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <h3 className="font-medium">{day.day}</h3>
                    </div>
                    <div className="space-y-1">
                      {day.slots.map((slot, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {slot.start} - {slot.end}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mentor.reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar>
                        <AvatarImage src={review.author.image} />
                        <AvatarFallback>
                          {review.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.author.name}</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 15.585l-7.07 3.715 1.35-7.87L.36 7.24l7.89-1.15L10 0l2.75 6.09 7.89 1.15-5.92 4.19 1.35 7.87L10 15.585z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 