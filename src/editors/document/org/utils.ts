import * as Immutable from 'immutable';

import * as models from '../../../data/models';

import * as contentTypes from '../../../data/contentTypes';

export function canHandleDrop(
  id: string, sourceModel, parentModel,
  originalIndex, newIndex, newParentModel): boolean {

  let accepts = false;

  if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Sequences) {
    accepts = sourceModel.contentTypes === contentTypes.OrganizationContentTypes.Sequence
      || sourceModel.contentTypes === contentTypes.OrganizationContentTypes.Include;

  } else if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Sequence) {
    if (sourceModel.contentType === contentTypes.OrganizationContentTypes.Unit) {
      accepts = !newParentModel.children.toArray().some(
        child => child.contentType === contentTypes.OrganizationContentTypes.Module);
    } else if (sourceModel.contentType === contentTypes.OrganizationContentTypes.Module) {
      accepts = !newParentModel.children.toArray().some(
        child => child.contentType === contentTypes.OrganizationContentTypes.Unit);
    } else if (sourceModel.contentType === contentTypes.OrganizationContentTypes.Include) {
      accepts = true;
    }

  } else if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Unit) {
    const t = sourceModel.contentType;
    accepts = t === contentTypes.OrganizationContentTypes.Module
      || t === contentTypes.OrganizationContentTypes.Include
      || t === contentTypes.OrganizationContentTypes.Item;

  } else if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Module) {
    const t = sourceModel.contentType;
    accepts = t === contentTypes.OrganizationContentTypes.Section
      || t === contentTypes.OrganizationContentTypes.Include
      || t === contentTypes.OrganizationContentTypes.Item;

  } else if (newParentModel.contentType === contentTypes.OrganizationContentTypes.Section) {
    const t = sourceModel.contentType;
    accepts = (t === contentTypes.OrganizationContentTypes.Section
      || t === contentTypes.OrganizationContentTypes.Include
      || t === contentTypes.OrganizationContentTypes.Item)
      && sourceModel.guid !== newParentModel.guid;

  }

  if (accepts) {

    // Now check to see if we are repositioning within the same container
    if (parentModel.guid === newParentModel.guid) {

      const delta = newIndex - originalIndex;

      // We do not accept the drop if it isn't repositioning. In other words,
      // one cannot drag and drop an item in the drop slots directly above and below
      // the item
      return delta !== 0 && delta !== 1;

    }

    return true;
  }

  return false;
}

export function removeNode(
  model: models.OrganizationModel,
  nodeGuid: string): models.OrganizationModel {

  const sequences = model.sequences.children;
  const filtered = filterChildren(nodeGuid, sequences) as any;

  const updated = model.with(
    {
      sequences: model.sequences.with(
        { children: filtered }),
    });

  return updated;
}

export function insertNode(
  model: models.OrganizationModel,
  targetParentGuid: string,
  childToAdd: any,
  index: number): models.OrganizationModel {

  return model.with({
    sequences: model.sequences.with(
      {
        children: (model.sequences.children.map(
          insertChild.bind(undefined, targetParentGuid, childToAdd, index)).toOrderedMap() as any),
      }),
  });
}

// Returns true if this organization contains units but no modules,
// and at least one of the units contains an item
export function containsUnitsOnly(model: models.OrganizationModel): boolean {

  // This implementaition uses regular for-loops instead of functional
  // maps and reduces and forEach so that it can be optimized to fail-fast.
  let containsModule = false;
  let unitHasItem = false;
  const sequences = model.sequences.children.toArray();
  for (let i = 0; i < sequences.length; i += 1) {

    const sequenceItem = sequences[i];

    if (sequenceItem.contentType === 'Sequence') {

      const firstLevel = sequenceItem.children.toArray();
      for (let j = 0; j < firstLevel.length; j += 1) {
        const item = firstLevel[j];
        if (item.contentType === 'Module') {
          containsModule = true;
          break;
        } else if (item.contentType === 'Unit') {
          const children = item.children.toArray();
          for (let k = 0; k < children.length; k += 1) {
            const child = children[k];
            if (child.contentType === 'Module') {
              containsModule = true;
              break;
            } else if (child.contentType === 'Item') {
              unitHasItem = true;
            }
          }
        }
        if (containsModule) {
          break;
        }
      }
    }

    if (containsModule) {
      break;
    }
  }
  return !containsModule && unitHasItem;
}

export function updateNode(
  model: models.OrganizationModel,
  childToUpdate: any): models.OrganizationModel {

  // If the child is a top level sequence just handle it
  // explicitly
  if (model.sequences.children.has(childToUpdate.guid)) {
    return model.with({
      sequences: model.sequences.with(
        { children: model.sequences.children.set(childToUpdate.guid, childToUpdate) }),
    });
  }

  return model.with({
    sequences: model.sequences.with(
      {
        children: (model.sequences.children.map(
          updateChild.bind(undefined, childToUpdate)).toOrderedMap() as any),
      }),
  });
}

function updateChild(
  child: any,
  parentNode: any) {

  if (parentNode.children !== undefined && parentNode.children.get(child.guid) !== undefined) {
    return parentNode.with({ children: parentNode.children.set(child.guid, child) });

  }

  // Recurse if the current node has children
  return parentNode.children !== undefined && parentNode.children.size > 0
    ? parentNode.with(
      {
        children: parentNode.children.map(
          updateChild.bind(undefined, child)).toOrderedMap(),
      })
    : parentNode;
}

function filterChildren(
  guidToRemove: string,
  children: Immutable.OrderedMap<string, any>): Immutable.OrderedMap<string, any> {

  const filtered = children.filter(c => c.guid !== guidToRemove);
  const mapped = filtered
    .map(c => c.children !== undefined
      ? c.with({ children: filterChildren(guidToRemove, c.children) }) : c);

  return mapped
    .toOrderedMap();

}

function insertChild(
  targetParentGuid: string,
  childToAdd: any,
  index: number,
  parentNode: any) {

  if (parentNode.guid === targetParentGuid) {

    // Insert the node, don't recurse
    let nodes = Immutable.OrderedMap<string, any>();
    const arr = parentNode.children.toArray();
    arr.forEach((n, i) => {

      if (i === index) {
        nodes = nodes.set(childToAdd.guid, childToAdd);
      }

      if (n.guid !== childToAdd.guid) {
        nodes = nodes.set(n.guid, n);
      }
    });

    if (index === arr.length) {
      nodes = nodes.set(childToAdd.guid, childToAdd);
    }

    return parentNode.with({ children: nodes });

  }

  // Recurse if the current node has children
  return parentNode.children !== undefined && parentNode.children.size > 0
    ? parentNode.with(
      {
        children: parentNode.children.map(
          insertChild.bind(undefined, targetParentGuid, childToAdd, index)).toOrderedMap(),
      })
    : parentNode;
}
