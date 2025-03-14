import React, { useRef } from "react"
import { useNavigate } from "react-router-dom";
import landingImg from '../assets/landingImg.png'
import { Rocket } from "lucide-react";

import {
    Lock,
    CheckCircle,
    Calendar,
    Edit,
    FileText,
    Trash2,
    PlayCircle,
    WandSparkles,
    Timer,
    Flame,
    Trophy,
    BarChart,
    Users,
    BrainCircuit
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
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 text-blue-600">
            <Icon size={40} className="sm:w-12 sm:h-12" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-2 text-blue-900 text-center">{title}</h3>
        <p className="text-center text-sm sm:text-base text-gray-600">{description}</p>
    </div>
)

const LandingPage = () => {
    const navigate = useNavigate();
    const featuresRef = useRef(null);

    const scrollToFeatures = () => {
        featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <div className="font-sans text-gray-900 leading-normal">
            <style jsx global>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                ::-webkit-scrollbar {
                    display: none;
                }

                /* Hide scrollbar for IE, Edge and Firefox */
                * {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `}</style>
            <main>
                <section className="relative bg-gradient-to-br from-blue-600 to-blue-900 text-white py-32 px-4 md:px-8 overflow-hidden ">
                    <div className="absolute inset-0 bg-blue-900 opacity-20 z-0 "></div>
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                        <div className="text-left space-y-8">
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                                <span className="block">GoalArc</span>
                                <span className="block text-blue-300">
                                    Bridge Your Tasks to Triumph
                                    <span className="inline-block align-middle ml-2 text-blue-100 mb-4">
                                        <Rocket size={58} />
                                    </span>
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl font-light max-w-xl text-indigo-100">
                                {/* Stay organized, boost productivity, and never miss a deadline with GoalArc's innovative task management
                                system powered by AI and gamification. */}
                                Stay organized, boost productivity, and hit every deadline with GoalArc’s AI-powered Task Management System.
                            </p>
                            <div className="flex space-x-4">
                                <Button primary onClick={() => navigate("/auth")}>
                                    Get Started
                                </Button>
                                <Button onClick={scrollToFeatures}>Learn More</Button>
                            </div>
                        </div>
                        <div className="w-full h-auto relative">
                            <img
                                src={landingImg}
                                alt="GoalArc Demo Video"
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-900 to-transparent"></div>
                </section>

                <section className="py-24 px-8 bg-blue-50" id="features" ref={featuresRef}>
                    <h2 className="text-4xl font-bold text-center mb-16 text-blue-900">Key Features</h2>
                    <div className="flex flex-wrap justify-center gap-8">
                        <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-md">
                            <FeatureCard
                                Icon={Lock}
                                title="Secure Authentication"
                                description="Protect your personal tasks with our robust user management system and profile customization."
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-md">
                            <FeatureCard
                                Icon={BrainCircuit}
                                title="AI-Powered Tasks"
                                description="Create detailed task descriptions with our AI assistant that helps you define your goals clearly."
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-md">
                            <FeatureCard
                                Icon={FileText}
                                title="Markdown Support"
                                description="Format your task descriptions using Markdown for enhanced readability and organization."
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-md">
                            <FeatureCard
                                Icon={Calendar}
                                title="Calendar Integration"
                                description="Visualize your tasks on a calendar to better plan your days, weeks, and months ahead."
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-md">
                            <FeatureCard
                                Icon={Timer}
                                title="Pomodoro Timer"
                                description="Boost your productivity with customizable Pomodoro sessions linked directly to your tasks."
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-md">
                            <FeatureCard
                                Icon={Flame}
                                title="Streak Tracking"
                                description="Build consistent habits by tracking your daily task completion streaks and setting new records."
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-md">
                            <FeatureCard
                                Icon={Trophy}
                                title="Leaderboard"
                                description="Compete with other users on the productivity leaderboard to stay motivated and engaged."
                            />
                        </div>
                        <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-md">
                            <FeatureCard
                                Icon={BarChart}
                                title="Productivity Analytics"
                                description="Track your productivity metrics and gain insights into your work patterns and efficiency."
                            />
                        </div>
                        
                    </div>
                </section>

                <section className="bg-gradient-to-br from-blue-100 to-blue-300 py-24 px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6 text-blue-900">Elevate Your Productivity with GoalArc</h2>
                    <p className="text-xl max-w-2xl mx-auto mb-10 text-blue-800">
                        Join thousands of users who have transformed their task management with our AI-powered platform. Sign up now and start your journey to
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

