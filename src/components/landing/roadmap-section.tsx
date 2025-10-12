import { CheckCircle, Clock, Sparkles } from 'lucide-react';

export function RoadmapSection() {
  const roadmapItems = [
    {
      status: 'live',
      title: 'Core Platform',
      features: [
        'Clinical case sharing with before/after images',
        'Professional forums and discussions',
        'Network building and following',
        'Clinic profiles and discovery',
        'Personalized feed',
        'Save and bookmark content',
      ],
    },
    {
      status: 'coming-soon',
      title: 'Q2 2025',
      features: [
        'Direct messaging between professionals',
        'Advanced search and filtering',
        'Mobile app (iOS & Android)',
        'CE credit tracking integration',
        'Video case presentations',
        'Referral network tools',
      ],
    },
    {
      status: 'planned',
      title: 'Q3-Q4 2025',
      features: [
        'Virtual study clubs and webinars',
        'Practice management integrations',
        'AI-powered case recommendations',
        'Marketplace for dental services',
        'International expansion',
        'Advanced analytics dashboard',
      ],
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-900 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Product Roadmap
          </span>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            We&apos;re Just Getting Started
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Here&apos;s what we&apos;re building next. Your feedback shapes our priorities.
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="mx-auto max-w-5xl">
          <div className="space-y-8">
            {roadmapItems.map((item, index) => {
              const isLive = item.status === 'live';
              const isComingSoon = item.status === 'coming-soon';
              const isPlanned = item.status === 'planned';

              return (
                <div
                  key={item.title}
                  className={`relative rounded-2xl border p-8 transition-all ${
                    isLive
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                      : isComingSoon
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="mb-4 flex items-center gap-3">
                    {isLive && (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white">
                          Live Now
                        </span>
                      </>
                    )}
                    {isComingSoon && (
                      <>
                        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
                          Coming Soon
                        </span>
                      </>
                    )}
                    {isPlanned && (
                      <>
                        <Sparkles className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        <span className="rounded-full bg-gray-600 px-3 py-1 text-sm font-medium text-white">
                          Planned
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>

                  {/* Features List */}
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <svg
                          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                            isLive
                              ? 'text-green-600 dark:text-green-400'
                              : isComingSoon
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Connection Line */}
                  {index < roadmapItems.length - 1 && (
                    <div className="absolute -bottom-8 left-1/2 h-8 w-0.5 -translate-x-1/2 bg-gray-300 dark:bg-gray-700" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback CTA */}
        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-800 dark:bg-blue-950/20">
          <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
            Have a Feature Request?
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            We&apos;re building this platform with you. Share your ideas and help shape the future of Network32.
          </p>
          <a
            href="mailto:feedback@network32.com"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Send Feedback
          </a>
        </div>
      </div>
    </section>
  );
}
