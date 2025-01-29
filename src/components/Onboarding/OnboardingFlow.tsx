'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface OnboardingStep {
  title: string;
  description: string;
  fields: {
    name: string;
    label: string;
    type: string;
    options?: { label: string; value: string }[];
    placeholder?: string;
  }[];
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to MentorConnect! 👋",
    description: "Let's get to know you better",
    fields: [
      {
        name: "experience",
        label: "Years of Experience",
        type: "select",
        options: [
          { label: "0-2 years", value: "0-2" },
          { label: "2-5 years", value: "2-5" },
          { label: "5-10 years", value: "5-10" },
          { label: "10+ years", value: "10+" },
        ],
      },
    ],
  },
  {
    title: "What's your primary focus? 🎯",
    description: "This helps us match you with the right mentors/mentees",
    fields: [
      {
        name: "interests",
        label: "Areas of Interest",
        type: "multiselect",
        options: [
          { label: "Frontend Development", value: "frontend" },
          { label: "Backend Development", value: "backend" },
          { label: "Mobile Development", value: "mobile" },
          { label: "DevOps", value: "devops" },
          { label: "Machine Learning", value: "ml" },
          { label: "Cloud Computing", value: "cloud" },
        ],
      },
    ],
  },
  {
    title: "What are your goals? 🎯",
    description: "Help us understand what you want to achieve",
    fields: [
      {
        name: "goals",
        label: "Your Goals",
        type: "multiselect",
        options: [
          { label: "Learn New Technologies", value: "learn_tech" },
          { label: "Switch Careers", value: "career_switch" },
          { label: "Improve Coding Skills", value: "improve_skills" },
          { label: "Get Job/Internship", value: "get_job" },
          { label: "Start a Project", value: "start_project" },
          { label: "Network with Others", value: "networking" },
        ],
      },
    ],
  },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      setLoading(true);
      try {
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to save onboarding data');
        }

        router.push('/dashboard');
      } catch (error) {
        console.error('Onboarding error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {steps[currentStep].title}
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {steps[currentStep].description}
                  </p>
                </div>

                <div className="space-y-6">
                  {steps[currentStep].fields.map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {field.label}
                      </label>
                      <div className="mt-1">
                        {field.type === 'select' && (
                          <select
                            id={field.name}
                            name={field.name}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        {field.type === 'multiselect' && (
                          <div className="grid grid-cols-2 gap-4">
                            {field.options?.map((option) => (
                              <label
                                key={option.value}
                                className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={option.value}
                                  checked={
                                    (formData[field.name] || []).includes(option.value)
                                  }
                                  onChange={(e) => {
                                    const values = formData[field.name] || [];
                                    if (e.target.checked) {
                                      handleInputChange(field.name, [...values, option.value]);
                                    } else {
                                      handleInputChange(
                                        field.name,
                                        values.filter((v: string) => v !== option.value)
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                        {field.type === 'textarea' && (
                          <textarea
                            id={field.name}
                            name={field.name}
                            rows={4}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : currentStep === steps.length - 1 ? (
                      'Complete'
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white dark:bg-gray-800 text-sm text-gray-500">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 