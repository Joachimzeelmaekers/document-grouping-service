import { sparqlEscapeString, sparqlEscapeUri, query } from 'mu';

const GRAPH = process.env.MU_APPLICATION_GRAPH || 'http://mu.semte.ch/application';

const getAllAgendaItemsFromAgendaWithDocuments = async (agendaId) => {
  const queryString = `
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX besluitvorming: <http://data.vlaanderen.be/ns/besluitvorming#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX dbpedia: <http://dbpedia.org/ontology/>
  PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
  PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>

  SELECT DISTINCT ?document ?documentName ?documentId ?documentCreated ?documentModified ?documentConfidential
      ?file ?fileId ?fileFormat ?fileSize ?fileExtension ?fileCreated ?fileModified
  FROM ${sparqlEscapeUri(GRAPH)}
  WHERE {
      ?agenda a besluitvorming:Agenda ;
              mu:uuid ${sparqlEscapeString(agendaId)} ;
              ext:agendaNaam ?agendaName ;
              dct:hasPart ?agendaitem .
      ?agendaitem mu:uuid ?agendaitemId ;
          ext:prioriteit ?agendaitemPrio ;
          ext:bevatAgendapuntDocumentversie ?document .

      ?document a dossier:Stuk ;
          dct:title ?documentName ;
          mu:uuid ?documentId ;
          ext:file ?file .
      OPTIONAL { ?document dct:created ?documentCreated }
      OPTIONAL { ?document dct:modified ?documentModified }
      OPTIONAL { ?document ext:vertrouwelijk ?documentConfidential }

      ?file a nfo:FileDataObject ;
          mu:uuid ?fileId .
      OPTIONAL { ?file nfo:fileName ?fileName . }
      OPTIONAL { ?file dct:format ?fileFormat . }
      OPTIONAL { ?file nfo:fileSize ?fileSize . }
      OPTIONAL { ?file dbpedia:fileExtension ?fileExtension . }
      OPTIONAL { ?file dct:created ?fileCreated . }
      OPTIONAL { ?file dct:modified ?fileModified . }
  }`;
  const data = await query(queryString);
  return parseSparqlResults(data);
};

const parseSparqlResults = (data) => {
  if (!data) return;
  const vars = data.head.vars;
  return data.results.bindings.map((binding) => {
    const obj = {};
    vars.forEach((varKey) => {
      if (binding[varKey]) {
        obj[varKey] = binding[varKey].value;
      }
    });
    return obj;
  });
};

module.exports = { getAllAgendaItemsFromAgendaWithDocuments };
