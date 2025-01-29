function HeroSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center md:gap-8">
        
        {/* Left Text Block */}
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            WELCOME TO SINGULARITY SOLUTIONS
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            A futuristic CRM for tackling AI, cosmic research, and everything in between.
            Get the help you need with our comprehensive support system.
          </p>
        </div>

        {/* Right Image / Illustration */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <img
            src="/images/FutureEarth.png"
            alt="Futuristic Earth"
            className="w-80 h-auto"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroSection 