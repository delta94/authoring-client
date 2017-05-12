import * as Immutable from "immutable";
import * as types from "./types";
import * as contentTypes from "./contentTypes";
import {getKey} from "./common";
import guid from "../utils/guid";
import {Skill} from "./skills";
import {MetaData} from "./metadata";
import {WebContent} from "./webcontent";
import {Resource} from "./resource";

export type EmptyModel = 'EmptyModel';
export const EmptyModel: EmptyModel = 'EmptyModel';

export const ModelTypes = types.strEnum([
    'CourseModel',
    'CoursePermissionModel',
    'WorkbookPageModel',
    'AssessmentModel',
    'MediaModel',
    'OrganizationModel',
    'LearningObjectiveModel',
    'SkillModel'
])

// Create an actual type
export type ModelTypes = keyof typeof ModelTypes;

export function isLockable(model: ContentModel) {
    return model.has('lock');
}

export function createModel(object: any): ContentModel {
    console.log("createModel ()");
    switch (object.type) {
        case 'x-oli-package':
            console.log("create CourseModel Model");
            return CourseModel.fromPersistence(object);
        case 'x-oli-workbook_page':
            return WorkbookPageModel.fromPersistence(object);
        case 'x-oli-assessment':
            return AssessmentModel.fromPersistence(object);
        case 'x-oli-organization':
            return OrganizationModel.fromPersistence(object);
        case 'x-oli-learning_objectives':
            return LearningObjectiveModel.fromPersistence(object);
        case 'x-oli-skill_model':
            return SkillModel.fromPersistence(object);
        case 'x-oli-webcontent':
            return MediaModel.fromPersistence(object);
    }
    // switch (object.modelType) {
    //   case ModelTypes.CourseModel:
    //     return CourseModel.fromPersistence(object);
    //   case ModelTypes.WorkbookPageModel:
    //     return WorkbookPageModel.fromPersistence(object);
    //   case ModelTypes.CoursePermissionModel:
    //     return CoursePermissionModel.fromPersistence(object);
    //   case ModelTypes.AssessmentModel:
    //     return AssessmentModel.fromPersistence(object);
    //   case ModelTypes.MediaModel:
    //     return MediaModel.fromPersistence(object);
    //   case ModelTypes.OrganizationModel:
    //     return OrganizationModel.fromPersistence(object);
    //   case ModelTypes.LearningObjectiveModel:
    //     return LearningObjectiveModel.fromPersistence(object);
    //   case ModelTypes.SkillModel:
    //     return SkillModel.fromPersistence(object);
    // }
}

export type CourseModelParams = {
    rev?: number,
    guid?: string,
    id?: string,
    version?: string,
    title?: string,
    type?: string,
    description?: string,
    metadata?: MetaData,
    options?: string,
    icon?: WebContent,
    resources?: Immutable.OrderedMap<string, Resource>,
    webContents?: Immutable.OrderedMap<string, WebContent>
    // organizations?: Immutable.List<types.DocumentId>,
    // learningobjectives?: Immutable.List<types.DocumentId>,
    // skills?: Immutable.List<types.DocumentId>
};

const defaultCourseModel = {
    modelType: 'CourseModel',
    rev: 0,
    guid: '',
    id: '',
    version: '',
    type: '',
    title: '',
    description: '',
    metadata: new MetaData(),
    options: '',
    icon: new WebContent(),
    resources: Immutable.OrderedMap<string, Resource>(),
    webContents: Immutable.OrderedMap<string, WebContent>()
    // organizations: Immutable.List<types.DocumentId>(),
    // learningobjectives: Immutable.List<types.DocumentId>(),
    // skills: Immutable.List<types.DocumentId>()
}

export class CourseModel extends Immutable.Record(defaultCourseModel) {

    modelType: 'CourseModel';

