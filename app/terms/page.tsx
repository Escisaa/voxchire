export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#020817] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
          Terms of Service
        </h1>

        <div className="space-y-12 text-gray-300 text-lg">
          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Welcome to VoxHire
            </h2>
            <p className="mb-4">
              Thanks for choosing VoxHire! We're excited to help you prepare for
              your interviews. These terms outline our commitment to providing
              you with a great service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Our Service
            </h2>
            <div className="space-y-4">
              <p>VoxHire provides you with:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>AI-powered interview practice sessions</li>
                <li>Personalized feedback and insights</li>
                <li>Progress tracking and analytics</li>
                <li>Interview recordings and transcripts</li>
                <li>Performance improvement suggestions</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Your Account
            </h2>
            <div className="space-y-4">
              <p>To get the most out of VoxHire:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>Create your personal account</li>
                <li>Keep your login information secure</li>
                <li>Provide accurate account information</li>
                <li>You must be 18 or older to use our service</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Subscription & Credits
            </h2>
            <div className="space-y-4">
              <p>Our payment system is simple and transparent:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>Choose from our flexible credit packages</li>
                <li>Subscribe for unlimited access</li>
                <li>Secure payments through Stripe</li>
                <li>Cancel your subscription anytime</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Using VoxHire
            </h2>
            <div className="space-y-4">
              <p>To ensure the best experience for everyone:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>Use the service for personal interview practice</li>
                <li>Maintain professional conduct during sessions</li>
                <li>Respect the platform and other users</li>
                <li>Don't share account access with others</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Our Commitment
            </h2>
            <div className="space-y-4">
              <p>We strive to provide:</p>
              <ul className="list-disc pl-8 space-y-3">
                <li>High-quality interview practice</li>
                <li>Reliable and accurate feedback</li>
                <li>Secure and private sessions</li>
                <li>Regular service improvements</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
              Contact Us
            </h2>
            <p>Questions about these terms? We're here to help!</p>
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
