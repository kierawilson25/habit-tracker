"use client";
import { useState } from "react";
import { colorPalette, componentCategories } from "@/constants/designSystem";
import ColorSwatch from "@/components/design-system/ColorSwatch";
import PropTable, { PropDefinition } from "@/components/design-system/PropTable";
import CodeBlock from "@/components/design-system/CodeBlock";
import { Button, PageLayout, Container, H1, TextBox, Checkbox, EditableHabitInput, AlertBox, Loading, Toast, PopupBanner, SecondaryLink, PageHeader, StatCard, HabitCell, StreakCell } from "@/components";
import { FaBug } from "react-icons/fa";

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

            {/* PageLayout Component */}
            <section id="pagelayout" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">PageLayout</h2>
              <p className="text-gray-300 mb-8">
                A standardized page wrapper that provides consistent max-width, padding, and dark background styling across all pages.
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "children",
                      type: "ReactNode",
                      required: true,
                      description: "Page content"
                    },
                    {
                      name: "maxWidth",
                      type: '"sm" | "md" | "lg" | "xl" | "2xl"',
                      defaultValue: '"md"',
                      required: false,
                      description: "Maximum width of the content container"
                    },
                    {
                      name: "padding",
                      type: '"sm" | "md" | "lg"',
                      defaultValue: '"md"',
                      required: false,
                      description: "Padding around the content"
                    },
                    {
                      name: "className",
                      type: "string",
                      required: false,
                      description: "Additional CSS classes"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { PageLayout } from "@/components";

<PageLayout maxWidth="lg" padding="lg">
  <h1>My Page Title</h1>
  <p>Page content goes here...</p>
</PageLayout>`}
                />
              </div>
            </section>

            {/* Container Component */}
            <section id="container" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">Container</h2>
              <p className="text-gray-300 mb-8">
                A colored container box with rounded corners, border, and customizable padding for grouping related content.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="space-y-4">
                  <Container color="green" padding="md">
                    <p className="text-white">Green Container</p>
                  </Container>
                  <Container color="blue" padding="md">
                    <p className="text-white">Blue Container</p>
                  </Container>
                  <Container color="red" padding="md">
                    <p className="text-white">Red Container</p>
                  </Container>
                  <Container color="yellow" padding="md">
                    <p className="text-white">Yellow Container</p>
                  </Container>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "children",
                      type: "ReactNode",
                      required: true,
                      description: "Container content"
                    },
                    {
                      name: "color",
                      type: '"green" | "blue" | "red" | "yellow"',
                      defaultValue: '"green"',
                      required: false,
                      description: "Container color theme"
                    },
                    {
                      name: "padding",
                      type: '"sm" | "md" | "lg"',
                      defaultValue: '"md"',
                      required: false,
                      description: "Container padding size"
                    },
                    {
                      name: "className",
                      type: "string",
                      required: false,
                      description: "Additional CSS classes"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { Container } from "@/components";

<Container color="blue" padding="lg">
  <h2>Feature Highlight</h2>
  <p>Important information goes here</p>
</Container>`}
                />
              </div>
            </section>

            {/* H1 Component */}
            <section id="h1" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">H1</h2>
              <p className="text-gray-300 mb-8">
                A standardized page title component with consistent green styling and responsive sizing.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <H1 text="Welcome to Grains of Sand" />
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "text",
                      type: "string",
                      required: true,
                      description: "The heading text to display"
                    },
                    {
                      name: "className",
                      type: "string",
                      required: false,
                      description: "Additional CSS classes"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { H1 } from "@/components";

<H1 text="My Page Title" />`}
                />
              </div>
            </section>

            {/* TextBox Component */}
            <section id="textbox" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">TextBox</h2>
              <p className="text-gray-300 mb-8">
                A comprehensive input field with label, error handling, password toggle, and character limit support.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="space-y-4 max-w-md">
                  <TextBox
                    label="Email"
                    type="email"
                    name="email"
                    id="email-demo"
                    value=""
                    onChange={() => {}}
                    placeholder="Enter your email"
                  />
                  <TextBox
                    label="Password"
                    type="password"
                    name="password"
                    id="password-demo"
                    value=""
                    onChange={() => {}}
                    showPasswordToggle={true}
                  />
                  <TextBox
                    label="Name"
                    type="text"
                    name="name"
                    id="name-demo"
                    value=""
                    onChange={() => {}}
                    error={true}
                    errorMessage="This field is required"
                  />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "label",
                      type: "string",
                      required: true,
                      description: "Input label text"
                    },
                    {
                      name: "type",
                      type: "string",
                      defaultValue: '"text"',
                      required: false,
                      description: "HTML input type"
                    },
                    {
                      name: "name",
                      type: "string",
                      required: true,
                      description: "Input name attribute"
                    },
                    {
                      name: "id",
                      type: "string",
                      required: true,
                      description: "Input id attribute"
                    },
                    {
                      name: "value",
                      type: "string",
                      required: true,
                      description: "Input value"
                    },
                    {
                      name: "onChange",
                      type: "(e: React.ChangeEvent<HTMLInputElement>) => void",
                      required: true,
                      description: "Change handler function"
                    },
                    {
                      name: "required",
                      type: "boolean",
                      defaultValue: "false",
                      required: false,
                      description: "Whether field is required"
                    },
                    {
                      name: "placeholder",
                      type: "string",
                      required: false,
                      description: "Placeholder text"
                    },
                    {
                      name: "disabled",
                      type: "boolean",
                      defaultValue: "false",
                      required: false,
                      description: "Disable the input"
                    },
                    {
                      name: "showPasswordToggle",
                      type: "boolean",
                      defaultValue: "false",
                      required: false,
                      description: "Show password visibility toggle"
                    },
                    {
                      name: "error",
                      type: "boolean",
                      defaultValue: "false",
                      required: false,
                      description: "Show error state"
                    },
                    {
                      name: "errorMessage",
                      type: "string",
                      required: false,
                      description: "Error message to display"
                    },
                    {
                      name: "maxLength",
                      type: "number",
                      required: false,
                      description: "Maximum character length"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { TextBox } from "@/components";

const [email, setEmail] = useState("");

<TextBox
  label="Email Address"
  type="email"
  name="email"
  id="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@example.com"
  required
/>`}
                />
              </div>
            </section>

            {/* Checkbox Component */}
            <section id="checkbox" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">Checkbox</h2>
              <p className="text-gray-300 mb-8">
                A custom checkbox component that launches confetti when checked! Perfect for habit tracking.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="space-y-3 max-w-md">
                  <Checkbox label="Complete daily exercise" checked={false} onChange={() => {}} />
                  <Checkbox label="Drink 8 glasses of water" checked={true} onChange={() => {}} />
                  <Checkbox label="Read for 30 minutes" checked={false} onChange={() => {}} />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "label",
                      type: "string",
                      required: true,
                      description: "Checkbox label text"
                    },
                    {
                      name: "checked",
                      type: "boolean",
                      required: true,
                      description: "Checked state"
                    },
                    {
                      name: "onChange",
                      type: "(checked: boolean) => void",
                      required: true,
                      description: "Change handler that receives boolean"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { Checkbox } from "@/components";

const [isChecked, setIsChecked] = useState(false);

<Checkbox
  label="Morning meditation"
  checked={isChecked}
  onChange={(checked) => setIsChecked(checked)}
/>`}
                />
              </div>
            </section>

            {/* EditableHabitInput Component */}
            <section id="editablehabitinput" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">EditableHabitInput</h2>
              <p className="text-gray-300 mb-8">
                An editable input field with edit/save/delete actions, perfect for managing habit names.
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "value",
                      type: "string",
                      required: true,
                      description: "Input value"
                    },
                    {
                      name: "onChange",
                      type: "(value: string) => void",
                      required: true,
                      description: "Change handler"
                    },
                    {
                      name: "onSave",
                      type: "() => void",
                      required: true,
                      description: "Save handler"
                    },
                    {
                      name: "onDelete",
                      type: "() => void",
                      required: true,
                      description: "Delete handler"
                    },
                    {
                      name: "onEdit",
                      type: "() => void",
                      required: true,
                      description: "Edit handler"
                    },
                    {
                      name: "disabled",
                      type: "boolean",
                      required: true,
                      description: "Whether input is disabled (viewing mode)"
                    },
                    {
                      name: "placeholder",
                      type: "string",
                      required: false,
                      description: "Placeholder text"
                    },
                    {
                      name: "maxLength",
                      type: "number",
                      defaultValue: "50",
                      required: false,
                      description: "Maximum character length"
                    },
                    {
                      name: "name",
                      type: "string",
                      required: true,
                      description: "Input name attribute"
                    },
                    {
                      name: "id",
                      type: "string",
                      required: true,
                      description: "Input id attribute"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { EditableHabitInput } from "@/components";

const [habitName, setHabitName] = useState("Exercise");
const [isEditing, setIsEditing] = useState(false);

<EditableHabitInput
  value={habitName}
  onChange={setHabitName}
  onSave={() => {
    setIsEditing(false);
    // Save to database
  }}
  onDelete={() => {
    // Delete habit
  }}
  onEdit={() => setIsEditing(true)}
  disabled={!isEditing}
  name="habit1"
  id="habit1"
/>`}
                />
              </div>
            </section>

            {/* AlertBox Component */}
            <section id="alertbox" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">AlertBox</h2>
              <p className="text-gray-300 mb-8">
                A colored alert box for displaying error, success, info, or warning messages.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="space-y-4">
                  <AlertBox type="success">
                    <strong>Success!</strong> Your changes have been saved.
                  </AlertBox>
                  <AlertBox type="error">
                    <strong>Error:</strong> Something went wrong. Please try again.
                  </AlertBox>
                  <AlertBox type="info">
                    <strong>Info:</strong> This is an informational message.
                  </AlertBox>
                  <AlertBox type="warning">
                    <strong>Warning:</strong> Please review before proceeding.
                  </AlertBox>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "children",
                      type: "ReactNode",
                      required: true,
                      description: "Alert content"
                    },
                    {
                      name: "type",
                      type: '"error" | "success" | "info" | "warning"',
                      defaultValue: '"info"',
                      required: false,
                      description: "Alert type/color scheme"
                    },
                    {
                      name: "className",
                      type: "string",
                      required: false,
                      description: "Additional CSS classes"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { AlertBox } from "@/components";

<AlertBox type="success">
  <strong>Success!</strong> Your habit has been created.
</AlertBox>

<AlertBox type="error">
  <strong>Error:</strong> Unable to save changes.
</AlertBox>`}
                />
              </div>
            </section>

            {/* Loading Component */}
            <section id="loading" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">Loading</h2>
              <p className="text-gray-300 mb-8">
                A full-screen loading indicator with animated text and cursor.
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "text",
                      type: "string",
                      defaultValue: '"Loading..."',
                      required: false,
                      description: "Loading text to display"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { Loading } from "@/components";

if (isLoading) {
  return <Loading text="Loading your habits..." />;
}`}
                />
              </div>
            </section>

            {/* Toast Component */}
            <section id="toast" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">Toast</h2>
              <p className="text-gray-300 mb-8">
                A temporary notification that appears at the top of the screen and auto-dismisses after 3 seconds.
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "message",
                      type: "string",
                      required: true,
                      description: "Toast message text"
                    },
                    {
                      name: "visible",
                      type: "boolean",
                      required: true,
                      description: "Whether toast is visible"
                    },
                    {
                      name: "onClose",
                      type: "() => void",
                      required: true,
                      description: "Handler called when toast closes"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { Toast } from "@/components";

const [showToast, setShowToast] = useState(false);
const [toastMessage, setToastMessage] = useState("");

const handleSave = () => {
  // Save logic...
  setToastMessage("Changes saved successfully!");
  setShowToast(true);
};

<Toast
  message={toastMessage}
  visible={showToast}
  onClose={() => setShowToast(false)}
/>`}
                />
              </div>
            </section>

            {/* PopupBanner Component */}
            <section id="popupbanner" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">PopupBanner</h2>
              <p className="text-gray-300 mb-8">
                An animated celebration banner that slides down from the top, perfect for milestone achievements.
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "isVisible",
                      type: "boolean",
                      required: true,
                      description: "Whether banner is currently visible"
                    },
                    {
                      name: "isAnimating",
                      type: "boolean",
                      required: true,
                      description: "Whether banner is animating"
                    },
                    {
                      name: "title",
                      type: "string",
                      required: true,
                      description: "Banner title"
                    },
                    {
                      name: "message",
                      type: "string",
                      required: true,
                      description: "Banner message"
                    },
                    {
                      name: "badge",
                      type: "string",
                      required: false,
                      description: "Optional badge text (e.g., streak count)"
                    },
                    {
                      name: "icon",
                      type: "string",
                      defaultValue: '"⭐"',
                      required: false,
                      description: "Emoji icon to display"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { PopupBanner } from "@/components";

const [showBanner, setShowBanner] = useState(false);
const [isAnimating, setIsAnimating] = useState(false);

<PopupBanner
  isVisible={showBanner}
  isAnimating={isAnimating}
  title="Milestone Reached!"
  message="You've completed 7 days in a row!"
  badge="7 Day Streak"
  icon="🔥"
/>`}
                />
              </div>
            </section>

            {/* SecondaryLink Component */}
            <section id="secondarylink" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">SecondaryLink</h2>
              <p className="text-gray-300 mb-8">
                A secondary navigation link with prompt text, commonly used on auth pages.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="space-y-3">
                  <SecondaryLink
                    promptText="Don't have an account?"
                    linkText="Sign up"
                    href="/sign-up"
                  />
                  <SecondaryLink
                    promptText="Already have an account?"
                    linkText="Log in"
                    href="/login"
                  />
                  <SecondaryLink
                    promptText="Forgot your password?"
                    linkText="Reset it"
                    href="/reset-password"
                  />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "promptText",
                      type: "string",
                      required: true,
                      description: "Prompt text before the link"
                    },
                    {
                      name: "linkText",
                      type: "string",
                      required: true,
                      description: "Link text"
                    },
                    {
                      name: "href",
                      type: "string",
                      required: true,
                      description: "Link destination"
                    },
                    {
                      name: "className",
                      type: "string",
                      required: false,
                      description: "Additional CSS classes"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { SecondaryLink } from "@/components";

<SecondaryLink
  promptText="Don't have an account?"
  linkText="Sign up"
  href="/sign-up"
/>`}
                />
              </div>
            </section>

            {/* PageHeader Component */}
            <section id="pageheader" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">PageHeader</h2>
              <p className="text-gray-300 mb-8">
                A page header with icon, title (H1), and optional subtitle in a consistent layout.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="space-y-8">
                  <PageHeader
                    icon={<FaBug className="w-10 h-10 text-white" />}
                    iconBgColor="red"
                    title="Report a Bug"
                    subtitle="Help us improve by reporting issues"
                  />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "icon",
                      type: "ReactNode",
                      required: true,
                      description: "Icon element to display"
                    },
                    {
                      name: "iconBgColor",
                      type: '"red" | "green" | "blue" | "yellow" | "purple"',
                      defaultValue: '"green"',
                      required: false,
                      description: "Background color for icon container"
                    },
                    {
                      name: "title",
                      type: "string",
                      required: true,
                      description: "Page title"
                    },
                    {
                      name: "subtitle",
                      type: "string",
                      required: false,
                      description: "Optional subtitle text"
                    },
                    {
                      name: "className",
                      type: "string",
                      required: false,
                      description: "Additional CSS classes"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { PageHeader } from "@/components";
import { FaBug } from "react-icons/fa";

<PageHeader
  icon={<FaBug className="w-10 h-10 text-white" />}
  iconBgColor="red"
  title="Report a Bug"
  subtitle="Help us improve by reporting issues"
/>`}
                />
              </div>
            </section>

            {/* StatCard Component */}
            <section id="statcard" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">StatCard</h2>
              <p className="text-gray-300 mb-8">
                A colored card for displaying statistics with a large value and descriptive label.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatCard value={42} label="Total Habits" color="green" />
                  <StatCard value="87%" label="Completion Rate" color="blue" />
                  <StatCard value={15} label="Current Streak" color="yellow" />
                  <StatCard value={234} label="Total Completions" color="purple" />
                  <StatCard value={7} label="This Week" color="pink" />
                  <StatCard value={31} label="Days Active" color="orange" />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "value",
                      type: "number | string",
                      required: true,
                      description: "Stat value to display"
                    },
                    {
                      name: "label",
                      type: "string",
                      required: true,
                      description: "Descriptive label"
                    },
                    {
                      name: "color",
                      type: '"blue" | "purple" | "yellow" | "orange" | "pink" | "green"',
                      defaultValue: '"green"',
                      required: false,
                      description: "Card color theme"
                    },
                    {
                      name: "className",
                      type: "string",
                      required: false,
                      description: "Additional CSS classes"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { StatCard } from "@/components";

<div className="grid grid-cols-3 gap-4">
  <StatCard value={42} label="Total Habits" color="green" />
  <StatCard value="87%" label="Completion Rate" color="blue" />
  <StatCard value={15} label="Current Streak" color="yellow" />
</div>`}
                />
              </div>
            </section>

            {/* HabitCell Component */}
            <section id="habitcell" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">HabitCell</h2>
              <p className="text-gray-300 mb-8">
                A styled container for a habit checkbox with green border and background.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="space-y-3 max-w-md">
                  <HabitCell title="Morning Exercise" checked={false} onChange={() => {}} />
                  <HabitCell title="Drink Water" checked={true} onChange={() => {}} />
                  <HabitCell title="Read for 30 minutes" checked={false} onChange={() => {}} />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "title",
                      type: "string",
                      required: true,
                      description: "Habit title"
                    },
                    {
                      name: "checked",
                      type: "boolean",
                      required: true,
                      description: "Checked state"
                    },
                    {
                      name: "onChange",
                      type: "(checked: boolean) => void",
                      required: true,
                      description: "Change handler"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { HabitCell } from "@/components";

<HabitCell
  title="Morning Exercise"
  checked={habits[0]?.completed}
  onChange={(checked) => updateHabit(0, checked)}
/>`}
                />
              </div>
            </section>

            {/* StreakCell Component */}
            <section id="streakcell" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">StreakCell</h2>
              <p className="text-gray-300 mb-8">
                A compact cell for displaying a habit's current streak count.
              </p>

              <div className="bg-gray-900 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
                <div className="flex gap-3">
                  <StreakCell streak={0} />
                  <StreakCell streak={7} />
                  <StreakCell streak={42} />
                  <StreakCell streak={100} />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "streak",
                      type: "number",
                      required: true,
                      description: "Current streak count"
                    }
                  ]}
                />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { StreakCell } from "@/components";

