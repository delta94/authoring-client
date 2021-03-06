import * as Immutable from 'immutable';
import * as ct from 'data/contentTypes';
import { ContentElements } from 'data/content/common/elements';
import { ALT_FLOW_ELEMENTS, QUESTION_BODY_ELEMENTS } from 'data/content/assessment/types';
import { Part } from 'data/content/assessment/part';
import { MultipleChoice } from 'data/content/assessment/multiple_choice';
import { FillInTheBlank } from 'data/content/assessment/fill_in_the_blank';
import { Ordering } from 'data/content/assessment/ordering';
import { Text } from 'data/content/assessment/text';
import { ShortAnswer } from 'data/content/assessment/short_answer';
import { Essay } from 'data/content/assessment/essay';
import { Numeric } from 'data/content/assessment/numeric';
import { Feedback } from 'data/content/assessment/feedback';
import { Response } from 'data/content/assessment/response';
import { Unsupported } from 'data/content/unsupported';
import { Variable, Variables } from 'data/content/assessment/variable';
import createGuid from 'utils/guid';
import { getKey } from 'data/common';
import { augment, getChildren, setId, ensureIdGuidPresent } from 'data/content/common';
import { ContiguousText, InlineEntities } from 'data/content/learning/contiguous';
import { ImageHotspot } from 'data/content/assessment/image_hotspot/image_hotspot';
import { containsDynaDropCustom } from 'editors/content/utils/common';
import {
  updateHTMLLayoutTargetRefs,
} from 'editors/content/learning/dynadragdrop/utils';
import { Custom } from 'data/content/assessment/custom';
import { pipe } from 'utils/utils';
import { Inline } from 'slate';
import { map } from 'data/utils/map';
import { Maybe } from 'tsmonad';
import { saveToLocalStorage, loadFromLocalStorage } from 'utils/localstorage';
import { currentMarks } from 'editors/content/learning/contiguoustext/utils';

export type InputRefChanges = {
  additions: Immutable.List<ct.InputRef>;
  deletions: Immutable.List<ct.InputRef>;
};

export type Item = MultipleChoice | FillInTheBlank | Ordering | Essay
  | ShortAnswer | Numeric | Text | ImageHotspot | Unsupported;

export type QuestionParams = {
  id?: string;
  body?: ContentElements;
  concepts?: Immutable.List<string>;
  skills?: Immutable.Set<string>;
  grading?: string;
  items?: Immutable.OrderedMap<string, Item>;
  parts?: Immutable.OrderedMap<string, Part>;
  explanation?: ContentElements;
  variables?: Immutable.OrderedMap<string, Variable>;
  guid?: string;
};

const defaultQuestionParams = {
  contentType: 'Question',
  elementType: 'question',
  id: '',
  body: new ContentElements(),
  concepts: Immutable.List<string>(),
  skills: Immutable.Set<string>(),
  grading: 'automatic',
  items: Immutable.OrderedMap<string, Item>(),
  parts: Immutable.OrderedMap<string, Part>(),
  explanation: new ContentElements(),
  variables: Immutable.OrderedMap<string, Variable>(),
  guid: '',
};

const defaultItem = new ShortAnswer().toPersistence();
const defaultPart = new Part().toPersistence();


// This returns the input array, but trimmed to remove any 'extra'
// part instances beyond the number that should be there
export function filterOutExtraParts(parts: Part[], sizeOfInputs: number): Part[] {
  if (parts.length > sizeOfInputs) {
    return parts.slice(0, parts.length - (parts.length - sizeOfInputs));
  }
  return parts;
}

// Create a map of item ids to the items
export function buildItemMap(model: Question) {

  return model.items.toArray().reduce(
    (p, c) => {
      if (c.contentType === 'Unsupported') {
        return p;
      }

      if (c.id !== undefined) {
        p[c.id] = c;
        return p;
      }

      return p;
    },
    {});

}

