export function StorySection() {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Section Label */}
          <div className="mb-6 text-center">
            <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Our Story
            </span>
          </div>

          {/* Headline */}
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Built by Dentists, for Dentists
          </h2>

          {/* Story Content */}
          <div className="space-y-6 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            <p>
              We know what it&apos;s like. You finish a complex case—maybe a full-mouth rehabilitation 
              or a challenging implant restoration—and you want to share it. Not for vanity, but because 
              you&apos;re proud of the work, and you know other professionals could learn from it.
            </p>
            
            <p>
              But where do you go? Social media feels too public. Email chains get messy. And most 
              platforms weren&apos;t built with dental professionals in mind—let alone with the privacy 
              and compliance standards our field demands.
            </p>
            
            <p className="font-medium text-gray-900 dark:text-white">
              That&apos;s why we created Network32.
            </p>
            
            <p>
              This is a space where you can connect with colleagues who understand your work, share 
              clinical cases with confidence, discover new techniques, and build meaningful professional 
              relationships—all while knowing that patient privacy is protected at every step.
            </p>
            
            <p>
              We&apos;re not trying to replace your existing tools. We&apos;re here to complement them—to 
              give you a dedicated space for professional growth, collaboration, and community.
            </p>
          </div>

          {/* Quote */}
          <div className="mt-12 border-l-4 border-blue-500 bg-blue-50 p-6 dark:bg-blue-950/30">
            <p className="text-lg italic text-gray-700 dark:text-gray-300">
              &quot;Network32 isn&apos;t just another platform. It&apos;s the professional home we&apos;ve 
              been missing—a place where dentistry comes first.&quot;
            </p>
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              — Dr. Sarah Chen, Prosthodontist
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
