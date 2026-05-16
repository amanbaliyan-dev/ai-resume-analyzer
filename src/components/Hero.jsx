function Hero() {
    return (
        <section className="text-center pt-20 md:pt-28 pb-20 flex flex-col items-center">

            <div className="max-w-5xl">
                <h1 className="text-5xl md:text-7xl font-bold leading-[1.1]">
                    Elevate Your <br />

                    <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Career With AI
                    </span>
                </h1>

                <p className="text-gray-400 text-lg md:text-xl mt-10 max-w-3xl mx-auto leading-relaxed">
                    Instantly scan your resume for ATS compatibility and get intelligent suggestions to stand out from the crowd.
                </p>
            </div>

        </section>
    );
}

export default Hero;