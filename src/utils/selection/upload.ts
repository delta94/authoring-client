import { createDocument, Document } from '../../data/persistence';
import { configuration, relativeToAbsolute } from '../../actions/utils/config';
import * as models from '../../data/models';
import { DocumentId } from '../../data/types';
import * as Immutable from 'immutable';

// Persists a file attachment, asynchronously.  Returns a promise that
// will resolve the relative URL of the attachment 
export function createAttachment(name: string, data: any, content_type: string, 
  referencingDocumentId: DocumentId) : Promise<string> {
  
  return new Promise(function(resolve, reject) {

    // Construct a media model to store the attachment 
    const _attachments = {};
    _attachments[name] = {
      content_type,
      data
    };
    const referencingDocuments = Immutable.List.of<string>(referencingDocumentId);
    const mediaModel = new models.MediaModel({ name, _attachments, referencingDocuments });
    
    createDocument(this.props.courseId, mediaModel)
      .then((doc: Document) => {
        resolve(relativeToAbsolute(`${doc._id}/${name}`, configuration.attachmentDatabase));
      })
      .catch(err => reject(err));
  });
}