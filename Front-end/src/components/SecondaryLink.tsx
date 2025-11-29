import Link from "next/link";

interface SecondaryLinkProps {
  promptText: string;
  linkText: string;
  href: string;
  className?: string;
}

export default function SecondaryLink({
  promptText,
  linkText,
  href,
  className = ""
}: SecondaryLinkProps) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-gray-400 text-sm">
        {promptText}{" "}
        <Link
          href={href}
          className="text-green-400 hover:text-green-300 underline transition-colors duration-200"
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
}