export function detectInputRefChanges(
  current: ContentElements, previous: ContentElements): InputRefChanges {

  const collect = (elements: ContentElements) => {
    const texts = [];
    const textCollect = (e) => {
      if (e.contentType === 'ContiguousText') {
        texts.push(e);
      }
      return e;
    };
    elements.content.toArray().forEach(el => map(textCollect, el));
    return texts;
  };

  const inputRefMap = (content: ContentElements): Immutable.Map<string, Inline> =>
    collect(content)
      .reduce(
        (refMap: Immutable.Map<string, Inline>, c: ContiguousText) =>
          refMap.concat(
            c.getEntitiesByType(InlineEntities.InputRef)
              .reduce(
                (tempMap, ref) => tempMap.set(ref.data.get('value').input, ref.data.get('value')),
                Immutable.Map(),
              )).toMap(),
        Immutable.Map());

  const currentRefMap = inputRefMap(current);
  const previousRefMap = inputRefMap(previous);

  const currentKeys = Immutable.Set.fromKeys(currentRefMap);
  const previousKeys = Immutable.Set.fromKeys(previousRefMap);

  // Find the changes by comparing the current and previous lists of input_refs
  return {
    additions: currentRefMap.filter((_, key) =>
      currentKeys.subtract(previousKeys).contains(key)).toList() as any,
    deletions: previousRefMap.filter((_, key) =>
      previousKeys.subtract(currentKeys).contains(key)).toList() as any,
  };
}

function ensureResponsesExist(model: Question) {
  const itemsArray = model.items.toArray();
  const partsArray = model.parts.toArray();
  let updated = model;

  for (let i = 0; i < itemsArray.length; i += 1) {
    const item = itemsArray[i];
    let part = partsArray[i];

    if (item.contentType === 'MultipleChoice') {
      if (item.select === 'single') {

        // Make sure that there are n responses for n choices
        const choiceCount = item.choices.size;
        const responseCount = part.responses.size;

        let difference = choiceCount - responseCount;
        while (difference > 0) {

          const f = new Feedback();
          const feedback = Immutable.OrderedMap<string, Feedback>();
          const response = new Response().with({ feedback: feedback.set(f.guid, f) });
          part = part.with({ responses: part.responses.set(response.guid, response) });
          difference -= 1;

        }
        if (choiceCount - responseCount > 0) {
          updated = updated.with({ parts: updated.parts.set(part.guid, part) });
        }
      } else if (item.select === 'multiple') {
        const removeWildcards = item.choices.size <= 1;
        part.responses.forEach((res) => {
          // remove responses with a wildcard
          if (removeWildcards && res.match === '*') {
            updated = updated.with({
              parts: updated.parts.set(part.guid, part.with({
                responses: part.responses.delete(res.guid),
              })),
            });
            // fix matches with leading comma
          } else if (res.match.length && res.match.substring(0, 1) === ',') {
            updated = updated.with({
              parts: updated.parts.set(part.guid, part.with({
                responses: part.responses.set(res.guid, res.with({
                  match: res.match.substring(1),
                })),
              })),
            });
          }
        });
      }
    }
  }
  return updated;
}

// If skills are found only at the question level, duplicate them
// at the part level.
// Originally, this migrated from concepts to concepts. After
// adding a new 'skillref' attribute to the DTD, the skills now
// are added to the skills set. This function looks to see if
// the concepts list has any skills present and adds them to the new
// skills set.
function migrateSkillsToParts(model: Question): Question {

  const partsArray = model.parts.toArray();
  let updated = model;

  const noSkillsAtParts: boolean = partsArray.every(p => p.skills.size === 0);
  const skillsAtQuestion: boolean = model.skills.size > 0 || model.concepts.size > 0;

  if (skillsAtQuestion && noSkillsAtParts) {

    // Handle migrating from either skills or concepts
    const { skills, concepts } = model;
    const from = skills.size > 0 ? skills : Immutable.Set<string>(concepts);

    updated = model.with({
      parts: model.parts.map(p => p.with({ skills: from })).toOrderedMap(),
      skills: Immutable.Set<string>(),
    });
  }

  return updated;

}

