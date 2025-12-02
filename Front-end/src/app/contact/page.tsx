"use client";
import { useState } from "react";
import { HiOutlineMail, HiOutlineGlobeAlt } from "react-icons/hi";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import { Button, H1, Container, Loading, PageLayout, PageHeader }  from "@/components";
import { useMounted } from "@/hooks";

export default function Contact() {
  const mounted = useMounted();
  const [emailCopied, setEmailCopied] = useState(false);

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
    return <Loading />
  }

  return (
    <PageLayout maxWidth="2xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <PageHeader
          icon={<HiOutlineMail className="text-white text-3xl" />}
          iconBgColor="green"
          title="Hey you"
          subtitle="Let's get in touch"
        />

          {/* Contact Methods */}
          <Container color="green" padding="lg">
            <h2 className="text-xl font-semibold mb-6 text-center text-white">Contact Information</h2>
            
            <div className="space-y-6">
              {/* Email */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <HiOutlineMail className="text-green-600 text-xl flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-green-800">Email</h3>
                    <p className="text-black break-all">kiera.wilson025@gmail.com</p>
                  </div>
                </div>
                <Button onClick={handleCopyEmail} type="primary" className="flex-shrink-0 w-full sm:w-auto">
                  {emailCopied ? "Copied!" : "Copy"}
                </Button>
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
          </Container>

          {/* Social Links (Optional) */}
          <Container color="green">
            <h3 className="text-lg font-semibold mb-4 text-center text-white">Connect With Me</h3>
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
          </Container>

          {/* FAQ Section */}
          <Container color="green">
            <h3 className="text-lg font-semibold mb-4 text-center text-white">Frequently Asked Questions</h3>
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
                <p className="text-gray-300">Use the 'Report a Bug' link at the bottom of any page, you can submit a description of what you encountered and I'll get right to it.</p>
              </div>
            </div>
          </Container>

          {/* Back to App */}
          <div className="text-center mt-6">
              <Button onClick={() => window.history.back()} type="primary">
                {"Back to app"}
              </Button>
          </div>
      </div>
    </PageLayout>
  );
}