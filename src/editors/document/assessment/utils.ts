import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import * as models from 'data/models';
import * as contentTypes from 'data/contentTypes';

/**
 * Handles question reordering in a branch mode assessment.
 *
 * @param originalPages the original view of the pages, prior to reorder
 * @param updatedNodes the updated nodes after the reordering
 * @param editDetails the details about the reordering
 */
export function handleBranchingReordering(
  assessmentId: string,
  originalPages: Immutable.OrderedMap<string, contentTypes.Page>,
  updatedNodes: Immutable.OrderedMap<string, contentTypes.Node>)
  : Immutable.OrderedMap<string, contentTypes.Page> {

  // Build a mapping for each question as to what index it was located at
  // prior to the reorder, and what index it is located at now
  const originalPageArr = originalPages.toArray();
  const mapping = originalPageArr.reduce(
    (acc, page, i) => {
      acc[page.nodes.first().guid] = [i];
      return acc;
    },
    {});
  updatedNodes.toArray().forEach((n, index) => {
    // This captures the index the question is at after the reorder
    mapping[n.guid].push(index);
  });
  // This creates an array whose indices represent the original indices,
  // and whose values are the values of the new indice
  const oldToNewIndices = Object.keys(mapping).map((k) => {
    return mapping[k][1];
  });
  const newToOldIndices = [originalPageArr.length];
  Object.keys(mapping).map((k) => {
    newToOldIndices[mapping[k][1]] = mapping[k][0];
  });

  // Now reposition the pages, do this in the most straightforward
  // manner possible by just creating new pages and placing the
  // reordered questions into these new pages
  let pages = Immutable.OrderedMap<string, contentTypes.Page>(
    updatedNodes.toArray().map((node, index) => {
      const p = new contentTypes.Page().with({
        id: 'p' + (index + 1).toString() + '_' + assessmentId,
        guid: originalPageArr[newToOldIndices[index]].guid,
        nodes: Immutable.OrderedMap<string, contentTypes.Node>([[node.guid, node]]),
      });
      return [p.guid, p];
    }));

  // Now update all feedback.lang attribute values according to the mapping,
  // being careful to clear out any backward references

  pages = Immutable.OrderedMap<string, contentTypes.Page>(pages.toArray().map((page, index) => {

    if (page.nodes.first().contentType === 'Question') {
      let q = page.nodes.first() as contentTypes.Question;
      q = updateBranchReferences(q, index, oldToNewIndices);
      const p = page.with({ nodes: page.nodes.set(q.guid, q) });
      return [p.guid, p];
    }
    return [page.nodes.first().guid, page.nodes.first()];

  }));

  return pages;
}

/**
 * Handles question deletion in a branch mode assessment.
 * @param assessmentId the assessment id
 * @param originalPages the original view of the pages, prior to deletion
 * @param guid the guid of the deleted question
 */
export function handleBranchingDeletion(
  assessmentId: string,
  originalPages: Immutable.OrderedMap<string, contentTypes.Page>,
  guid: string)
  : Immutable.OrderedMap<string, contentTypes.Page> {

  // Find the index of the removed item
  const indexOf = originalPages.toArray()
    .map(p => p.nodes.first().guid)
    .indexOf(guid);

  // Build the mapping for updating references
  const oldToNewIndices = originalPages.toArray().map((p, index) => {
    return index > indexOf ? index - 1 : index;
  });

  // Remove the page at that index, and update ids of the remaining pages,
  // and apply the references update
  return Immutable.OrderedMap<string, contentTypes.Page>(originalPages
    .delete(originalPages.toArray()[indexOf].guid)
    .toArray().map((page, index) => {

      let q;
      if (page.nodes.first().contentType === 'Question') {
        q = page.nodes.first() as contentTypes.Question;
        q = updateBranchReferences(q, index, oldToNewIndices);
      } else {
        q = page.nodes.first();
      }

      const p = page.with({
        nodes: page.nodes.set(q.guid, q),
        id: 'p' + (index + 1).toString() + '_' + assessmentId,
      });
      return [p.guid, p];
    }));

}

export function updateBranchReferences(
  q: contentTypes.Question, thisIndex, oldToNewIndices): contentTypes.Question {

  const updateFeedback = (f: contentTypes.Feedback) => {
    if (f.lang !== '') {
      const newIndex = oldToNewIndices[parseInt(f.lang, 10) - 1];
      if (newIndex > thisIndex) {
        return f.with({ lang: (newIndex + 1) });
      }
      return f.with({ lang: '' });
    }
    return f;
  };

  const updateResponse = (r: contentTypes.Response) => {
    return r.with({ feedback: r.feedback.map(f => updateFeedback(f)).toOrderedMap() });
  };

  const updatePart = (p: contentTypes.Part) => {
    return p.with({ responses: p.responses.map(r => updateResponse(r)).toOrderedMap() });
  };

  return q.with({ parts: q.parts.map(p => updatePart(p)).toOrderedMap() });
}

