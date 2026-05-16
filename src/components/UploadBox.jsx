function UploadBox({ onFileUpload }) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <section className="flex justify-center pb-20">
            <div className="w-full max-w-4xl bg-[#0b0b0b] border border-gray-800 rounded-3xl p-12 md:p-16 text-center hover:border-purple-500 transition-all duration-300">

                <h2 className="text-3xl md:text-4xl font-bold">
                    Upload Your Resume
                </h2>

                <p className="text-gray-400 mt-5 text-lg">
                    Upload your PDF resume for AI analysis
                </p>

                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mt-8 text-sm"
                />

            </div>
        </section>
    );
}

export default UploadBox;