    rev: number;
    guid: string;
    id: string;
    version: string;
    title: string;
    type: string;
    description: string;
    metadata: MetaData;
    options: string;
    icon: WebContent;
    resources: Immutable.OrderedMap<string, Resource>;
    webContents: Immutable.OrderedMap<string, WebContent>;
    // organizations: Immutable.List<types.DocumentId>;
    // learningobjectives: Immutable.List<types.DocumentId>;
    // skills: Immutable.List<types.DocumentId>;

    constructor(params?: CourseModelParams) {
        params ? super(params) : super();
    }

    with(values: CourseModelParams) {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): CourseModel {
        let model = new CourseModel();
        const c = json as any;
        model = model.with({rev: c.rev});
        model = model.with({guid: c.guid});
        model = model.with({id: c.id});
        model = model.with({version: c.version});
        model = model.with({title: c.title});
        model = model.with({type: c.type});
        model = model.with({description: c.description});
        model = model.with({options: JSON.stringify(c.options)});
        if (c.metadata.jsonObject) {
            model = model.with({metadata: MetaData.fromPersistence(c.metadata.jsonObject)});
        }
        if (c.icon) {
            model = model.with({icon: WebContent.fromPersistence(c.icon)});
        }
        if (c.resources) {
            c.resources.forEach(item => {
                const id = item.guid;
                model = model.with({resources: model.resources.set(id, Resource.fromPersistence(item))});
            });
        }
        if (c.webContents) {
            c.webContents.forEach(item => {
                const id = item.guid;
                model = model.with({webContents: model.webContents.set(id, WebContent.fromPersistence(item))});
            });
        }
        // model = model.with({ organizations: Immutable.List<types.DocumentId>(c.organizations) });
        // model = model.with({ learningobjectives: Immutable.List<types.DocumentId>(c.learningobjectives) });
        // model = model.with({ skills: Immutable.List<types.DocumentId>(c.skills) });
        return model;
    }

    toPersistence(): Object {
        const values = {
            modelType: 'CourseModel',
            rev: this.rev,
            guid: this.guid,
            id: this.id,
            version: this.version,
            title: this.title,
            type: this.type,
            description: this.description,
            metadata: this.metadata.toPersistence(),
            options: this.options,
            icon: this.icon.toPersistence(),
            resources: [...this.resources.toArray().map(resource => resource.toPersistence())],
            webContents: [...this.webContents.toArray().map(webContent => webContent.toPersistence())],
            // organizations: this.organizations.toArray(),
            // learningobjectives: this.learningobjectives.toArray(),
            // skills: this.skills.toArray(),
        }
        return Object.assign({}, values);
    }
}

export type OrganizationModelParams = {
    title?: contentTypes.Title
};

const defaultOrganizationModel = {
    modelType: 'OrganizationModel',
    title: new contentTypes.Title(),
}

export class OrganizationModel extends Immutable.Record(defaultOrganizationModel) {
    modelType: 'OrganizationModel';
    title: contentTypes.Title;

    constructor(params?: OrganizationModelParams) {
        params ? super(params) : super();
    }

    with(values: OrganizationModelParams) {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): OrganizationModel {
        return new OrganizationModel();
    }

    toPersistence(): Object {
        return {};
    }
}

export type MediaModelParams = {
    name?: string,
    _attachments?: any,
    referencingDocuments?: Immutable.List<types.DocumentId>
};
const defaultMediaModelParams = {
    modelType: 'MediaModel',
    name: '',
    _attachments: {},
    referencingDocuments: Immutable.List<types.DocumentId>()
}

export class MediaModel extends Immutable.Record(defaultMediaModelParams) {

    modelType: 'MediaModel';

    name: string;
    _attachments: any;
    referencingDocuments: Immutable.List<types.DocumentId>

    constructor(params?: MediaModelParams) {
        params ? super(params) : super();
    }

    with(values: MediaModelParams) {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): MediaModel {
        let model = new MediaModel();
        let m = json as any;
        model = model.with({name: m.name});
        model = model.with({_attachments: m._attachments});
        model = model.with({referencingDocuments: Immutable.List<types.DocumentId>(m.referencingDocuments)});

        return model;
    }

