function UploadBox({ onFileUpload }) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <section className="flex justify-center pb-16 md:pb-20">
            <div className="w-full max-w-4xl bg-[#0b0b0b] border border-gray-800 rounded-3xl p-8 md:p-16 text-center hover:border-purple-500 transition-all duration-300">

                <h2 className="text-3xl md:text-4xl font-bold">
                    Upload Your Resume
                </h2>

                <p className="text-gray-400 mt-4 md:mt-5 text-base md:text-lg">
                    Upload your PDF resume for AI analysis
                </p>

                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mt-6 md:mt-8 text-sm w-full md:w-auto file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />

            </div>
        </section>
    );
}

export default UploadBox;