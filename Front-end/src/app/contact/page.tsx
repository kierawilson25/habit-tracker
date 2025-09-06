"use client";
import { useState, useEffect } from "react";
import { HiOutlineMail, HiOutlineGlobeAlt } from "react-icons/hi";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Contact() {
  const [mounted, setMounted] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("kiera.wilson025@gmail.com");
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.log("Failed to copy email");
    }
  };

  if (!mounted) {
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
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <HiOutlineMail className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Get in Touch</h1>
            <p className="text-gray-300 text-lg">
              Have questions, feedback, or suggestions? I'd love to hear from you.
            </p>
          </div>

          {/* Contact Methods */}
          <div 
            className="rounded-lg p-8 text-white"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.2)",
              borderColor: "rgba(34, 197, 94, 1)",
              border: "2px solid rgba(34, 197, 94, 1)"
            }}
          >
            <h2 className="text-xl font-semibold mb-6 text-center">Contact Information</h2>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HiOutlineMail className="text-green-600 text-xl" />
                    <div>
                      <h3 className="font-semibold text-green-800">Email</h3>
                      <p className="text-black">kiera.wilson025@gmail.com</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
                  >
                    {emailCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-gray-600 mt-3 text-sm">
                  Best for questions, feedback, or bug reports. I typically respond within 24 hours.
                </p>
              </div>

              {/* Response Time */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Response Time</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• <strong>General inquiries:</strong> Within 24 hours</p>
                  <p>• <strong>Bug reports:</strong> Within 12 hours</p>
                  <p>• <strong>Feature requests:</strong> Within 48 hours</p>
                </div>
              </div>

              {/* What to Include */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-800 mb-3">When Writing to Me</h3>
                <div className="space-y-2 text-gray-700">
                  <p>• <strong>For bugs:</strong> Describe what you were doing and what happened</p>
                  <p>• <strong>For features:</strong> Explain how it would improve your experience</p>
                  <p>• <strong>For questions:</strong> Be as specific as possible</p>
                  <p>• <strong>For feedback:</strong> Both positive and constructive feedback is welcome!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links (Optional) */}
          <div 
            className="rounded-lg p-6 text-white"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderColor: "rgba(34, 197, 94, 0.5)",
              border: "1px solid rgba(34, 197, 94, 0.5)"
            }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Connect With Me</h3>
            <div className="flex justify-center gap-4">
              {/* Replace these with your actual social media links */}
              <a
                href="https://github.com/kierawilson25/habit-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-700 text-white rounded-full hover:bg-green-600 transition-colors duration-200"
                aria-label="GitHub"
              >
                <FaGithub className="text-xl" />
              </a>

              <a
                href="https://www.linkedin.com/in/kiera-wilson-115601176/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-700 text-white rounded-full hover:bg-green-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-xl" />
              </a>
              <a
                href="https://www.thekierawilson.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-700 text-white rounded-full hover:bg-green-600 transition-colors duration-200"
                aria-label="Website"
              >
                <HiOutlineGlobeAlt className="text-xl" />
              </a>
            </div>
            <p className="text-center text-gray-300 text-sm mt-4">
              Follow for updates and behind-the-scenes content
            </p>
          </div>

          {/* FAQ Section */}
          <div 
            className="rounded-lg p-6 text-white"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderColor: "rgba(34, 197, 94, 0.5)",
              border: "1px solid rgba(34, 197, 94, 0.5)"
            }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Frequently Asked Questions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-green-300 mb-1">Can I suggest new features?</h4>
                <p className="text-gray-300">Absolutely! I'm always looking for ways to improve Grains of Sand based on user feedback.</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-300 mb-1">Is my data secure?</h4>
                <p className="text-gray-300">Yes, your privacy and data security are my top priorities. Feel free to ask about our privacy practices.</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-300 mb-1">How can I report a bug?</h4>
                <p className="text-gray-300">Send me an email with details about what you were doing when the bug occurred, and I'll investigate immediately.</p>
              </div>
            </div>
          </div>

          {/* Back to App */}
          <div className="text-center mt-6">
            <button
              onClick={() => window.history.back()}
              className="border-2 border-green-600 text-green-600 rounded px-6 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200"
            >
              ← Back to App
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}