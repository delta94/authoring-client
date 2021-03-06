import * as React from 'react';
import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { insertNode, removeNode } from 'data/utils/tree';
import { isSameNode } from 'editors/common/tree/utils';

import { buildRenderer as buildDivRenderer } from 'editors/common/tree/types/div';

import * as Types from 'editors/common/tree/types';

import { renderVisibleNodes } from 'editors/common/tree/render';

export interface TreeEditDetails<NodeType extends Types.HasGuid> {
  sourceModel: NodeType;
  sourceParent: Maybe<NodeType>;
  targetParent: Maybe<NodeType>;
  originalIndex: number;
  newIndex: number;
}

export interface TreeProps<NodeType extends Types.HasGuid> {

  editMode: boolean;

  // The current root nodes of the tree
  nodes: Types.Nodes<NodeType>;

  // Accessor for the children of any node, return Nothing
  // if this node cannot have children, return an empty
  // Nodes map if it can have children but currently does not.
  getChildren: Types.ChildrenAccessor<NodeType>;

  // Mutator to update the children of a node in the tree.
  setChildren: Types.ChildrenMutator<NodeType>;

  // Which nodes in the tree are expanded, Nothing represents
  // the default state where the tree will apply its
  // initialExpansionStrategy to determine which nodes should
  // be expanded
  expandedNodes: Immutable.Set<Types.NodeId>;

  // The identifier of the currently active, or selected node
  selected: Types.NodeId;

  // The type of tree UI to render
  treeType: Types.TreeType;

  // Function to execute to report that the tree data has been edited.
  // This likely includes removals and reorders.
  onEdit: (nodes: Types.Nodes<NodeType>, editDetails: TreeEditDetails<NodeType>) => void;

  // Function to execute to report that the tree has changed
  // the node expansion state.
  onChangeExpansion: (expandedNodes: Immutable.Set<Types.NodeId>) => void;

  // Function to execute to indicate that the selected - aka active -
  // node has changed.
  onSelect: (id: Types.NodeId) => void;

  // Called by the tree when a need is to be rendered.
  renderNodeComponent: Types.NodeRenderer<NodeType>;

  // Called by the tree when a potential drop is initiated.
  canHandleDrop: Types.CanDropHandler<NodeType>;

}

/**
 * Reusable tree component.
 */
export class Tree<NodeType extends Types.HasGuid>
  extends React.PureComponent<TreeProps<NodeType>, {}> {

  onDrop = (
    sourceModel: NodeType,
    sourceParent: Maybe<NodeType>,
    targetParent: Maybe<NodeType>,
    originalIndex: number,
    newIndex: number) => {

    const { nodes, getChildren, setChildren, onEdit } = this.props;
    const id = sourceModel.guid;

    // removeNode |> insertNode |> onEdit

    const removedNodes = removeNode(id, nodes, getChildren, setChildren);

    // Handle the case where the drag is from and to the same parent
    // and the drag is a lowering of the source further down the parent -
    // We have to adjust the index otherwise we will place it at the wrong
    // spot after we remove it
    const adjustedIndex = isSameNode<NodeType>(sourceParent, targetParent)
      ? originalIndex < newIndex
        ? newIndex - 1
        : newIndex
      : newIndex;

    const insertedNodes = insertNode(
      targetParent.map(p => p.guid),
      id, sourceModel, adjustedIndex, removedNodes, getChildren, setChildren);

    const editDetails = {
      sourceModel,
      sourceParent,
      targetParent,
      originalIndex,
      newIndex,
    };

    onEdit(insertedNodes, editDetails);

  }

  render() {

    const { selected, nodes, editMode, canHandleDrop,
      expandedNodes, getChildren, renderNodeComponent } = this.props;

    const handlers: Types.Handlers = {
      onSelect: nodeId => this.props.onSelect(nodeId),
      onCollapse: nodeId =>
        this.props.onChangeExpansion(this.props.expandedNodes.subtract([nodeId])),
      onExpand: nodeId =>
        this.props.onChangeExpansion(this.props.expandedNodes.add(nodeId)),
    };

    // Walk the nodes of the tree in-order, rendering each node, but being
    // careful to only render nodes that are visible (i.e. their parent is
    // is in an expanded state)
    const renderedNodes: Types.RenderedNode<NodeType>[] = renderVisibleNodes(
      nodes, getChildren, renderNodeComponent, expandedNodes, Immutable.Set([selected]), handlers);

    // Hardcoded for now to use the div-based tree renderer.
    const treeRenderer = buildDivRenderer();

    // Now simply render the tree structure, wrapping the tree and each rendered
    // node using the tree renderer.  We interleave the drop targets between
    // the rendered nodes, as well.
    const treeNodes = renderedNodes
      .map((r, i) => {
        const parentId = r.parent.caseOf({
          just: m => Maybe.just(m.guid),
          nothing: () => Maybe.nothing<string>(),
        });

        const dropTargets = [];
        if (i === renderedNodes.length - 1) {
          dropTargets.push(treeRenderer.renderDropTarget(
            r.indexWithinParent + 1, this.onDrop, canHandleDrop,
            r.parent, parentId, true, editMode));
        }

        dropTargets.push(treeRenderer.renderDropTarget(
          r.indexWithinParent, this.onDrop, canHandleDrop, r.parent, parentId, false, editMode));

        const nodeState = {
          depth: r.depth,
          indexWithinParent: r.indexWithinParent,
          parentNode: r.parent,
          isSelected: selected === r.nodeId,
        };

        return treeRenderer.renderNode(
          r.nodeId, r.node,
          nodeState,
          r.component, dropTargets, r.indexWithinParent, editMode);

      });

    return treeRenderer.renderTree(treeNodes);
  }

}
