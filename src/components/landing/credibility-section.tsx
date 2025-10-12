import { Shield, Lock, CheckCircle, Users } from 'lucide-react';

export function CredibilitySection() {
  const stats = [
    { value: '1,000+', label: 'Dental Professionals' },
    { value: '5,000+', label: 'Clinical Cases Shared' },
    { value: '10,000+', label: 'Forum Discussions' },
    { value: '50+', label: 'Specialties Represented' },
  ];

  const trustFactors = [
    {
      icon: Shield,
      title: 'HIPAA-Aware Design',
      description: 'Built with patient privacy at the core. Every feature requires proper consent and follows best practices.',
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Your data is encrypted, your content is protected, and you control who sees what you share.',
    },
    {
      icon: CheckCircle,
      title: 'Verified Professionals',
      description: 'All members are verified dental professionals, ensuring authentic, high-quality interactions.',
    },
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Built by dentists who understand your needs, with features shaped by real user feedback.',
    },
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-800/50 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Trust & Security
          </span>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Your Privacy and Security Come First
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            We take the responsibility of handling clinical information seriously. 
            Here&apos;s how we protect you and your patients.
          </p>
        </div>

        {/* Stats */}
        <div className="mx-auto mb-16 grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Factors */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {trustFactors.map((factor) => {
            const Icon = factor.icon;
            return (
              <div
                key={factor.title}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {factor.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {factor.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              &quot;Finally, a platform that understands the unique needs of dental professionals. 
              The HIPAA-aware features give me peace of mind when sharing cases.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Dr. Michael Torres</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Endodontist, Miami</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              &quot;Network32 has become my go-to resource for learning new techniques and connecting 
              with specialists. The community is incredibly supportive.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Dr. Jennifer Park</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">General Dentist, Seattle</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
