"use client";
import { useState, useEffect } from "react";
import { HiOutlineCamera, HiOutlineInformationCircle } from "react-icons/hi";
import { FaBug } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import { H1, TextBox, Container, Button, Loading, PageLayout } from "@/components";

export default function BugReport() {
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    severity: "Medium"
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
      


      // TODO: Replace with your actual API endpoint
      const { data, error } = await supabase
        .from('bug_reports')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            steps_to_reproduce: formData.stepsToReproduce,
            expected_behavior: formData.expectedBehavior,
            actual_behavior: formData.actualBehavior,
            severity: formData.severity
          }
        ])
        .select()

        if (error) throw error

      console.log('Bug report submitted:', data)
      alert('Bug report submitted successfully!')

        setSubmitSuccess(true);
        // Reset form
        setFormData({
          title: "",
          description: "",
          stepsToReproduce: "",
          expectedBehavior: "",
          actualBehavior: "",
          severity: "Medium",
        });
        // Reset file input

    } catch (error) {
      setSubmitError('Failed to submit bug report. Please try again.');
      console.error('Error submitting bug report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return <Loading />
  }

  if (submitSuccess) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="flex flex-col gap-6">
          <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HiOutlineInformationCircle className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Thank You!</h1>
              <p className="text-gray-300 text-lg mb-6">
                Your bug report has been submitted successfully. I'll investigate and get back to you soon.
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setFormData({
                      title: "",
                      description: "",
                      stepsToReproduce: "",
                      expectedBehavior: "",
                      actualBehavior: "",
                      severity: "Medium",
                    });
                  }}
                  type="primary"
                  className="mr-4"
                >
                  Submit Another Report
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  type="primary"
                  variant="outline"
                >
                  ← Back to App
                </Button>
              </div>
            </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="2xl">
      <div className="flex flex-col gap-6">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FaBug className="text-white text-3xl" />
            </div>
            <H1 text="Report a Bug" />
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
          <Container color="blue">
            <h3 className="text-lg font-semibold mb-4 text-center flex items-center justify-center gap-2 text-white">
              <HiOutlineInformationCircle className="text-xl" />
              Tips for Better Bug Reports
            </h3>
            <div className="space-y-3 text-sm text-white">
              <p>• <strong>Be specific:</strong> Include exact error messages and what you clicked</p>
              <p>• <strong>Include steps:</strong> Help me reproduce the issue on my end</p>
              <p>• <strong>Add screenshots:</strong> A picture is worth a thousand words</p>
              <p>• <strong>Mention your device:</strong> Browser, operating system, screen size (auto-detected)</p>
              <p>• <strong>Check the severity:</strong> Help me prioritize fixes appropriately</p>
            </div>
          </Container>

          {/* Bug Report Form */}
          <form onSubmit={handleSubmit}>
            <Container color="red" padding="lg">
              <h2 className="text-xl font-semibold mb-6 text-center text-white">Bug Details</h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div style={{ marginBottom: 0 }}>
                  <TextBox
                    label="Bug Title *"
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Brief description of the issue"
                    className="w-full rounded-lg bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
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



                {/* Submit Button */}
                <div className="text-center pt-4">
                  <Button
                    htmlType="submit"
                    type="danger"
                    disabled={isSubmitting || !formData.title || !formData.description}
                    className="px-8 py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Bug Report"}
                  </Button>
                </div>
              </div>
            </Container>
          </form>

          {/* Device Info Preview */}
          <Container color="green">
            <h3 className="text-lg font-semibold mb-4 text-center text-white">Auto-Detected Device Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-white">
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
          </Container>

          {/* Back to App */}
          <div className="text-center mt-6">
            <Button
              onClick={() => window.history.back()}
              type="danger"
              variant="outline"
            >
              ← Back to App
            </Button>
          </div>
      </div>
    </PageLayout>
  );
}