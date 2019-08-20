import { query } from 'mu';
const targetGraph = 'http://mu.semte.ch/graphs/organizations/kanselarij';

const getAllAgendaItemsFromAgendaWithDocuments = async (agendaId) => {
  const queryString = `
    PREFIX vo-org: <https://data.vlaanderen.be/ns/organisatie#>
    PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
    PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
    PREFIX vo-gen: <https://data.vlaanderen.be/ns/generiek#> 
    PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX besluitvorming: <http://data.vlaanderen.be/ns/besluitvorming#>
    PREFIX agenda: <http://data.lblod.info/id/agendas/>
    PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
    PREFIX dct: <http://purl.org/dc/terms/>
   
    SELECT ?id (MAX(?versionNumber) as ?maxVersionNumber) ?documentVersionId ?fileId  WHERE { 
       GRAPH <${targetGraph}>
       {
         ?agenda a besluitvorming:Agenda ;
                    mu:uuid "${agendaId}" .
         ?agenda   ext:agendaNaam ?agendaName .
         ?agenda   dct:hasPart ?agendaitem .
         ?agendaitem mu:uuid ?id .
         OPTIONAL   { ?agendaitem ext:prioriteit ?agendaitemPrio . }
         OPTIONAL { 
					 ?agendaitem ext:bevatAgendapuntDocumentversie ?documentVersions .
					 ?document  besluitvorming:heeftVersie ?documentVersions .
					 ?documentVersions mu:uuid ?documentVersionId .
					 ?documentVersions ext:versieNummer ?versionNumber .
					 ?documentVersions ext:file ?file .
					 ?file mu:uuid ?fileId .
				 }
        } 
    } GROUP BY ?id ?documentVersionId ?fileId`;
  const data = await query(queryString);
  return parseSparqlResults(data);
};

//  ?subcase   besluitvorming:isGeagendeerdVia ?agendaitem .
//  ?subcase   mu:uuid ?subcaseId .
//  ?agendaitem ext:wordtGetoondAlsMededeling ?showAsRemark .
//  FILTER(?showAsRemark ="false"^^<http://mu.semte.ch/vocabularies/typed-literals/boolean>)

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