function migrateThenSyncFeedbackAndExplanation(model: Question): Question {
  const itemsArray = model.items.toArray();

  const isShortAnswerOrEssay = itemsArray.length === 1
    && (itemsArray[0].contentType === 'ShortAnswer'
      || itemsArray[0].contentType === 'Essay');

  // We only want to target short answer and essay questions.
  if (!isShortAnswerOrEssay) {
    return model;
  }

  return pipe(
    migrateFeedbackToExplanation,
    syncExplanationWithFeedback)
    (model);
}

/* In the past, we incorrectly mapped short answer/essay explanations to feedback
  because we thought that all questions used feedback instead of explanation. We later found
  that this was not the case.

  For short answer and essay questions, OLI displays both feedback and explanation to the
  student in formative assessments and only the explanation in summative assessments.

  We now only expose the explanation in the editor. If we detect that there is feedback present but
  no explanation, that means we must have migrated it in the past, so this function migrates the
  feedback back to explanation.

  Long story short, if feedback exists && feedback != 'migrated' && explanation does not exist,
  then migrate feedback to explanation.
*/
function migrateFeedbackToExplanation(model: Question): Question {

  const partsArray = model.parts.toArray();

  // Feedback is stored on the part, so if there's no part then there's nothing to do.
  if (!partsArray[0]) {
    return model;
  }

  const responses = partsArray[0].responses;

  // If we have no feedback to migrate, there's nothing to do.
  const feedback = responses.first() && responses.first().feedback.first();
  if (!feedback) {
    return model;
  }

  const feedbackText = feedback.body.extractPlainText();
  return feedbackText.caseOf({
    nothing: () => model,
    // If the feedback text reads 'migrated', then we previously set the explanation
    // to the actual feedback text, so we don't need to do anything here.
    just: (feedbackText) => {
      if (feedbackText === 'migrated' || feedbackText === '') {
        return model;
      }

      const part = partsArray[0].with({ explanation: feedback.body.clone() });

      return model.with({
        parts: model.parts.set(part.guid, part),
      });
    },
  });
}

/* Short answers and essays in formative assessments show both the feedback and the explanation
  to the student, so we need this function to keep them in sync because we only expose the
  explanation to the author in the editor.

  This function assumes feedback has already been migrated to explanation so no data will be lost.
*/
function syncExplanationWithFeedback(model: Question): Question {

  const partsArray = model.parts.toArray();

  const responses = partsArray[0].responses;
  const explanation = partsArray[0].explanation;

  // If we have no explanation to sync or no response, there's nothing to do.
  if (!explanation || responses.size === 0) {
    return model;
  }

  const feedback = responses.first() && responses.first().feedback.first().with({
    body: explanation.clone(),
  });

  const response = responses.first();
  const part = partsArray[0].with({
    responses: responses.set(
      response.guid,
      response.with({ feedback: Immutable.OrderedMap([[feedback.guid, feedback]]) }),
    ),
  });

  return model.with({
    parts: model.parts.set(part.guid, part),
  });
}

// Cloning an input question requires that we:
// 1. update the input attribute of all input_ref entities found in the
//    question body to point to the newly assigned item id.
// 2. update the response input attribute to point to the newly assigned
//    item id.
function cloneInputQuestion(question: Question): Question {

  // The approach here is to gust clone the whole thing first, then
  // go back and post-process to make the updates that we need:

  const cloned: Question = ensureIdGuidPresent(question.with({
    body: question.body.clone(),
    explanation: question.explanation.clone(),
    parts: question.parts.mapEntries(([_, v]) => {
      const clone: Part = v.clone();
      return [clone.guid, clone];
    }).toOrderedMap() as Immutable.OrderedMap<string, Part>,
    items: question.items.mapEntries(([_, v]) => {
      const clone: Item = v.clone();
      return [clone.guid, clone];
    }).toOrderedMap() as Immutable.OrderedMap<string, Item>,
  }));

  // Calculate the mapping of old item ids to new item ids
  const itemMap = {};
  const newItems = cloned.items.toArray();
  question.items.toArray().forEach(
    (item, index) => itemMap[(item as any).id] = (newItems[index] as any).id);

  // First do update #1 - update all input_ref input attributes to point
  // to the new item ids
  const body = cloned.body.with({
    content: cloned.body.content.map((c) => {
      if (c.contentType === 'ContiguousText') {
        return (c as ContiguousText).updateInputRefs(itemMap);
      }
      return c;
    }).toOrderedMap(),
  });


  // Now do update #2 - set the response input attr to point to the new item id
  const parts = cloned.parts.map((part) => {
    return part.with({
      responses: part.responses.map((response) => {
        if (itemMap[response.input] !== undefined) {
          return response.with({ input: itemMap[response.input] });
        }
        return response;
      }).toOrderedMap(),
    });
  }).toOrderedMap();

  return cloned.with({
    body,
    parts,
  });
}

