import { FaHandshake, FaLightbulb, FaUsers } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              About <span className="text-indigo-600 dark:text-indigo-400">MentorConnect</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-xl text-gray-500 dark:text-gray-300">
              Connecting aspiring developers with experienced mentors to foster growth and innovation in the tech community.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Our Mission</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              To bridge the gap between aspiring developers and industry experts, creating a supportive environment for learning and professional growth.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                  <FaHandshake className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Personalized Mentorship</h3>
                <p className="mt-2 text-center text-gray-500 dark:text-gray-300">
                  One-on-one guidance from experienced developers who understand your goals and challenges.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                  <FaLightbulb className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Skill Development</h3>
                <p className="mt-2 text-center text-gray-500 dark:text-gray-300">
                  Structured learning paths and practical projects to enhance your technical expertise.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                  <FaUsers className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">Community Growth</h3>
                <p className="mt-2 text-center text-gray-500 dark:text-gray-300">
                  Join a thriving community of developers sharing knowledge and experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Our Values</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Trust & Security</h3>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <MdSecurity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-300">
                  We prioritize the safety and security of our community members, ensuring a trusted environment for mentorship.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quality Learning</h3>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaLightbulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-300">
                  We maintain high standards for our mentors and learning resources to ensure the best possible experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Us Section */}
      <div className="bg-indigo-600 dark:bg-indigo-900">
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start your journey?
            </h2>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Get Started
                </a>
              </div>
              <div className="ml-3 inline-flex">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-100 px-5 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

