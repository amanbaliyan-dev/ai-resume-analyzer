import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/clerk-react";

function Navbar() {
    return (
        <nav className="border-b border-gray-900">

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                        A
                    </div>

                    <h1 className="text-2xl font-bold">
                        ResuAI
                    </h1>

                </div>

                <div>

                    <SignedOut>

                        <SignInButton mode="modal">

                            <button className="bg-white text-black px-5 py-2 rounded-xl font-medium hover:opacity-90 transition-all">
                                Sign In
                            </button>

                        </SignInButton>

                    </SignedOut>

                    <SignedIn>

                        <UserButton afterSignOutUrl="/" />

                    </SignedIn>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;