import * as Immutable from 'immutable';
import { DocumentId } from '../types';
import * as models from '../models';
import { credentials, getHeaders } from '../../actions/utils/credentials';
import { forceLogin, refreshTokenIfInvalid } from '../../actions/utils/keycloak';
import { CourseIdVers, CourseGuid } from 'data/types';

const fetch = (window as any).fetch;

function handleError(error: { status: string, statusText: string, message: string }, reject) {
  // The status text is the human-readable server response code from the `fetch` Response object
  if (error.statusText === 'Unauthorized') {
    forceLogin();
  } else {
    reject(error);
  }
}

export type HttpRequestParams = {
  method?: string,
  url: string,
  body?: string | FormData,
  headers?: Object,
  query?: Object,
  hasTextResult?: boolean,
};

export function authenticatedFetch(params: HttpRequestParams): Promise<Object> {

  const method = params.method ? params.method : 'GET';
  const headers = params.headers ? params.headers : getHeaders(credentials);
  const hasTextResult = params.hasTextResult ? params.hasTextResult : false;

  const { body, url, query } = params;

  let queryString = '';
  if (query && Object.keys(query).length > 0) {
    // convert query params to encoded url string
    queryString = '?' + Object.keys(query)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
      .join('&');
  }

  return new Promise((resolve, reject) => {

    refreshTokenIfInvalid()
      .then((tokenIsValid) => {

        if (!tokenIsValid) {
          forceLogin();
          return;
        }

        return fetch(url + queryString, {
          method,
          headers,
          body,
        });
      })
      .then((response: Response) => {
        if (!response.ok) {
          response.text().then((text) => {
            // Error responses from the server should always return
            // objects of type { message: string }
            let message;
            try {
              message = JSON.parse(text);
              if (message.message !== undefined) {
                message = message.message;
              }
            } catch (e) {
              message = text;
            }
            reject({
              status: response.status,
              statusText: response.statusText,
              message,
            });
          });
        } else {
          resolve(hasTextResult ? response.text() : response.json());
        }
      })
      .catch((error: { status: string, statusText: string, message: string }) => {
        handleError(error, reject);
      });
  });
}

export type RevisionId = string;

export type DocumentParams = {
  // string is course.guid, db guid
  _courseId?: string | CourseGuid | CourseIdVers,
  // A course might be the document being edited (CourseEditor.tsx)
  // documentId is generally resource.guid
  _id?: DocumentId | CourseIdVers,
  _rev?: RevisionId,
  model?: models.ContentModel,
};

const defaultDocumentParams = {
  _courseId: '',
  _id: '',
  _rev: '',
  model: Immutable.Record({ modelType: models.EmptyModel }),
};

export class Document extends Immutable.Record(defaultDocumentParams) {

  /* tslint:disable */
  _courseId?: string | CourseGuid | CourseIdVers;
  _id: DocumentId | CourseIdVers;
  _rev: RevisionId;
  /* tslint:enable */

  model: models.ContentModel;

  constructor(params?: DocumentParams) {
    params ? super(params) : super();
  }

  with(values: DocumentParams) {
    return this.merge(values) as this;
  }
}
