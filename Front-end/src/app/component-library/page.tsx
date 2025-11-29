"use client";
import { useState } from "react";
import { colorPalette, componentCategories } from "@/constants/designSystem";
import ColorSwatch from "@/components/design-system/ColorSwatch";
import PropTable, { PropDefinition } from "@/components/design-system/PropTable";
import CodeBlock from "@/components/design-system/CodeBlock";
import { Button } from "@/components";

export default function ComponentLibraryPage() {
  const [activeSection, setActiveSection] = useState("colors");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-green-400">Grains of Sand</h1>
          </div>
          <p className="text-gray-400 text-sm hidden sm:block">Design System Documentation</p>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:sticky top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-gray-900 border-r border-gray-800 overflow-y-auto transition-transform lg:translate-x-0 z-40`}
        >
          <nav className="p-4 space-y-6">
            {/* Colors Section */}
            <div>
              <button
                onClick={() => scrollToSection("colors")}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  activeSection === "colors"
                    ? "bg-green-900 text-green-300"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="font-semibold">Color Palette</span>
              </button>
            </div>

            {/* Component Categories */}
            {Object.entries(componentCategories).map(([key, category]) => (
              <div key={key}>
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category.name}
                </h3>
                <ul className="mt-2 space-y-1">
                  {category.components.map((component) => (
                    <li key={component}>
                      <button
                        onClick={() => scrollToSection(component.toLowerCase())}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          activeSection === component.toLowerCase()
                            ? "bg-green-900 text-green-300"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        {component}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:ml-0">
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Introduction */}
            <section>
              <h2 className="text-4xl font-bold mb-4">Design System</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Welcome to the Grains of Sand component library. This documentation provides a comprehensive overview
                of all available components, their usage, and design guidelines.
              </p>
            </section>

            {/* Color Palette Section */}
            <section id="colors" className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">Color Palette</h2>
              <p className="text-gray-300 mb-8">
                Our color system is designed for accessibility and consistency. All colors meet WCAG contrast
                requirements.
              </p>

              {/* Primary Colors */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4 text-green-400">Primary - Green</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {colorPalette.primary.map((color, index) => (
                    <ColorSwatch key={index} {...color} />
                  ))}
                </div>
              </div>

              {/* Secondary Colors */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4 text-blue-400">Secondary - Blue</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {colorPalette.secondary.map((color, index) => (
                    <ColorSwatch key={index} {...color} />
                  ))}
                </div>
              </div>

              {/* Accent Colors */}
              <div className="mb-12">
                <h3 className="text-2xl font-semibold mb-4 text-red-400">Accent Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {colorPalette.accent.map((color, index) => (
                    <ColorSwatch key={index} {...color} />
                  ))}
                </div>
              </div>

              {/* Neutral Colors */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-400">Neutral Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {colorPalette.neutral.map((color, index) => (
                    <ColorSwatch key={index} {...color} />
                  ))}
                </div>
              </div>
            </section>

            {/* Button Component Documentation */}
            <section id="button" className="scroll-mt-20">
              <div className="border-t border-gray-800 pt-16">
                <h2 className="text-3xl font-bold mb-4">Button</h2>
                <p className="text-gray-300 mb-8">
                  A versatile button component with multiple variants, sizes, and states for different use cases.
                </p>

                {/* Live Preview */}
                <div className="bg-gray-900 rounded-lg p-8 mb-8">
                  <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                  <div className="space-y-6">
                    {/* Types */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Types</h4>
                      <div className="flex flex-wrap gap-4">
                        <Button type="primary">Primary</Button>
                        <Button type="primary" variant="outline">
                          Outline
                        </Button>
                        <Button type="danger">Danger</Button>
                      </div>
                    </div>

                    {/* States */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">States</h4>
                      <div className="flex flex-wrap gap-4">
                        <Button type="primary">Default</Button>
                        <Button type="primary" disabled>
                          Disabled
                        </Button>
                      </div>
                    </div>

                    {/* Full Width */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Full Width</h4>
                      <Button type="primary" fullWidth>
                        Full Width Button
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Props */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Props</h3>
                  <PropTable
                    props={[
                      {
                        name: "children",
                        type: "ReactNode",
                        required: true,
                        description: "Button content"
                      },
                      {
                        name: "type",
                        type: '"primary" | "danger"',
                        defaultValue: '"primary"',
                        required: false,
                        description: "Visual style of the button"
                      },
                      {
                        name: "variant",
                        type: '"solid" | "outline"',
                        defaultValue: '"solid"',
                        required: false,
                        description: "Variant of the button (solid or outline)"
                      },
                      {
                        name: "fullWidth",
                        type: "boolean",
                        defaultValue: "false",
                        required: false,
                        description: "Make button take full width of container"
                      },
                      {
                        name: "disabled",
                        type: "boolean",
                        defaultValue: "false",
                        required: false,
                        description: "Disable the button"
                      },
                      {
                        name: "onClick",
                        type: "() => void",
                        required: false,
                        description: "Click handler function"
                      },
                      {
                        name: "href",
                        type: "string",
                        required: false,
                        description: "URL to navigate to (renders as Link)"
                      },
                      {
                        name: "htmlType",
                        type: '"button" | "submit" | "reset"',
                        defaultValue: '"button"',
                        required: false,
                        description: "HTML button type"
                      }
                    ]}
                  />
                </div>

                {/* Colors Used */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Colors Used</h3>
                  <div className="bg-gray-900 rounded-lg p-6">
                    <ul className="space-y-2 text-gray-300">
                      <li>
                        <span className="font-mono text-green-400">Primary:</span> Green 500, Green 600 (hover)
                      </li>
                      <li>
                        <span className="font-mono text-red-400">Danger:</span> Red 500, Red 600 (hover)
                      </li>
                      <li>
                        <span className="font-mono text-gray-400">Disabled:</span> Gray 700, Gray 600
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Code Example */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                  <CodeBlock
                    code={`import { Button } from "@/components";

// Basic usage
<Button type="primary">
  Click Me
</Button>

// With onClick handler
<Button
  type="primary"
  onClick={() => console.log("Clicked!")}
>
  Submit
</Button>

// Outline variant
<Button type="primary" variant="outline">
  Secondary Action
</Button>

// Full width
<Button type="primary" fullWidth>
  Full Width Button
</Button>

// As a link
<Button type="primary" href="/dashboard">
  Go to Dashboard
</Button>

// Danger button
<Button type="danger">
  Delete Account
</Button>`}
                  />
                </div>

                {/* Accessibility */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Accessibility</h3>
                  <div className="bg-gray-900 rounded-lg p-6">
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Proper semantic HTML button or anchor elements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Keyboard accessible (Tab, Enter, Space)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Clear focus states for keyboard navigation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>WCAG AAA contrast ratios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>Disabled state prevents interaction and is announced to screen readers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Placeholder for other components */}
            <section id="textbox" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
              <p className="text-gray-300">
                Additional component documentation is being added. Use the Button component above as a template.
              </p>
            </section>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
