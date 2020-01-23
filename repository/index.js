import { sparqlEscapeString, sparqlEscapeUri, query } from 'mu';

const GRAPH = process.env.MU_APPLICATION_GRAPH || 'http://mu.semte.ch/application';

const getAllAgendaItemsFromAgendaWithDocuments = async (agendaId) => {
  const queryString = `
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX besluitvorming: <http://data.vlaanderen.be/ns/besluitvorming#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX dbpedia: <http://dbpedia.org/ontology/>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
  PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>
  PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>

  SELECT DISTINCT ?fileId (?physicalFile AS ?uri) ?format ?size ?extension ?created ?modified ?documentId ?documentName
  FROM ${sparqlEscapeUri(GRAPH)}
  WHERE {
      ?agenda a besluitvorming:Agenda ;
              mu:uuid ${sparqlEscapeString(agendaId)} ;
              ext:agendaNaam ?agendaName ;
              dct:hasPart ?agendaitem .
      ?agendaitem mu:uuid ?agendaitemId ;
          ext:prioriteit ?agendaitemPrio ;
          ext:bevatAgendapuntDocumentversie ?document .

      ?document dct:title ?documentName ;
          mu:uuid ?documentId ;
          ext:file ?file .
      ?file ^nie:dataSource ?physicalFile .
      ?physicalFile mu:uuid ?fileId .
      OPTIONAL { ?physicalFile dct:format ?format . }
      OPTIONAL { ?physicalFile nfo:fileSize ?size . }
      OPTIONAL { ?physicalFile dbpedia:fileExtension ?extension . }
      OPTIONAL { ?physicalFile dct:created ?created . }
      OPTIONAL { ?physicalFile dct:modified ?modified . }
  }`;
  const data = await query(queryString);
  return parseSparqlResults(data);
};

const parseSparqlResults = (data) => {
  if (!data) return;
  const vars = data.head.vars;
  return data.results.bindings.map((binding) => {
    let obj = {};
    vars.forEach((varKey) => {
      if (binding[varKey]) {
        obj[varKey] = binding[varKey].value;
      }
    });
    return obj;
  });
};

module.exports = { getAllAgendaItemsFromAgendaWithDocuments };
