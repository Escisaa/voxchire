export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020817] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
          Privacy Policy
        </h1>

        <div className="space-y-12 text-gray-300 text-lg">
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Welcome to VoxHire
            </h2>
            <p className="mb-4">
              We're committed to protecting your privacy and providing a secure,
              user-friendly interview practice experience. This policy explains
              how we use information to make your experience better.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Information We Use
            </h2>
            <div className="space-y-4">
              <p>
                To provide you with the best interview practice experience, we
                collect:
              </p>
              <ul className="list-disc pl-8 space-y-3">
                <li>
                  Basic account information to personalize your experience
                </li>
                <li>Interview recordings to provide accurate feedback</li>
                <li>Practice session data to track your progress</li>
                <li>Payment information through our secure payment partner</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              How We Enhance Your Experience
            </h2>
            <div className="space-y-4">
              <p>Your information helps us:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>Provide personalized interview practice sessions</li>
                <li>Generate helpful feedback for your improvement</li>
                <li>Keep track of your progress</li>
                <li>Make our AI training more effective</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Keeping Your Data Safe
            </h2>
            <div className="space-y-4">
              <p>Your security is our priority. We use:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>Industry-standard encryption</li>
                <li>Secure data storage</li>
                <li>Regular security updates</li>
                <li>Trusted payment processing</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Your Control
            </h2>
            <div className="space-y-4">
              <p>You have full control of your data. You can:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>Access your information anytime</li>
                <li>Update your preferences</li>
                <li>Download your practice history</li>
                <li>Manage your account settings</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Contact Us
            </h2>
            <p>Have questions? We're here to help! Reach out to us at:</p>
            <p className="mt-4 text-xl">support@voxhire.com</p>
          </section>

          <section>
            <p className="text-base text-gray-400 mt-12 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
