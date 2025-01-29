'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string | null;
  expertise: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  languages: string[];
  skills: string[];
}

export default function FindMentorsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoadingMentors, setIsLoadingMentors] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  useEffect(() => {
    if (!isLoading && user?.role === UserRole.MENTOR) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch('/api/mentors?' + new URLSearchParams({
          search: searchQuery,
          languages: selectedLanguages.join(','),
          skills: selectedSkills.join(','),
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
        }));
        
        if (!res.ok) throw new Error('Failed to fetch mentors');
        
        const data = await res.json();
        setMentors(data);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setIsLoadingMentors(false);
      }
    };

    fetchMentors();
  }, [searchQuery, selectedLanguages, selectedSkills, priceRange]);

  if (isLoading || isLoadingMentors) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Find a Mentor
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Connect with experienced developers who can help you grow
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex flex-col space-y-1.5">
              <label
                htmlFor="search"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Search Mentors
              </label>
              <Input
                id="search"
                placeholder="Search by name, skills, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Languages Filter */}
              <div className="flex flex-col space-y-1.5">
                <label
                  htmlFor="languages"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Programming Languages
                </label>
                <Select
                  value={selectedLanguages.join(',')}
                  onValueChange={(value: string) => setSelectedLanguages(value.split(',').filter(Boolean))}
                >
                  <SelectTrigger id="languages">
                    <SelectValue placeholder="Select languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Filter */}
              <div className="flex flex-col space-y-1.5">
                <label
                  htmlFor="skills"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Skills
                </label>
                <Select
                  value={selectedSkills.join(',')}
                  onValueChange={(value: string) => setSelectedSkills(value.split(',').filter(Boolean))}
                >
                  <SelectTrigger id="skills">
                    <SelectValue placeholder="Select skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="node">Node.js</SelectItem>
                    <SelectItem value="django">Django</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="docker">Docker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="flex flex-col space-y-1.5">
                <label
                  htmlFor="price"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Price Range (Rs/hr)
                </label>
                <Select
                  value={`${priceRange[0]}-${priceRange[1]}`}
                  onValueChange={(value: string) => {
                    const [min, max] = value.split('-').map(Number);
                    setPriceRange([min, max]);
                  }}
                >
                  <SelectTrigger id="price">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1000">Rs. 0 - 1,000</SelectItem>
                    <SelectItem value="1000-2500">Rs. 1,000 - 2,500</SelectItem>
                    <SelectItem value="2500-5000">Rs. 2,500 - 5,000</SelectItem>
                    <SelectItem value="5000-10000">Rs. 5,000 - 10,000</SelectItem>
                    <SelectItem value="10000-999999">Rs. 10,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="overflow-hidden hover:shadow-lg transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}`} />
                  <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg leading-none">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {mentor.title}
                    {mentor.company && ` at ${mentor.company}`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      i < mentor.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
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
                  ({mentor.totalReviews})
                </span>
                <Badge variant="outline" className="ml-auto">
                  Rs. {mentor.hourlyRate}/hr
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {mentor.languages.slice(0, 3).map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {mentor.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => router.push(`/dashboard/mentors/${mentor.id}`)}
              >
                View Profile
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 