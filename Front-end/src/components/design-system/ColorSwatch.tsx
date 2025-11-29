interface ColorSwatchProps {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
  contrast: string;
}

export default function ColorSwatch({ name, hex, rgb, usage, contrast }: ColorSwatchProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-colors">
      {/* Color Preview */}
      <div
        className="h-32 w-full cursor-pointer"
        style={{ backgroundColor: hex }}
        onClick={() => copyToClipboard(hex)}
        title="Click to copy hex value"
      />

      {/* Color Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white">{name}</h4>
          <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded">
            {contrast}
          </span>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => copyToClipboard(hex)}
            className="text-sm text-gray-300 hover:text-green-400 transition-colors font-mono block w-full text-left"
          >
            {hex}
          </button>
          <button
            onClick={() => copyToClipboard(rgb)}
            className="text-sm text-gray-400 hover:text-green-400 transition-colors font-mono block w-full text-left"
          >
            {rgb}
          </button>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          {usage}
        </p>
      </div>
    </div>
  );
}
