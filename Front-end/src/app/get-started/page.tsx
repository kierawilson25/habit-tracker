"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { HiOutlinePencil } from "react-icons/hi2";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { IoIosCheckmarkCircle } from "react-icons/io";

export default function GettingStarted() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = [
    {
      title: "Welcome to Grains of Sand",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-3xl">G</span>
          </div>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              Grains of Sand is a habit tracking tool designed to help you build trust in yourself to create consistent change.
            </p>
          </div>
            <p className="text-base text-white leading-relaxed">
              Think of these small habits as grains of sand — each one seems small but you can build a tower with grains of sand.
            </p>
        </div>
      )
    },
    {
      title: "The Philosophy: Less is More",
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4">Why Only 5 Habits?</h3>
            <p className="text-black leading-relaxed">
              Only five habits can be created, keeping you focused on small sustained change. 
              The idea is to commit to completing these habits every day until they become second nature.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-base leading-relaxed">
              • <strong>Focus over quantity:</strong> 5 habits prevent overwhelm and decision fatigue
            </p>
            <p className="text-base leading-relaxed">
              • <strong>Consistency builds trust:</strong> Daily completion builds self-confidence
            </p>
            <p className="text-base leading-relaxed">
              • <strong>Small wins compound:</strong> Simple habits create lasting change
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Adding Your First Habit",
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Let's walk through adding a habit. Here's what the interface looks like:
          </p>
          
          {/* Mock habit input */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value="Drink 8 glasses of water"
                readOnly
                className="border p-2 rounded text-black flex-1 bg-white"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-green-600 cursor-default"
                  aria-label="Edit habit"
                >
                  <HiOutlinePencil className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-red-600 cursor-default"
                  aria-label="Delete habit"
                >
                  <IoIosCloseCircleOutline className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-base">
            <p>• <strong>Type your habit:</strong> Keep it simple and specific</p>
            <p>• <strong>Click the checkmark</strong> <IoIosCheckmarkCircle className="inline h-5 w-5 text-green-500" /> <strong>to save</strong></p>
            <p>• <strong>Use the pencil</strong> <HiOutlinePencil className="inline h-4 w-4 text-gray-500" /> <strong>to edit later</strong></p>
            <p>• <strong>Use the X</strong> <IoIosCloseCircleOutline className="inline h-5 w-5 text-gray-500" /> <strong>to delete</strong></p>
          </div>
        </div>
      )
    },
    {
      title: "Tracking Your Progress",
      content: (
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Once you've added your habits, you'll see them on your main dashboard where you can check them off daily.
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Daily Reset</h3>
            <p className="text-gray-700 leading-relaxed">
              Your habits automatically reset each day at midnight, giving you a fresh start to build consistency.
            </p>
          </div>

          <div className="space-y-3 text-base">
            <p>• <strong>Check off completed habits</strong> throughout the day</p>
            <p>• <strong>Habits reset daily</strong> to maintain the routine</p>
            <p>• <strong>Focus on consistency</strong> over perfection</p>
            <p>• <strong>Small daily wins</strong> build lasting change</p>
          </div>
        </div>
      )
    },
    {
      title: "Tips for Success",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="font-semibold text-yellow-800">Start Small</h4>
              <p className="text-yellow-700">Choose habits you can do in 2-5 minutes. "Read 1 page" beats "Read for 1 hour."</p>
            </div>
            
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
              <h4 className="font-semibold text-purple-800">Be Specific</h4>
              <p className="text-purple-700">"Exercise for 10 minutes" is better than "Exercise more."</p>
            </div>
        
            
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <h4 className="font-semibold text-red-800">Forgive Yourself</h4>
              <p className="text-red-700">Miss a day? That's okay. Consistency, not perfection, builds lasting change.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNext = () => {
    if (user) {
      router.push("/add-habit");
    } else {
      router.push("/sign-up");
    }
  };

  const getSkipText = () => {
    if (user) {
      return "Skip tutorial and go to dashboard";
    } else {
      return "Skip tutorial and sign up";
    }
  };

  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  const secondaryButtonClass = "border-2 border-green-600 text-green-600 rounded px-4 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200"

  const getFinalButtonText = () => {
    if (user) {
      return "Go to Dashboard!";
    } else {
      return "Sign Up to Start!";
    }
  };

  if (!mounted || loading) {
    return (
      <div className="page-dark min-h-screen flex justify-center items-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-dark min-h-screen">
      <div className="flex justify-center px-4">
        <div className="w-full max-w-2xl flex flex-col gap-6 p-8">
        
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-300">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div 
          className="rounded-lg p-8 min-h-96 text-center hover:scale-105 transition-transform duration-200"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            borderColor: "rgba(34, 197, 94, 1)",
            border: "2px solid rgba(34, 197, 94, 1)"
          }}
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-white">
            {steps[currentStep].title}
          </h1>
          
          <div className="mb-8 text-white text-left">
            {steps[currentStep].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
        { currentStep < 1 ? (<button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="border-2 border-black text-black rounded px-4 py-2 hover:bg-black-600 hover:text-black transition-colors duration-200"
          >
            Previous
          </button>) : (<button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={currentStep === 0 ? secondaryButtonClass + " opacity-50 cursor-not-allowed" : secondaryButtonClass}
          >
            Previous
          </button>)}

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentStep 
                    ? 'bg-green-500' 
                    : index < currentStep 
                      ? 'bg-green-300' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={goToNext}
              className={activeButtonClass + " px-6 font-semibold"}
            >
              {getFinalButtonText()}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className={activeButtonClass}
            >
              Next
            </button>
          )}
        </div>

        {/* Skip option */}
        <div className="text-center mt-4">
          <button
            onClick={goToNext}
            className="text-green-300 hover:text-green-100 text-sm underline transition-colors duration-200 opacity-75"
          >
            {getSkipText()}
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}