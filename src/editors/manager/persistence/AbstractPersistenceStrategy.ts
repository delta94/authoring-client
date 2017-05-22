import * as models from '../../../data/models';
import * as contentTypes from '../../../data/contentTypes';
import * as persistence from '../../../data/persistence';

import {onFailureCallback, onSaveCompletedCallback, 
  PersistenceStrategy } from './PersistenceStrategy';

export interface AbstractPersistenceStrategy {
  successCallback: onSaveCompletedCallback;
  failureCallback: onFailureCallback;
  writeLockedDocumentId: string;
  courseId: string;
  destroyed: boolean;
}

export abstract class AbstractPersistenceStrategy implements PersistenceStrategy {

  constructor() {
    this.successCallback = null;
    this.failureCallback = null;
    this.writeLockedDocumentId = null;
    this.courseId = null;
    this.destroyed = false;
  }

  releaseLock(when: number) {
    
    // Release the write lock if it was acquired, but fetch
    // the document first to get the most up to date version

    if (this.writeLockedDocumentId !== null) {
      return persistence.releaseLock(this.courseId, this.writeLockedDocumentId);
    } else {
      return Promise.resolve({});
    }
  }


  /**
   * This strategy requires the user to acquire the write lock before
   * editing.
   */
  initialize(doc: persistence.Document, userName: string,
             onSuccess: onSaveCompletedCallback,
             onFailure: onFailureCallback): Promise<boolean> {

    this.successCallback = onSuccess;
    this.failureCallback = onFailure;
    
    return new Promise((resolve, reject) => {

      persistence.acquireLock(doc._courseId, doc._id)
      .then((result) => {
        if ((result as any).lockedBy === userName) {
          
          this.writeLockedDocumentId = doc._id;
          this.courseId = doc._courseId;
          onSuccess(doc);
          resolve(true);
          
        } else {
          resolve(false);
        }
      });      
    });
     
  }

  abstract save(doc: persistence.Document): void;

  /**
   * Method to that child classes must implement to allow an async
   *
   */
  abstract doDestroy(): Promise<{}>;

  /**
   * Indicate to the persistence strategy that it is being shutdown and that it
   * should clean up any resources and flush any pending changes immediately.
   */
  destroy(): Promise<{}> {
    const now = new Date().getTime();
    return this.doDestroy()
        .then(r => this.releaseLock(now));

  }
}