/**
 * Finds a node based on guid in an assessment.
 */
export function findNodeByGuid(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>, guid: string): Maybe<contentTypes.Node> {

  // Check top level nodes first
  if (nodes.has(guid)) {
    return Maybe.just(nodes.get(guid));
  }

  // Check contents of all embedded pools next
  return nodes
    .toArray()
    .reduce(
      (node, p) => {
        if (p.contentType === 'Selection') {
          if (p.source.contentType === 'Pool') {
            const pool: contentTypes.Pool = p.source;
            return node.caseOf({
              just: n => node,
              nothing: () => {
                const n = pool.questions.get(guid);
                return n === undefined
                  ? Maybe.nothing<contentTypes.Node>()
                  : Maybe.just(n);
              },
            });
          }
        }
        return node;
      },
      Maybe.nothing<contentTypes.Node>());

}

/**
 * Finds a question node based on id in an assessment.
 */
export function findQuestionById(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>, id: string): Maybe<contentTypes.Node> {

  // Check top level nodes first
  const foundQuestion = nodes.filter(n => n.contentType === 'Question')
    .find((n: contentTypes.Question) => n.id === id);
  if (foundQuestion) {
    return Maybe.just(foundQuestion);
  }

  // Check contents of all embedded pools next
  return nodes
    .toArray()
    .reduce(
      (node, p) => {
        if (p.contentType === 'Selection') {
          if (p.source.contentType === 'Pool') {
            const pool: contentTypes.Pool = p.source;
            return node.caseOf({
              just: n => node,
              nothing: () => {
                const n = pool.questions.find(q => q.id === id);
                return n === undefined
                  ? Maybe.nothing<contentTypes.Node>()
                  : Maybe.just(n);
              },
            });
          }
        }
        return node;
      },
      Maybe.nothing<contentTypes.Node>());

}

/**
 *
 * Find closest relative.  In an assessment tree, find either the given node's
 * immediate next sibling - or, if the node has no siblings, return the node's parent.
 */
export function locateNextOfKin(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>,
  guid: string): Maybe<contentTypes.Node> {

  // Check top level nodes first
  if (nodes.has(guid)) {
    return chooseRelative(nodes, guid, Maybe.nothing<contentTypes.Node>());
  }

  // Check contents of all embedded pools next
  return nodes
    .toArray()
    .reduce(
      (node, p) => {
        if (p.contentType === 'Selection') {
          if (p.source.contentType === 'Pool') {
            const pool: contentTypes.Pool = p.source;
            return node.caseOf({
              just: n => node,
              nothing: () => {
                const n = pool.questions.get(guid);
                if (n !== undefined) {
                  return chooseRelative(
                    pool.questions, guid,
                    Maybe.just(p));
                }
              },
            });
          }
        }
        return node;
      },
      Maybe.nothing<contentTypes.Node>());

}

export function chooseRelative(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>,
  guid: string, parent: Maybe<contentTypes.Node>): Maybe<contentTypes.Node> {

  const arr = nodes
    .toArray();

  const index =
    arr
      .findIndex(q => q.guid === guid);

  if (nodes.size === 1) {
    return parent;
  }
  if (nodes.size === index + 1) {
    return Maybe.just(arr[index - 1]);
  }

  return Maybe.just(arr[index + 1]);
}

/**
 * Determines if the type of the assessment is restricted by the contents of
 * of the assessment (aka the model)
 * @param model the assessment model
 */
export function typeRestrictedByModel(model: models.AssessmentModel): boolean {

  const pages = model.pages.toArray();

  // The type of the assessment is restricted (i.e. cannot be changed) if
  // it contains a selection or if it contains a question that has multiple parts

  return (
    pages.reduce(
      (prev, page) => {
        return prev || page.nodes.toArray().find(n => n.contentType === 'Selection') !== undefined;
      },
      false)

    ||

    pages.reduce(
      (prev, page) => {
        if (prev) return true;
        const questions = [];
        extractFromNodes(page.nodes, questions);
        return questions.find(q => isMultipart(q)) !== undefined;
      },
      false)
  );

}

function isMultipart(q: contentTypes.Question) {
  return q.items.size > 1;
}

function extractFromNodes(
  nodes: Immutable.OrderedMap<string, contentTypes.Node>,
  questions: contentTypes.Question[]) {

  nodes.toArray()
    .filter(n => n.contentType === 'Question')
    .forEach(q => questions.push(q as any));

  nodes.toArray()
    .filter(n => n.contentType === 'Selection')
    .forEach((selection) => {
      if (selection.contentType === 'Selection') {
        if (selection.source.contentType === 'Pool') {
          selection.source.questions.toArray()
            .forEach(q => questions.push(q));
        }
      }
    });

}
