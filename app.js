import cors from 'cors';
import { app, errorHandler } from 'mu';

import { getAllAgendaItemsFromAgendaWithDocuments } from './repository';

app.use(cors());

app.get('/agendas/:agenda_id/agendaitems/files', async (req, res) => {
  if (!req.params || !req.params.agenda_id) {
    throw new Error(res, 'Agenda_id is missing.');
  }
  const agendaId = req.params.agenda_id;
  try {
    const allAgendaItemsWithDocuments = await getAllAgendaItemsFromAgendaWithDocuments(agendaId);
    const response = {};
    response.data = allAgendaItemsWithDocuments.map((attributes) => {
      return {
        type: 'files',
        id: attributes.fileId,
        attributes: {
          uri: attributes.uri,
          // name: attributes.fileName,
          // format: attributes.format,
          // size: attributes.size,
          extension: attributes.extension,
          // created: attributes.created,
          // modified: attributes.modified
        },
        relationships: {
          'document': {
            data: { id: attributes.documentId, type: 'document-versions' }
          }
        }
      };
    });
    response.included = allAgendaItemsWithDocuments.map((attributes) => {
      return {
        type: 'document-versions',
        id: attributes.documentId,
        attributes: {
          name: attributes.documentName
        }
      };
    });
    res.send(response);
  } catch (e) {
    console.log('Something went wrong', e);
    throw new Error('Something went wrong with querying the data from the database.');
  }
});

app.use(errorHandler);