<div className="flex items-center gap-3">
  <HabitCell title="Exercise" checked={true} onChange={handleChange} />
  <StreakCell streak={habitStreak} />
</div>`}
                />
              </div>
            </section>

            {/* StreakCalendar Component */}
            <section id="streakcalendar" className="scroll-mt-20 border-t border-gray-800 pt-16">
              <h2 className="text-3xl font-bold mb-4">StreakCalendar</h2>
              <p className="text-gray-300 mb-8">
                A GitHub-style contribution calendar showing 365 days of habit completion data with interactive tooltips.
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Props</h3>
                <PropTable
                  props={[
                    {
                      name: "contributionData",
                      type: "Record<string, number>",
                      required: true,
                      description: "Object mapping dates (YYYY-MM-DD) to completion counts (0-5)"
                    }
                  ]}
                />
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Features</h3>
                <div className="bg-gray-900 rounded-lg p-6">
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Displays last 365 days of activity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Color intensity shows 0-4 habits completed (green shades)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Gold star (⭐) for perfect days (all 5 habits completed)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Interactive tooltips on tap/click</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Month labels and day-of-week indicators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>Mobile responsive with horizontal scrolling</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Usage Example</h3>
                <CodeBlock
                  code={`import { StreakCalendar } from "@/components";

// Create contribution data object
const contributionData = {
  "2025-01-15": 5,  // Perfect day - all 5 habits
  "2025-01-16": 3,  // 3 habits completed
  "2025-01-17": 1,  // 1 habit completed
  "2025-01-18": 0,  // No habits completed
  // ... more dates
};

<StreakCalendar contributionData={contributionData} />`}
                />
              </div>
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
