import { Link } from "react-router-dom";
function SignUp() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">

            <div className="w-full max-w-md bg-[#0d1324] border border-gray-800 rounded-3xl p-10">

                <h1 className="text-4xl font-bold text-center text-white">
                    Create Account
                </h1>

                <div className="mt-10 space-y-5">

                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-black border border-gray-700 rounded-xl px-5 py-4 text-white outline-none focus:border-purple-500"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full bg-black border border-gray-700 rounded-xl px-5 py-4 text-white outline-none focus:border-purple-500"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-black border border-gray-700 rounded-xl px-5 py-4 text-white outline-none focus:border-purple-500"
                    />

                    <button
                        type="button"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 py-4 rounded-xl font-medium hover:opacity-90 transition-all"
                    >
                        Sign Up
                    </button>
                    <p className="text-gray-400 text-center mt-6">
                        Already have an account?{" "}

                        <Link to="/signin" className="text-purple-400 hover:underline">
                            Sign In
                        </Link>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default SignUp;