    toPersistence(): Object {
        return {
            modelType: 'MediaModel',
            name: this.name,
            _attachments: this._attachments,
            referencingDocuments: this.referencingDocuments.toArray()
        };
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
        params ? super(params) : super();
    }

    with(values: CoursePermissionModelParams) {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): CoursePermissionModel {
        const model = new CoursePermissionModel();
        const p = json as any;
        return model.with({userId: p.userId, courseId: p.courseId});
    }

    toPersistence(): Object {
        return {
            modelType: 'CoursePermissionModel',
            userId: this.userId,
            courseId: this.courseId
        };
    }
}

export type WorkbookPageModelParams = {
    courseId?: types.DocumentId,
    head?: contentTypes.Head,
    body?: contentTypes.Html,
    lock?: contentTypes.Lock
};

const defaultWorkbookPageModelParams = {
    modelType: 'WorkbookPageModel',
    courseId: '',
    head: new contentTypes.Head(),
    body: new contentTypes.Html(),
    lock: new contentTypes.Lock()
}

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {

    modelType: 'WorkbookPageModel';

    courseId: types.DocumentId;
    head: contentTypes.Head;
    body: contentTypes.Html;
    lock: contentTypes.Lock;

    constructor(params?: WorkbookPageModelParams) {
        params ? super(params) : super();
    }

    with(values: WorkbookPageModelParams) {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): WorkbookPageModel {
        let model = new WorkbookPageModel();

        let wb = (json as any);

        if (wb.lock !== undefined) {
            model = model.with({lock: contentTypes.Lock.fromPersistence(wb.lock)});
        }
        if (wb.courseId !== undefined) {
            model = model.with({courseId: wb.courseId});
        }

        wb.workbook_page['#array'].forEach(item => {

            const key = getKey(item);
            const id = guid();

            switch (key) {
                case 'head':
                    model = model.with({head: contentTypes.Head.fromPersistence(item, id)})
                    break;
                case 'body':
                    model = model.with({body: contentTypes.Html.fromPersistence(item, id)})
                    break;
                default:
            }
        });

        return model;
    }

    toPersistence(): Object {

        const root = {
            "courseId": this.courseId,
            "modelType": "WorkbookPageModel",
            "workbook_page": {
                "#array": [
                    this.head.toPersistence(),
                    {body: this.body.toPersistence()}
                ]
            }
        };

        return Object.assign({}, root, this.lock.toPersistence());
    }
}

export type AssessmentModelParams = {
    courseId?: types.DocumentId,
    lock?: contentTypes.Lock,
    title?: contentTypes.Title,
    nodes?: Immutable.OrderedMap<string, Node>
};
const defaultAssessmentModelParams = {
    modelType: 'AssessmentModel',
    courseId: '',
    lock: new contentTypes.Lock(),
    title: new contentTypes.Title(),
    nodes: Immutable.OrderedMap<string, Node>()
}


export type Node = contentTypes.Question | contentTypes.Content | contentTypes.Unsupported;

export class AssessmentModel extends Immutable.Record(defaultAssessmentModelParams) {

    modelType: 'AssessmentModel';

    courseId: types.DocumentId;
    lock: contentTypes.Lock;
    title: contentTypes.Title;
    nodes: Immutable.OrderedMap<string, Node>;

    constructor(params?: AssessmentModelParams) {
        params ? super(params) : super();
    }

