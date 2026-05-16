function ATSCard({ atsScore }) {
    return (
        <section className="flex justify-center pb-24">
            <div className="w-full max-w-2xl bg-[#0d1324] border border-gray-800 rounded-3xl p-12 md:p-14 text-center shadow-xl">

                <h2 className="text-4xl md:text-5xl font-bold">
                    ATS Score
                </h2>

                <div className="text-7xl md:text-8xl font-bold text-purple-500 mt-8">

                    {atsScore !== null ? `${atsScore}%` : "--"}

                </div>

                <p className="text-gray-400 text-lg mt-8 leading-relaxed">

                    {atsScore !== null
                        ? "Your resume analysis score based on AI evaluation."
                        : "Upload and analyze your resume to see ATS score."}

                </p>

            </div>
        </section>
    );
}

export default ATSCard;