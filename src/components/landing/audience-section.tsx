import { GraduationCap, Building2, Users, Stethoscope } from 'lucide-react';

export function AudienceSection() {
  const audiences = [
    {
      icon: Stethoscope,
      title: 'General Dentists',
      description: 'Share your everyday wins, learn from peers, and discover new techniques to elevate your practice.',
      color: 'blue',
    },
    {
      icon: GraduationCap,
      title: 'Specialists',
      description: 'Showcase complex cases, connect with referring doctors, and build your reputation in your specialty.',
      color: 'purple',
    },
    {
      icon: Building2,
      title: 'Clinic Owners',
      description: 'Promote your practice, attract talent, and network with other business-minded professionals.',
      color: 'green',
    },
    {
      icon: Users,
      title: 'Young Professionals',
      description: 'Build your network early, learn from experienced mentors, and accelerate your career growth.',
      color: 'orange',
    },
  ];

  return (
    <section className="bg-gray-50 dark:bg-gray-800/50 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Who It&apos;s For
          </span>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            A Platform for Every Stage of Your Career
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Whether you&apos;re just starting out or you&apos;ve been practicing for decades, 
            Network32 has something for you.
          </p>
        </div>

        {/* Audience Cards */}
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((audience) => {
            const Icon = audience.icon;
            return (
              <div
                key={audience.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Icon */}
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-${audience.color}-100 text-${audience.color}-600 dark:bg-${audience.color}-900/30 dark:text-${audience.color}-400`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {audience.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {audience.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-950/20" />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            No matter where you are in your journey, you belong here.
          </p>
        </div>
      </div>
    </section>
  );
}