function cloneDragDropQuestion(question: Question): Question {
  // Remap existing value ids to newly assigned ones, storing
  // the mapping in valueMap for later use.
  const valueMap = {};
  const inputMap = {};

  // Clone all the choices using first item as a template,
  // but assign new values and track the mapping of old choice values to new ones
  const fitb = question.items.first() as FillInTheBlank;
  const choices = fitb.choices.map((choice) => {
    const value = createGuid();
    valueMap[choice.value] = value;

    return choice.clone().with({
      value,
    });
  }).toOrderedMap();

  const items = question.items.map((item: FillInTheBlank) => {
    const id = createGuid();
    inputMap[item.id] = id;

    return (item as FillInTheBlank).with({
      id,
      choices,
    });
  }).toOrderedMap();

  // Now clone parts, but post process to update the match and input attributes
  // of response objects to use the new choice values
  const initialPartsClone = question.parts.map(p => p.clone()).toOrderedMap();
  const parts = initialPartsClone.map((part) => {
    return part.with({
      responses: part.responses.map((response) => {
        return response.with({
          match: valueMap[response.match],
          input: inputMap[response.input],
        });
      }).toOrderedMap(),
    });
  }).toOrderedMap();

  const customContent = (question.body.content.find(ce => ce.contentType === 'Custom') as Custom);
  let clonedCustomContent = customContent.clone();

  // update targetArea targets to use new values
  clonedCustomContent = clonedCustomContent.with({
    layoutData: clonedCustomContent.layoutData.lift(ld =>
      updateHTMLLayoutTargetRefs(valueMap, inputMap, ld)),
  });

  return ensureIdGuidPresent(question.with({
    body: question.body.with({
      content: question.body.content.set(customContent.guid, clonedCustomContent),
    }).clone(),
    explanation: question.explanation.clone(),
    parts,
    items,
  }));
}

// Cloning a single select multiple choice question requires that
// we update the choice#value attribute in lock step with the
// response#match attribute:
function cloneMultipleChoiceQuestion(question: Question): Question {

  // Remap existing value ids to newly assigned ones, storing
  // the mapping in valueMap for later use.
  const valueMap = {};
  const items = question.items.map((item) => {

    // Clone all the choices, but assign new values and track
    // the mapping of old choice values to new ones
    const mc = item as MultipleChoice;
    const choices = mc.choices.map((choice) => {
      const value = createGuid();
      valueMap[choice.value] = value;

      return choice.clone().with({
        value,
      });
    }).toOrderedMap();

    return (item as MultipleChoice).with({
      id: createGuid(),
      choices,
    });
  }).toOrderedMap();

  // Now clone parts, but post process to update the match attribute
  // of response objects to use the new choice values
  const initialPartsClone = question.parts.map(p => p.clone()).toOrderedMap();
  const parts = initialPartsClone.map((part) => {
    return part.with({
      responses: part.responses.map((response) => {
        return response.with({ match: valueMap[response.match] });
      }).toOrderedMap(),
    });
  }).toOrderedMap();

  return ensureIdGuidPresent(question.with({
    body: question.body.clone(),
    explanation: question.explanation.clone(),
    parts,
    items,
  }));
}

