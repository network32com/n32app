import { Image, MessageSquare, Users, Building2, Bookmark, TrendingUp } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Image,
      title: 'Clinical Case Sharing',
      description: 'Upload before/after photos, document your procedures, and showcase your best work with full HIPAA compliance.',
      benefits: ['Secure image storage', 'Patient consent tracking', 'Procedure categorization'],
    },
    {
      icon: MessageSquare,
      title: 'Professional Forums',
      description: 'Ask questions, share insights, and engage in meaningful discussions with peers across specialties.',
      benefits: ['Topic-based discussions', 'Expert answers', 'Community moderation'],
    },
    {
      icon: Users,
      title: 'Network Building',
      description: 'Follow colleagues, discover specialists, and build relationships that advance your career.',
      benefits: ['Professional profiles', 'Specialty filtering', 'Connection recommendations'],
    },
    {
      icon: Building2,
      title: 'Clinic Profiles',
      description: 'Showcase your practice, highlight your team, and attract both patients and talented professionals.',
      benefits: ['Custom clinic pages', 'Team member profiles', 'Service listings'],
    },
    {
      icon: Bookmark,
      title: 'Save & Organize',
      description: 'Bookmark inspiring cases, save helpful discussions, and build your personal reference library.',
      benefits: ['Personal collections', 'Quick access', 'Organized by topic'],
    },
    {
      icon: TrendingUp,
      title: 'Personalized Feed',
      description: 'See content that matters to you—cases from your network, trending procedures, and relevant discussions.',
      benefits: ['Smart filtering', 'Specialty focus', 'Activity updates'],
    },
  ];

  return (
    <section id="features" className="bg-white dark:bg-gray-900 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Features
          </span>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Everything You Need to Connect, Learn, and Grow
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            We&apos;ve built the tools you need to make professional networking actually work for you.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700"
              >
                {/* Icon */}
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-600">
                  <Icon className="h-7 w-7" />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>

                {/* Benefits List */}
                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
