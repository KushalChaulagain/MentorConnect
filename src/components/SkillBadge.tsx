'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React from 'react';

// Tech icon mapping
const techIcons: Record<string, string> = {
  // Frontend
  'react': 'devicon-react-original colored',
  'vue': 'devicon-vuejs-plain colored',
  'angular': 'devicon-angularjs-plain colored',
  'next.js': 'devicon-nextjs-original',
  'nextjs': 'devicon-nextjs-original',
  'nuxt': 'devicon-nuxtjs-plain colored',
  'svelte': 'devicon-svelte-plain colored',
  'typescript': 'devicon-typescript-plain colored',
  'javascript': 'devicon-javascript-plain colored',
  'html': 'devicon-html5-plain colored',
  'css': 'devicon-css3-plain colored',
  'sass': 'devicon-sass-original colored',
  'tailwind': 'devicon-tailwindcss-plain colored',
  'bootstrap': 'devicon-bootstrap-plain colored',
  'frontend': 'devicon-html5-plain colored',
  
  // Backend
  'node': 'devicon-nodejs-plain colored',
  'nodejs': 'devicon-nodejs-plain colored',
  'express': 'devicon-express-original',
  'nestjs': 'devicon-nestjs-plain colored',
  'django': 'devicon-django-plain',
  'flask': 'devicon-flask-original',
  'spring': 'devicon-spring-plain colored',
  'laravel': 'devicon-laravel-plain colored',
  'rails': 'devicon-rails-plain colored',
  'graphql': 'devicon-graphql-plain colored',
  'php': 'devicon-php-plain colored',
  'postgresql': 'devicon-postgresql-plain colored',
  'mysql': 'devicon-mysql-plain colored',
  'mongodb': 'devicon-mongodb-plain colored',
  'redis': 'devicon-redis-plain colored',
  'backend': 'devicon-nodejs-plain colored',
  
  // Mobile
  'flutter': 'devicon-flutter-plain colored',
  'react native': 'devicon-react-original colored',
  'reactnative': 'devicon-react-original colored',
  'swift': 'devicon-swift-plain colored',
  'kotlin': 'devicon-kotlin-plain colored',
  'android': 'devicon-android-plain colored',
  'ios': 'devicon-apple-original',
  
  // DevOps & Cloud
  'docker': 'devicon-docker-plain colored',
  'kubernetes': 'devicon-kubernetes-plain colored',
  'aws': 'devicon-amazonwebservices-original colored',
  'azure': 'devicon-azure-plain colored',
  'gcp': 'devicon-googlecloud-plain colored',
  'devops': 'devicon-docker-plain colored',
  'github': 'devicon-github-original',
  'git': 'devicon-git-plain colored',
  
  // Languages
  'python': 'devicon-python-plain colored',
  'java': 'devicon-java-plain colored',
  'go': 'devicon-go-plain colored',
  'golang': 'devicon-go-plain colored',
  'rust': 'devicon-rust-plain',
  'c#': 'devicon-csharp-plain colored',
  'csharp': 'devicon-csharp-plain colored',
  'c++': 'devicon-cplusplus-plain colored',
  'ruby': 'devicon-ruby-plain colored',
  
  // Default
  'default': 'devicon-code-plain'
};

// Get appropriate icon for a skill
const getSkillIcon = (skill: string): string => {
  const lowerSkill = skill.toLowerCase();
  return techIcons[lowerSkill] || techIcons.default;
};

// Get appropriate color for a skill
const getSkillColor = (skill: string): string => {
  const lowerSkill = skill.toLowerCase();
  
  // Frontend related
  if (['react', 'next.js', 'nextjs'].includes(lowerSkill)) {
    return 'bg-cyan-900/20 border-cyan-700/30 text-cyan-300';
  }
  
  if (['vue', 'nuxt'].includes(lowerSkill)) {
    return 'bg-emerald-900/20 border-emerald-700/30 text-emerald-300';
  }
  
  if (['angular'].includes(lowerSkill)) {
    return 'bg-red-900/20 border-red-700/30 text-red-300';
  }
  
  if (['javascript', 'typescript'].includes(lowerSkill)) {
    return 'bg-amber-900/20 border-amber-700/30 text-amber-300';
  }
  
  if (['frontend', 'html', 'css', 'sass'].includes(lowerSkill)) {
    return 'bg-blue-900/20 border-blue-700/30 text-blue-300';
  }
  
  // Backend related
  if (['node', 'nodejs', 'express', 'nestjs', 'backend'].includes(lowerSkill)) {
    return 'bg-green-900/20 border-green-700/30 text-green-300';
  }
  
  if (['python', 'django', 'flask'].includes(lowerSkill)) {
    return 'bg-indigo-900/20 border-indigo-700/30 text-indigo-300';
  }
  
  if (['java', 'spring'].includes(lowerSkill)) {
    return 'bg-orange-900/20 border-orange-700/30 text-orange-300';
  }
  
  if (['php', 'laravel'].includes(lowerSkill)) {
    return 'bg-purple-900/20 border-purple-700/30 text-purple-300';
  }
  
  // Database related
  if (['mongodb', 'postgresql', 'mysql', 'redis'].includes(lowerSkill)) {
    return 'bg-emerald-900/20 border-emerald-700/30 text-emerald-300';
  }
  
  // Default color
  return 'bg-slate-800/40 border-slate-700/50 text-slate-300';
};

interface SkillBadgeProps {
  skill: string;
  onRemove?: () => void;
  className?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ 
  skill, 
  onRemove,
  className,
}) => {
  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border',
        getSkillColor(skill),
        'text-sm font-medium transition-all duration-200',
        onRemove ? 'pr-1.5' : '',
        className
      )}
    >
      {/* Add tech icon with proper styling */}
      <i className={cn(getSkillIcon(skill), 'text-base')}></i>
      <span>{skill}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

// Add this to your _app.tsx or layout.tsx to load the Devicon library
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />

export default SkillBadge; 