    with(values: AssessmentModelParams): AssessmentModel {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): AssessmentModel {

        let model = new AssessmentModel();

        let a = (json as any);

        if (a.lock !== undefined) {
            model = model.with({lock: contentTypes.Lock.fromPersistence(a.lock)});
        }
        if (a.courseId !== undefined) {
            model = model.with({courseId: a.courseId});
        }

        a.assessment['#array'].forEach(item => {

            const key = getKey(item);
            const id = guid();

            switch (key) {
                case 'title':
                    model = model.with({title: contentTypes.Title.fromPersistence(item, id)})
                    break;
                case 'question':
                    model = model.with({nodes: model.nodes.set(id, contentTypes.Question.fromPersistence(item, id))})
                    break;
                case 'content':
                    model = model.with({nodes: model.nodes.set(id, contentTypes.Content.fromPersistence(item, id))})
                    break;
                default:
                    model = model.with({nodes: model.nodes.set(id, contentTypes.Unsupported.fromPersistence(item, id))})
            }
        });

        return model;
    }

    toPersistence(): Object {
        const children = [
            this.title.toPersistence(),
            ...this.nodes.toArray().map(node => node.toPersistence()),
        ]
        const root = {
            "courseId": this.courseId,
            "modelType": "AssessmentModel",
            "assessment": {
                "@id": "id",
                "#array": children
            }
        };

        return Object.assign({}, root, this.lock.toPersistence());
    }
}

export type ContentModel =
    AssessmentModel |
    CourseModel |
    CoursePermissionModel |
    MediaModel |
    WorkbookPageModel |
    OrganizationModel |
    LearningObjectiveModel |
    SkillModel;

// A pure function that takes a content model as 
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;

//>------------------------------------------------------------------

export type LearningObjectiveModelParams = {
    title?: contentTypes.Title
};

const defaultLearningObjectiveModel = {
    modelType: 'LearningObjectiveModel',
    title: new contentTypes.Title(),
}

export class LearningObjectiveModel extends Immutable.Record(defaultLearningObjectiveModel) {
    modelType: 'LearningObjectiveModel';
    title: contentTypes.Title;

    constructor(params?: LearningObjectiveModelParams) {
        params ? super(params) : super();
    }

    with(values: LearningObjectiveModelParams) {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): LearningObjectiveModel {
        return new LearningObjectiveModel();
    }

    toPersistence(): Object {
        return {};
    }
}

//>------------------------------------------------------------------

export type SkillModelParams = {
    title?: contentTypes.Title,
    skills: any
};

const defaultSkillModel = {
    modelType: 'SkillModel',
    title: new contentTypes.Title(),
    skillDefaults: Skill,
    skills: []
}

export class SkillModel extends Immutable.Record(defaultSkillModel) {
    modelType: 'SkillModel';
    title: contentTypes.Title;
    skillDefaults: Skill;
    skills: Array<Skill>;

    constructor(params?: SkillModelParams) {
        console.log("constructor ()");
        params ? super(params) : super();
        //super();
        //console.log ("constructor postcheck: " + JSON.stringify (this.skills));
    }

    /*
     with(values: SkillModelParams) {
     return this.merge(values) as this;
     }
     */

    static updateModel(newSkillModel: any): SkillModel {
        console.log("updateModel ()");
        var newModel = new SkillModel({'skills': newSkillModel});
        return newModel;
    }

    toPersistence(): Object {
        console.log("toPersistence ()");
        const root = {
            "modelType": "SkillModel",
            "title": this.title,
            "skills": this.skills
        };

        //return Object.assign({}, root, this.lock.toPersistence());
        return (root);
    }

    static fromPersistence(json: Object): SkillModel {
        console.log("SkillModel: fromPersistence ()");

        var replacementSkills: Array<Skill> = new Array<Skill>();

        let skillData: Array<Skill> = json ["skills"];

        console.log("Parsing: (" + skillData.length + ")" + JSON.stringify(skillData));

        for (let i = 0; i < skillData.length; i++) {
            console.log("Adding new skill [" + i + "] ...");
            let newSkill: Skill = new Skill();
            newSkill.fromJSONObject(skillData [i]);

            replacementSkills.push(newSkill);
        }

        console.log("New skill list: " + JSON.stringify(replacementSkills));

        return (SkillModel.updateModel(replacementSkills))
    }
}
