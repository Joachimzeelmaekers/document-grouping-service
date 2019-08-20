import cors from 'cors';
import { app, errorHandler } from 'mu';
const { getAllAgendaItemsFromAgendaWithDocuments } = require('./repository');

app.use(cors());

app.get('/getDocumentsFromAgenda/:agenda_id', async (req, res) => {
  const agenda_id = req.params.agenda_id;
  const allAgendaItemsWithDocuments = await getAllAgendaItemsFromAgendaWithDocuments(agenda_id);

  res.send({ allAgendaItemsWithDocuments });
});

app.use(errorHandler);
