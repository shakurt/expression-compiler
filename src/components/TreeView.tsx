// We'll use react-d3-tree for convenience. The consumer should install it: `npm install react-d3-tree`
import Tree from "react-d3-tree";

// TreeView accepts a single treeData object created by parser.astToVizFormat
interface TreeViewProps {
  treeData: any; // Replace 'any' with a more specific type if available
}

export default function TreeView({ treeData }: TreeViewProps) {
  if (!treeData) {
    return (
      <div className="p-3 text-gray-500">
        Parse tree will appear here after analysis.
      </div>
    );
  }

  // react-d3-tree expects an array of root nodes
  const data = [treeData];

  return (
    <div className="h-full w-full">
      <Tree
        data={data}
        orientation="vertical"
        translate={{ x: 200, y: 20 }}
        collapsible={false}
        zoomable={true}
        initialDepth={Infinity}
      />
    </div>
  );
}
