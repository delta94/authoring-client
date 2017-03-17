import * as Immutable from 'immutable';
import * as types from './types';
import * as contentTypes from './contentTypes';


export type EmptyModel = 'EmptyModel';
export const EmptyModel : EmptyModel = 'EmptyModel';

export const ModelTypes = types.strEnum([
  'CourseModel',
  'CoursePermissionModel',
  'WorkbookPageModel',
  'AssessmentModel'
])

// Create an actual type
export type ModelTypes = keyof typeof ModelTypes;

export function isLockable(model: ContentModel) {
  return model.has('lock');
}

export function createModel(object: any) : ContentModel {
  switch (object.modelType) {
    case ModelTypes.CourseModel: 
      return new CourseModel(object);
    case ModelTypes.WorkbookPageModel: 
      return new WorkbookPageModel(object);
    case ModelTypes.CoursePermissionModel: 
      return new CoursePermissionModel(object);
    case ModelTypes.AssessmentModel:
      return new AssessmentModel(object);
  }
}

export type CourseModelParams = {
  title?: contentTypes.TitleContent,
  organizations?: Immutable.List<types.DocumentId>
};
const defaultCourseModel = {
  modelType: 'CourseModel',
  title: new contentTypes.TitleContent(),
  organizations: Immutable.List<types.DocumentId>()
}

export class CourseModel extends Immutable.Record(defaultCourseModel) {
    
  modelType: 'CourseModel';

  title: contentTypes.TitleContent;
  organizations: Immutable.List<types.DocumentId>;

  constructor(params?: CourseModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: CourseModelParams) {
      return this.merge(values) as this;
  }
}


export type CoursePermissionModelParams = {
  userId: types.UserId,
  courseId: types.DocumentId
};
const defaultCoursePermissionModelParams = {
  modelType: 'CoursePermissionModel',
  userId: '',
  courseId: ''
}

export class CoursePermissionModel extends Immutable.Record(defaultCoursePermissionModelParams) {
    
  modelType: 'CoursePermissionModel';

  userId: types.UserId;
  courseId: types.DocumentId; 

  constructor(params?: CoursePermissionModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: CoursePermissionModelParams) {
      return this.merge(values) as this;
  }
}

export type WorkbookPageModelParams = {
  courseId?: types.DocumentId,
  title?: contentTypes.TitleContent,
  body?: contentTypes.HtmlContent,
  lock?: contentTypes.LockContent
};
const defaultWorkbookPageModelParams = {
  modelType: 'WorkbookPageModel',
  courseId: '',
  title: new contentTypes.TitleContent(),
  body: new contentTypes.HtmlContent(),
  lock: new contentTypes.LockContent()
}

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {
    
  modelType: 'WorkbookPageModel';

  courseId: types.DocumentId;
  title: contentTypes.TitleContent;
  body: contentTypes.HtmlContent;
  lock: contentTypes.LockContent;

  constructor(params?: WorkbookPageModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: WorkbookPageModelParams) {
      return this.merge(values) as this;
  }
}

export type AssessmentModelParams = {
  courseId?: types.DocumentId,
  lock?: contentTypes.LockContent,
  title?: contentTypes.TitleContent,
  context?: contentTypes.HtmlContent,
  assessment?: contentTypes.InlineAssessmentContent
};
const defaultAssessmentModelParams = {
  modelType: 'AssessmentModel',
  courseId: '',
  lock: new contentTypes.LockContent(),
  title: new contentTypes.TitleContent(),
  context: new contentTypes.HtmlContent(),
  assessment: new contentTypes.InlineAssessmentContent()
}

export class AssessmentModel extends Immutable.Record(defaultAssessmentModelParams) {
    
  modelType: 'AssessmentModel';

  courseId: types.DocumentId;
  lock: contentTypes.LockContent;
  title: contentTypes.TitleContent;
  context: contentTypes.HtmlContent;
  assessment: contentTypes.InlineAssessmentContent;

  constructor(params?: AssessmentModelParams) {
      params ? super(contentTypes.deserialize(params)) : super();
  }

  with(values: AssessmentModelParams) {
      return this.merge(values) as this;
  }
}


export type ContentModel = 
  AssessmentModel |
  CourseModel | 
  CoursePermissionModel | 
  WorkbookPageModel;

// A pure function that takes a content model as 
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;