// This ensures that existing input-based questions (aka Numeric, Text, FillInTheBlank)
// have the 'input' attribute specified on all the responses. This input attr is
// required only when there is more than one item in the question - but we have to
// add it in all cases (in case someone goes and edits to add a second item)
function ensureInputAttrsExist(question: Question): Question {

  let modifiedQuestion = question;

  question.items.toArray().forEach((item, index) => {

    if (item.contentType === 'Numeric'
      || item.contentType === 'Text' || item.contentType === 'FillInTheBlank') {

      const originalPart = question.parts.toArray()[index];
      const responses = originalPart.responses
        .map(response => response.with({ input: item.id })).toOrderedMap();
      const part = originalPart.with({ responses });

      modifiedQuestion = modifiedQuestion.with(
        { parts: modifiedQuestion.parts.set(part.guid, part) });
    }
  });

  return modifiedQuestion;
}

// There's a bug that causes responses to sometimes be saved with "match" values that should
// correspond to an associated answer choice, but the match points to a missing choice instead.
// This removes the responses with no matching answer choice instead of fixing the root cause.
function removeResponsesWithNoMatch(question: Question): Question {
  const isMultipleChoice = (item: Item): item is MultipleChoice => item instanceof MultipleChoice
    && item.select === 'single';

  // Only target "true" multiple choice questions (not CATA)
  if (!question.items.some(isMultipleChoice)) {
    return question;
  }

  const values: string[] = question.items.toArray().reduce((acc, item) => {
    // These question types have "choices", which have "values"
    // that correspond to the question.part.response.match
    if (isMultipleChoice(item)) {
      return acc.concat(item.choices.map(choice => choice.value).toArray());
    }
    return acc;
  }, []);

  // Remove response (question.part.response) if the match attribute does not
  // match any choice values
  return question.with({
    parts: question.parts.map((part) => {
      return part.with({
        responses: part.responses
          .filter(response => response.match === '*' || values.includes(response.match))
          .toOrderedMap(),
      });
    }).toOrderedMap(),
  });
}

const isStarMatch = match => match === '*';

export function catchallResponseOrderingIsValid(question: Question): boolean {
  // Helpers
  const responseMatches = responses => responses.map(response => response.match);
  const partStarMatches = part => responseMatches(part.responses).filter(isStarMatch);
  const partHasStarMatch = part => partStarMatches(part).size > 0;
  const isAtEnd = (indexable, x) => indexable.last() === x;

  const questionHasMultipleStarMatches =
    question.parts.some(part => partStarMatches(part).length > 1);
  const questionHasNoStarMatches = !question.parts.some(partHasStarMatch);
  const areStarMatchesAtEnd = question.parts.every(part =>
    isAtEnd(responseMatches(part.responses), '*'));

  // Logic
  if (questionHasNoStarMatches) {
    return true;
  }

  if (questionHasMultipleStarMatches) {
    return false;
  }

  return areStarMatchesAtEnd;
}

/*
See AUTHORING-2170.
Each question part has a list of responses with scores and feedback that are given to students
depending on their answer. Each response has a `match` attribute which tells OLI which
answer should receive that response. Now, some question types allow a "catchall" response to match
any answer choice that is not specifically listed by the course author. These catchall responses
have the `match` attribute set to the "*" string. OLI processes question responses in-order,
meaning that if a catchall response comes before a targeted response in the json DTO, it will
ignore all of the following targeted responses. The problem was that Echo sometimes puts the
catchall response in the middle of the targeted feedback, and so we ran into bugs where, for
example, numeric input questions could not have two correct answers because the catchall response
was overriding the second, targeted, correct response.

We added this check to correct any questions that have the catchall response saved in the middle
of the response list. It just finds the catchall response if it exists and moves it to the end
of the list.
*/
function putMatchStarResponseAtEnd(question: Question): Question {
  // Helpers
  const responsesWithoutStarMatches = responses =>
    responses.filter(({ match }) => !isStarMatch(match));

  const firstResponseWithStarMatch = (responses) => {
    const starMatches = responses.filter(({ match }) => isStarMatch(match));
    if (starMatches && starMatches.size > 1) {
      return Immutable.OrderedMap([[starMatches.first().guid, starMatches.first()]]);
    }
    return starMatches;
  };

  // Logic
  if (catchallResponseOrderingIsValid(question)) {
    return question;
  }

  return question.with({
    parts: question.parts.map(part =>
      part.with({
        responses: responsesWithoutStarMatches(part.responses)
          .concat(firstResponseWithStarMatch(part.responses))
          .toOrderedMap(),
      })).toOrderedMap(),
  });
}

