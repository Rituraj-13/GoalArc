import React from "react"
import { useNavigate } from "react-router-dom"
import { 
    Lock, 
    CheckCircle, 
    Calendar, 
    Edit, 
    FileText, 
    Trash2,
    PlayCircle,
    WandSparkles
} from "lucide-react"

const Button = ({ children, primary, onClick }) => (
    <button
        onClick={onClick}
        className={`px-8 py-4 font-bold text-lg rounded-full transition-all duration-300 ${primary
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                : "bg-white text-blue-600 hover:bg-blue-50 shadow-md hover:shadow-lg"
            }`}
    >
        {children}
    </button>
)

const FeatureCard = ({ Icon, title, description }) => (
    <div className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        <div className="text-5xl mb-4 text-blue-600">
            <Icon size={48} />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-blue-900">{title}</h3>
        <p className="text-center text-gray-600">{description}</p>
    </div>
)

const LandingPage = () => {
    const navigate = useNavigate()

    return (
        <div className="font-sans text-gray-900 leading-normal">
            <main>
                <section className="relative bg-gradient-to-br from-blue-600 to-blue-900 text-white py-32 px-4 md:px-8 overflow-hidden ">
                    <div className="absolute inset-0 bg-blue-900 opacity-20 z-0 "></div>
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="text-left space-y-8">
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                                <span className="block">GoalArc</span>
                                <span className="block text-blue-300">Bridge Your Tasks to Triumph</span>
                            </h1>
                            <p className="text-xl md:text-2xl font-light max-w-xl">
                                Stay organized, boost productivity, and never miss a deadline with GoalArc's innovative task management
                                system.
                            </p>
                            <div className="flex space-x-4">
                                <Button primary onClick={() => navigate("/auth")}>
                                    Get Started
                                </Button>
                                <Button onClick={() => console.log("Learn More clicked")}>Learn More</Button>
                            </div>
                        </div>
                        <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                            <img
                                src="/placeholder.svg?height=720&width=1280"
                                alt="GoalArc Demo Video"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="bg-white bg-opacity-75 rounded-full p-4 text-blue-600 hover:bg-opacity-100 transition-all duration-300">
                                    <PlayCircle size={48} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-900 to-transparent"></div>
                </section>

                <section className="py-24 px-8 bg-blue-50">
                    <h2 className="text-4xl font-bold text-center mb-16 text-blue-900">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            Icon={Lock}
                            title="Secure Authentication"
                            description="Protect your personal todo lists with our robust user management system."
                        />
                        <FeatureCard
                            Icon={WandSparkles}
                            title="Smart Task Creation"
                            description="Easily add new tasks and let AI generate detailed descriptions for you."
                        />
                        <FeatureCard
                            Icon={Calendar}
                            title="Deadline-based Arrangement"
                            description="Automatically organize your tasks based on deadlines for better time management."
                        />
                        <FeatureCard
                            Icon={Edit}
                            title="Flexible Updates"
                            description="Modify your tasks anytime to keep your list current and relevant."
                        />
                        <FeatureCard
                            Icon={FileText}
                            title="Markdown Support"
                            description="Format your task descriptions using Markdown for enhanced readability."
                        />
                        <FeatureCard
                            Icon={Trash2}
                            title="Easy Deletions"
                            description="Remove completed or unnecessary tasks to keep your list clutter-free."
                        />
                    </div>
                </section>

                <section className="bg-gradient-to-br from-blue-100 to-blue-300 py-24 px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6 text-blue-900">Elevate Your Productivity with GoalArc</h2>
                    <p className="text-xl max-w-2xl mx-auto mb-10 text-blue-800">
                        Join thousands of users who have transformed their task management. Sign up now and start your journey to
                        triumph.
                    </p>
                    <Button primary onClick={() => navigate("/auth")}>
                        Begin Your Arc
                    </Button>
                </section>
            </main>

            <footer className="bg-blue-900 text-white py-8 px-8 text-center">
                <p className="mb-4">© 2024 GoalArc. All rights reserved.</p>
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

