import type React from "react";

import Tree from "react-d3-tree";

import type { RawNodeDatum } from "react-d3-tree";

interface TreeViewProps {
  treeData: RawNodeDatum | null;
}

const TreeView: React.FC<TreeViewProps> = ({ treeData }) => {
  if (!treeData) {
    return (
      <div className="p-3 text-gray-500">
        Parse tree will appear here after analysis.
      </div>
    );
  }

  const data = [treeData]; // Expects an array of root nodes

  return (
    <>
      <h3 className="mb-2 font-semibold">Stage 2 — Parse Tree</h3>
      <div className="h-[70vh] rounded border border-gray-300 bg-gray-700">
        <div className="h-full w-full">
          <Tree
            data={data}
            orientation="vertical"
            translate={{ x: 200, y: 20 }}
            collapsible={true}
            zoomable={true}
            initialDepth={Infinity}
            rootNodeClassName="node__root"
            branchNodeClassName="node__branch"
            leafNodeClassName="node__leaf"
          />
        </div>
      </div>
    </>
  );
};

export default TreeView;