function parseVariables(item: any, model: Question) {

  const vars = [];

  getChildren(item.variables).forEach((root) => {

    const id = createGuid();
    vars.push([id, Variable.fromPersistence(root, id, () => undefined)]);
  });

  return model.with({
    variables: Immutable.OrderedMap<string, Variable>(vars),
  });
}

export class Question extends Immutable.Record(defaultQuestionParams) {

  contentType: 'Question';
  elementType: 'question';
  id: string;
  body: ContentElements;
  concepts: Immutable.List<string>;
  skills: Immutable.Set<string>;
  grading: string;
  items: Immutable.OrderedMap<string, Item>;
  parts: Immutable.OrderedMap<string, Part>;
  explanation: ContentElements;
  variables: Variables;
  guid: string;

  constructor(params?: QuestionParams) {
    super(augment(params));
  }


  clone(): Question {

    const item = this.items.first();

    // If there isn't a single item, there isn't much
    // to do here at all:
    if (item === undefined) {
      return ensureIdGuidPresent(this.with({
        body: this.body.clone(),
        explanation: this.explanation.clone(),
      }));
    }

    // Otherwise, use first item to determine the
    // question type because we have to handle single select
    // multiple choice questions and any input-based questions specially
    if (item.contentType === 'MultipleChoice' && item.select === 'single') {
      return cloneMultipleChoiceQuestion(this);
    }
    if (containsDynaDropCustom(this.body)) {
      return cloneDragDropQuestion(this);
    }
    if (item.contentType === 'Numeric'
      || item.contentType === 'Text'
      || item.contentType === 'FillInTheBlank') {
      return cloneInputQuestion(this);
    }

    // All other question types can get by with just a top-down clone:
    return ensureIdGuidPresent(this.with({
      body: this.body.clone(),
      explanation: this.explanation.clone(),
      items: this.items.mapEntries(([_, v]) => {
        const clone: Item = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Item>,
      parts: this.parts.mapEntries(([_, v]) => {
        const clone: Part = v.clone();
        return [clone.guid, clone];
      }).toOrderedMap() as Immutable.OrderedMap<string, Part>,
    }));
  }

  with(values: QuestionParams) {
    return this.merge(values) as this;
  }

  removeInputRef(itemModelId: string)
    : Question {

    const content = this.body.content.map((c) => {
      if (c.contentType === 'ContiguousText') {
        return c.removeInputRef(itemModelId);
      }
      return c;
    }).toOrderedMap();

    const body = this.body.with({ content });

    return this.with({ body });
  }

  static emptyBody() {
    return ContentElements.fromText('', '', QUESTION_BODY_ELEMENTS);
  }

  // Possibly restore a question from the local storage clipboard,
  // ensuring that invalid skills are removed and all ids are changed
  static fromClipboard(validSkills: Immutable.Set<string>) : Maybe<Question> {

    const blob: any = loadFromLocalStorage('clipboard');
    if (blob === null || blob.question === undefined) {
      return Maybe.nothing();
    }

    try {
      // Deserialize and change all ids
      const question = Question
        .fromPersistence(blob, createGuid(), null)
        .clone();

      // Filter out any skills references that are not valide
      return Maybe.just(question
        .with({ skills: question.skills.intersect(validSkills) })
        .with({ parts: question.parts.map(p =>
          p.with({ skills: p.skills.intersect(validSkills) })).toOrderedMap() }));
    } catch (e) {

      return Maybe.nothing();
    }

  }

  static fromPersistence(json: any, guid: string, notify?: () => void) {

    let model = new Question({ guid });

    const question = json.question;

    model = setId(model, question, notify);

    if (question['@grading'] !== undefined) {
      model = model.with({ grading: question['@grading'] });
    }

    let body = null;

    getChildren(question).forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'variables':
          model = parseVariables(item, model);
          break;
        case 'cmd:concept':
          model = model.with(
            { concepts: model.concepts.push((item as any)['cmd:concept']['#text']) });
          break;
        case 'body':
          body = item;
          break;
        case 'essay':
          model = model.with({
            items: model.items.set(id, Essay.fromPersistence(item, id, notify)),
          });
          break;
        case 'fill_in_the_blank':
          model = model.with({
            items: model.items.set(id, FillInTheBlank.fromPersistence(item, id, notify)),
          });
          break;
        case 'image_hotspot':
          model = model.with({
            items: model.items.set(id, ImageHotspot.fromPersistence(item, id, notify)),
          });
          break;
        case 'multiple_choice':
          model = model.with({
            items: model.items.set(id, MultipleChoice.fromPersistence(item, id, notify)),
          });
          break;
        case 'numeric':
          model = model.with({
            items: model.items.set(id, Numeric.fromPersistence(item, id, notify)),
          });
          break;
        case 'ordering':
          model = model.with({
            items: model.items.set(id, Ordering.fromPersistence(item, id, notify)),
          });
          break;
        case 'part':
          model = model.with({
            parts: model.parts.set(id, Part.fromPersistence(item, id, notify)),
          });
          break;
        case 'responses':
          // read weird legacy format where individual response elements are under a
          // 'responses' element instead of a 'part'
          const copy = Object.assign({}, item);
          copy['part'] = copy['responses'];
          model = model.with({
            parts: model.parts.set(id, Part.fromPersistence(copy, id, notify)),
          });
          break;
        case 'explanation':
          model = model.with({
            explanation:
              ContentElements.fromPersistence(
                (item as any).explanation, id, ALT_FLOW_ELEMENTS, null, notify),
          });
          break;
        case 'skillref':
          model = model.with({ skills: model.skills.add((item as any).skillref['@idref']) });
          break;
        case 'short_answer':
          model = model.with({
            items: model.items.set(id, ShortAnswer.fromPersistence(item, id, notify)),
          });
          break;
        case 'text':
          model = model.with({
            items: model.items.set(id, Text.fromPersistence(item, id, notify)),
          });
          break;
        default:

      }
    });

