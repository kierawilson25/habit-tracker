interface LoadingProps {
  text?: string;
}

export default function Loading({ text = "Loading..." }: LoadingProps) {
  return (
    <div className="min-h-screen bg-black flex justify-center items-center">
      <div className="text-lg text-green-500 font-mono">
        <span className="animate-pulse">{text}</span>
        <span className="animate-ping">_</span>
      </div>
    </div>
  );
}
