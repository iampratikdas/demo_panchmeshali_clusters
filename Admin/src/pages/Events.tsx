import React, { useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import { v4 as uuidv4 } from "uuid";

interface EventNode {
  id: string;
  name: string;
  children?: EventNode[];
}

const initialData: EventNode[] = [
  {
    id: uuidv4(),
    name: "Main Event",
    children: [
      { id: uuidv4(), name: "Sub Event 1" },
      { id: uuidv4(), name: "Sub Event 2" },
    ],
  },
];

const NodeCard: React.FC<{
  node: EventNode;
  onUpdate: (id: string) => void;
  onAdd: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ node, onUpdate, onAdd, onDelete }) => (
  <div
    className="
      rounded-xl shadow-md bg-white
      p-2 sm:p-3
      min-w-[90px] sm:min-w-[120px]
      text-center
      hover:shadow-lg transition
    "
  >
    <div className="font-semibold text-xs sm:text-sm">{node.name}</div>
    <div className="flex justify-center gap-1 mt-1 flex-wrap">
      <button
        onClick={() => onUpdate(node.id)}
        className="bg-blue-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
      >
        Edit
      </button>
      <button
        onClick={() => onAdd(node.id)}
        className="bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
      >
        +
      </button>
      <button
        onClick={() => onDelete(node.id)}
        className="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded"
      >
        ×
      </button>
    </div>
  </div>
);

export default function EventOrgChart() {
  const [data, setData] = useState<EventNode[]>(initialData);

  const updateNodeName = (id: string) => {
    const newName = prompt("Enter new event name:");
    if (!newName) return;

    const updateRecursively = (node: EventNode): EventNode => {
      if (node.id === id) return { ...node, name: newName };
      return {
        ...node,
        children: node.children?.map(updateRecursively),
      };
    };

    setData((prev) =>
      prev.map((root) => updateRecursively(root))
    );
  };

  const addChildNode = (parentId: string) => {
    const newName = prompt("Enter sub-event name:");
    if (!newName) return;
    const newChild: EventNode = { id: uuidv4(), name: newName };

    const addRecursively = (node: EventNode): EventNode => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newChild],
        };
      }
      return {
        ...node,
        children: node.children?.map(addRecursively),
      };
    };

    setData((prev) =>
      prev.map((root) => addRecursively(root))
    );
  };

  const deleteNode = (id: string) => {
    // deleting a root event
    setData((prev) => {
      // if a root matches id, remove entire root
      const filtered = prev.filter((root) => root.id !== id);

      // otherwise delete inside children
      const removeRecursively = (node: EventNode): EventNode | null => {
        if (!node.children) return node;
        const newChildren = node.children
          .map((child) =>
            child.id === id ? null : removeRecursively(child)
          )
          .filter(Boolean) as EventNode[];
        return { ...node, children: newChildren };
      };

      return filtered.map((root) => removeRecursively(root)!);
    });
  };

  const renderTree = (node: EventNode): React.ReactNode => (
    <TreeNode
      label={
        <NodeCard
          node={node}
          onUpdate={updateNodeName}
          onAdd={addChildNode}
          onDelete={deleteNode}
        />
      }
      key={node.id}
    >
      {node.children?.map(renderTree)}
    </TreeNode>
  );

  const addMainEvent = () => {
    const name = prompt("Enter main event name:");
    if (!name) return;
    setData((prev) => [
      ...prev,
      { id: uuidv4(), name, children: [] },
    ]);
  };

  return (
    <div
      className="
        w-full h-screen sm:h-[600px]
        overflow-auto
        bg-gray-50 p-2 sm:p-4
      "
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={addMainEvent}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
        >
          + Add Main Event
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {data.map((root) => (
          <Tree
            key={root.id}
            lineWidth={"2px"}
            lineColor={"#d1d5db"}
            lineBorderRadius={"10px"}
            label={
              <NodeCard
                node={root}
                onUpdate={updateNodeName}
                onAdd={addChildNode}
                onDelete={deleteNode}
              />
            }
          >
            {root.children?.map(renderTree)}
          </Tree>
        ))}
      </div>
    </div>
  );
}