    if (body !== null) {

      const backingTextProvider = buildItemMap(model);
      model = model.with({
        body: ContentElements.fromPersistence(
          body['body'], createGuid(), QUESTION_BODY_ELEMENTS, backingTextProvider, notify),
      });
    }

    return pipe(
      migrateSkillsToParts,
      ensureResponsesExist,
      migrateThenSyncFeedbackAndExplanation,
      ensureInputAttrsExist,
      removeResponsesWithNoMatch,
      putMatchStarResponseAtEnd,
    )(model);
  }

  toPersistence(): Object {

    const isShortAnswerOrEssay = this.items.size === 1
      && (this.items.first().contentType === 'ShortAnswer'
        || this.items.first().contentType === 'Essay');

    // For a question with no items, serialize with a default one
    const itemsAndParts = this.items.size === 0
      ? [defaultItem, defaultPart]
      : [
        ...this.items
          .toArray()
          .map(item => item.toPersistence()),
        ...filterOutExtraParts(this.parts.toArray(), this.items.size)
          // Short answers and essays in formative assessments show both the feedback and the
          // explanation to the student, so we need to keep them in sync
          .map(part => part.toPersistence({ saveExplanationToFeedback: isShortAnswerOrEssay })),
      ];

    const children = [

      { body: { '#array': this.body.toPersistence() } },

      ...this.concepts
        .toArray()
        .map(concept => ({ 'cmd:concept': { '#text': concept } })),

      ...this.skills
        .toArray()
        .map(skill => ({ skillref: { '@idref': skill } })),

      ...itemsAndParts,

      { explanation: { '#array': this.explanation.toPersistence() } },
    ];


    if (this.variables.size > 0) {
      const vars = this.variables.toArray().map(v => v.toPersistence());
      children.push({
        variables: {
          '#array': vars,
        },
      });
    }

    return {
      question: {
        '@id': this.id,
        '@grading': this.grading,
        '#array': children,
      },
    };
  }
}
