import React from "react";
// We'll use react-d3-tree for convenience. The consumer should install it: `npm install react-d3-tree`
import Tree from "react-d3-tree";

// TreeView accepts a single treeData object created by parser.astToVizFormat
interface TreeViewProps {
  treeData: any; // Replace 'any' with a more specific type if available
}

export default function TreeView({ treeData }: TreeViewProps) {
  if (!treeData) {
    return (
      <div style={{ padding: 12, color: "#666" }}>
        Parse tree will appear here after analysis.
      </div>
    );
  }

  // react-d3-tree expects an array of root nodes
  const data = [treeData];

  // center the root by transform in a responsive way
  const containerStyles = { width: "100%", height: "100%" };

  return (
    <div style={containerStyles}>
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
