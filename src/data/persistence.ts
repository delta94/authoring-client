export { Document } from './persistence/common';
export { acquireLock, statusLock, releaseLock } from './persistence/lock';

export { 
  fetchCourseResources, 
  CourseResource, 
  getEditablePackages, 
  retrieveCoursePackage, 
  deleteCoursePackage,
} from './persistence/package';

export { createWebContent } from './persistence/webcontent';

export { developerRegistration } from './persistence/developer';

export {
  retrieveDocument,
  bulkFetchDocuments,
  listenToDocument,
  createDocument,
  persistDocument,
} from './persistence/document';
