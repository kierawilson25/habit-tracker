"use client";
import { useState, useEffect } from "react";
import { HiOutlineCamera, HiOutlineInformationCircle } from "react-icons/hi";
import { FaBug } from "react-icons/fa";

export default function BugReport() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    severity: "Medium",
    screenshot: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        screenshot: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Get device info for context
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString()
      };

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('stepsToReproduce', formData.stepsToReproduce);
      submitData.append('expectedBehavior', formData.expectedBehavior);
      submitData.append('actualBehavior', formData.actualBehavior);
      submitData.append('severity', formData.severity);
      submitData.append('deviceInfo', JSON.stringify(deviceInfo));
      
      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot);
      }

      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/bug-reports', {
        method: 'POST',
        body: submitData
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          title: "",
          description: "",
          stepsToReproduce: "",
          expectedBehavior: "",
          actualBehavior: "",
          severity: "Medium",
          screenshot: null
        });
        // Reset file input
        const fileInput = document.getElementById('screenshot') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error('Failed to submit bug report');
      }
    } catch (error) {
      setSubmitError('Failed to submit bug report. Please try again.');
      console.error('Error submitting bug report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="page-dark min-h-screen flex justify-center items-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="page-dark min-h-screen">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-2xl flex flex-col gap-6 p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HiOutlineInformationCircle className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
              <p className="text-gray-300 text-lg mb-6">
                Your bug report has been submitted successfully. I'll investigate and get back to you soon.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setFormData({
                      title: "",
                      description: "",
                      stepsToReproduce: "",
                      expectedBehavior: "",
                      actualBehavior: "",
                      severity: "Medium",
                      screenshot: null
                    });
                  }}
                  className="bg-green-600 text-white rounded px-6 py-2 hover:bg-green-700 transition-colors duration-200 mr-4"
                >
                  Submit Another Report
                </button>
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
      </div>
    );
  }

  return (
    <div className="page-dark min-h-screen">
      <div className="flex justify-center px-4">
        <div className="w-full max-w-2xl flex flex-col gap-6 p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FaBug className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Report a Bug</h1>
            <p className="text-gray-300 text-lg">
              Help me improve Grains of Sand by reporting any issues you encounter.
            </p>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-800">{submitError}</p>
            </div>
          )}

          {/* Tips Section */}
          <div 
            className="rounded-lg p-6 text-white"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 0.5)",
              border: "1px solid rgba(59, 130, 246, 0.5)"
            }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2">
              <HiOutlineInformationCircle className="text-xl" />
              Tips for Better Bug Reports
            </h3>
            <div className="space-y-3 text-sm">
              <p>• <strong>Be specific:</strong> Include exact error messages and what you clicked</p>
              <p>• <strong>Include steps:</strong> Help me reproduce the issue on my end</p>
              <p>• <strong>Add screenshots:</strong> A picture is worth a thousand words</p>
              <p>• <strong>Mention your device:</strong> Browser, operating system, screen size (auto-detected)</p>
              <p>• <strong>Check the severity:</strong> Help me prioritize fixes appropriately</p>
            </div>
          </div>

          {/* Bug Report Form */}
          <form onSubmit={handleSubmit}>
            <div 
              className="rounded-lg p-8 text-white"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                borderColor: "rgba(239, 68, 68, 1)",
                border: "2px solid rgba(239, 68, 68, 1)"
              }}
            >
              <h2 className="text-xl font-semibold mb-6 text-center">Bug Details</h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold mb-2">
                    Bug Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of the issue"
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold mb-2">
                    Detailed Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    placeholder="Provide a detailed description of the bug..."
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-vertical"
                  />
                </div>

                {/* Steps to Reproduce */}
                <div>
                  <label htmlFor="stepsToReproduce" className="block text-sm font-semibold mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    id="stepsToReproduce"
                    name="stepsToReproduce"
                    value={formData.stepsToReproduce}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-vertical"
                  />
                </div>

                {/* Expected vs Actual Behavior */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expectedBehavior" className="block text-sm font-semibold mb-2">
                      Expected Behavior
                    </label>
                    <textarea
                      id="expectedBehavior"
                      name="expectedBehavior"
                      value={formData.expectedBehavior}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="What should have happened?"
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-vertical"
                    />
                  </div>
                  <div>
                    <label htmlFor="actualBehavior" className="block text-sm font-semibold mb-2">
                      Actual Behavior
                    </label>
                    <textarea
                      id="actualBehavior"
                      name="actualBehavior"
                      value={formData.actualBehavior}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="What actually happened?"
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-vertical"
                    />
                  </div>
                </div>

                {/* Severity Level */}
                <div>
                  <label htmlFor="severity" className="block text-sm font-semibold mb-2">
                    Severity Level
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="Low">Low - Minor issue, doesn't affect main functionality</option>
                    <option value="Medium">Medium - Noticeable issue, workaround available</option>
                    <option value="High">High - Major issue, significantly impacts usage</option>
                    <option value="Critical">Critical - App is unusable or data loss</option>
                  </select>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label htmlFor="screenshot" className="block text-sm font-semibold mb-2">
                    Screenshot (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <HiOutlineCamera className="text-gray-400 text-xl" />
                    <input
                      type="file"
                      id="screenshot"
                      name="screenshot"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:cursor-pointer hover:file:bg-red-700"
                    />
                  </div>
                  {formData.screenshot && (
                    <p className="text-sm text-green-400 mt-2">
                      File selected: {formData.screenshot.name}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.description}
                    className="bg-red-600 text-white rounded px-8 py-3 hover:bg-red-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed text-lg font-semibold"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bug Report"}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Device Info Preview */}
          <div 
            className="rounded-lg p-6 text-white"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderColor: "rgba(34, 197, 94, 0.5)",
              border: "1px solid rgba(34, 197, 94, 0.5)"
            }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Auto-Detected Device Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Browser:</strong> {navigator.userAgent.split(' ').slice(-1)[0]}</p>
                <p><strong>Platform:</strong> {navigator.platform}</p>
              </div>
              <div>
                <p><strong>Screen:</strong> {screen.width}x{screen.height}</p>
                <p><strong>Language:</strong> {navigator.language}</p>
              </div>
            </div>
            <p className="text-center text-gray-300 text-xs mt-4">
              This information helps me understand the context of your bug report
            </p>
          </div>

          {/* Back to App */}
          <div className="text-center mt-6">
            <button
              onClick={() => window.history.back()}
              className="border-2 border-red-600 text-red-600 rounded px-6 py-2 hover:bg-red-600 hover:text-white transition-colors duration-200"
            >
              ← Back to App
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}