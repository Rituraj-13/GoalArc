import React from "react"
import { useNavigate } from 'react-router-dom'

const Button = ({ children, primary, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 font-bold rounded-full transition-all duration-300 ${primary
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-100"
            }`}
    >
        {children}
    </button>
)

const FeatureCard = ({ icon, title, description }) => (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold mb-2 text-blue-900">{title}</h3>
        <p className="text-center text-gray-600">{description}</p>
    </div>
)

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="font-sans text-gray-900 leading-normal">
            <header className="flex justify-between items-center px-8 py-6 bg-white shadow-md">
                <div className="text-2xl font-bold text-blue-600">TodoMaster</div>
                <Button onClick={() => navigate('/auth')}>Sign In / Sign Up</Button>
            </header>

            <main>
                <section className="bg-gradient-to-br from-blue-500 to-blue-900 text-white py-24 px-8 text-center">
                    <h1 className="text-5xl font-bold mb-6">Manage Your Tasks with Ease</h1>
                    <p className="text-xl max-w-2xl mx-auto mb-10">
                        Stay organized, boost productivity, and never miss a deadline with TodoMaster.
                    </p>
                    <Button primary onClick={() => navigate('/auth') }>
                        Get Started
                    </Button>
                </section>

                <section className="py-24 px-8 bg-blue-50">
                    <h2 className="text-4xl font-bold text-center mb-16 text-blue-900">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon="🔐"
                            title="Authentication"
                            description="Secure login and user management for your personal todo lists."
                        />
                        <FeatureCard
                            icon="✅"
                            title="Create Todos"
                            description="Easily add new tasks to your list with just a few clicks."
                        />
                        <FeatureCard
                            icon="✏️"
                            title="Update Todos"
                            description="Modify your tasks as needed to keep your list up-to-date."
                        />
                        <FeatureCard icon="🗑️" title="Delete Todos" description="Remove completed or unnecessary tasks with ease." />
                    </div>
                </section>

                <section className="bg-gradient-to-br from-blue-100 to-blue-300 py-24 px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6 text-blue-900">Start Managing Your Tasks Today</h2>
                    <p className="text-xl max-w-2xl mx-auto mb-10 text-blue-800">
                        Join thousands of users who have improved their productivity with TodoMaster. Sign up now and take control
                        of your tasks.
                    </p>
                    <Button primary onClick={() => console.log("Get Started clicked")}>
                        Get Started
                    </Button>
                </section>
            </main>

            <footer className="bg-blue-900 text-white py-8 px-8 text-center">
                <p className="mb-4">© 2024 TodoMaster. All rights reserved.</p>
                <div>
                    <a href="#" className="text-blue-200 hover:underline mr-6">
                        Terms of Service
                    </a>
                    <a href="#" className="text-blue-200 hover:underline">
                        Privacy Policy
                    </a>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage

