import Image from 'next/image';
import Link from 'next/link';

const mentors = [
  {
    id: 1,
    name: 'Aarav Sharma',
    title: 'Senior Full Stack Developer',
    company: 'Tech Innovators Nepal',
    expertise: ['React', 'Node.js', 'Python'],
    rating: 4.9,
    reviews: 24,
    hourlyRate: 25,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  // Add more sample mentors here
];

export default function FindMentorPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Your Mentor</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Connect with experienced developers who can help you grow
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name or expertise..."
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <select className="rounded-md border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option>All Technologies</option>
              <option>React</option>
              <option>Node.js</option>
              <option>Python</option>
              <option>Java</option>
            </select>
            <select className="rounded-md border border-gray-300 px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option>Price Range</option>
              <option>$0-25/hr</option>
              <option>$25-50/hr</option>
              <option>$50-100/hr</option>
              <option>$100+/hr</option>
            </select>
          </div>

          {/* Mentor List */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <Image
                      className="h-16 w-16 rounded-full"
                      src={mentor.image}
                      alt={mentor.name}
                      width={64}
                      height={64}
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{mentor.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{mentor.company}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(mentor.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 15.585l-7.07 3.714 1.35-7.858L.72 7.012l7.88-1.145L10 0l2.4 5.867 7.88 1.145-5.56 5.429 1.35 7.858z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ))}
                      </div>
                      <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {mentor.rating} ({mentor.reviews} reviews)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      ${mentor.hourlyRate}/hr
                    </span>
                    <Link
                      href={`/mentor/${mentor.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 