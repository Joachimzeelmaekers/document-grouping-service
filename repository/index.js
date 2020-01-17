import { query } from 'mu';

const targetGraph = 'http://mu.semte.ch/graphs/organizations/kanselarij';

const getAllAgendaItemsFromAgendaWithDocuments = async (agendaId) => {
  const queryString = `
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX besluitvorming: <http://data.vlaanderen.be/ns/besluitvorming#>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX dbpedia: <http://dbpedia.org/ontology/>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
  PREFIX dossier: <https://data.vlaanderen.be/ns/dossier#>

 SELECT ?agendaitemId ?agendaitemPrio ?agendaName ?documentName ?extension ?download WHERE {
     GRAPH <${targetGraph}> {
          ?agenda a besluitvorming:Agenda ;
                  mu:uuid "${agendaId}" ;
                  ext:agendaNaam ?agendaName ;
                  dct:hasPart ?agendaitem .
          ?agendaitem mu:uuid ?agendaitemId .
          OPTIONAL { ?agendaitem ext:prioriteit ?agendaitemPrio . }
          OPTIONAL {
              ?agendaitem ext:bevatAgendapuntDocumentversie ?document .

              ?document dct:title ?documentName ;
                  ext:file ?file .
              ?file dbpedia:fileExtension ?extension .
              ?download nie:dataSource ?file .
          }
     }
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
