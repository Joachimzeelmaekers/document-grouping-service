import cors from 'cors';
import { app, errorHandler } from 'mu';

import { getAllAgendaItemsFromAgendaWithDocuments } from './repository';

app.use(cors());

app.get('/agendas/:agenda_id/agendaitems/documents', async (req, res) => {
  if (!req.params || !req.params.agenda_id) {
    throw new Error(res, 'agenda_id is missing.');
  }
  const agendaId = req.params.agenda_id;
  const allAgendaItemsWithDocuments = await getAllAgendaItemsFromAgendaWithDocuments(agendaId);
  const response = {};
  response.data = allAgendaItemsWithDocuments.map((attributes) => {
    return {
      type: 'document-versions',
      id: attributes.documentId,
      attributes: {
        uri: attributes.document,
        name: attributes.documentName,
        created: attributes.documentCreated,
        modified: attributes.documentModified,
        confidential: attributes.documentConfidential
      },
      relationships: {
        file: {
          data: { id: attributes.fileId, type: 'files' }
        }
      }
    };
  });
  response.included = allAgendaItemsWithDocuments.map((attributes) => {
    return {
      type: 'files',
      id: attributes.fileId,
      attributes: {
        uri: attributes.file,
        name: attributes.fileName,
        format: attributes.fileFormat,
        size: attributes.fileSize,
        extension: attributes.fileExtension,
        created: attributes.fileCreated,
        modified: attributes.fileModified
      }
    };
  });
  res.send(response);
});

app.use(errorHandler);
