export interface PropDefinition {
  name: string;
  type: string;
  defaultValue?: string;
  required: boolean;
  description: string;
}

interface PropTableProps {
  props: PropDefinition[];
}

export default function PropTable({ props }: PropTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Prop Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Default
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Required
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-black divide-y divide-gray-700">
          {props.map((prop, index) => (
            <tr key={index} className="hover:bg-gray-900 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-green-400">
                {prop.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                {prop.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                {prop.defaultValue || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {prop.required ? (
                  <span className="px-2 py-1 text-xs bg-red-900 text-red-300 rounded">
                    Required
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                    Optional
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-300">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
