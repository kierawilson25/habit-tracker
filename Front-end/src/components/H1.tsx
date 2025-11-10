interface H1Props {
  text: string;
  className?: string;
}

export const H1: React.FC<H1Props> = ({ text, className = '' }) => {
  return (
    <h1 className={`w-full flex justify-center text-4xl sm:text-6xl font-bold mb-8 text-green-500 ${className}`}>
      {text}
    </h1>
  );
};

