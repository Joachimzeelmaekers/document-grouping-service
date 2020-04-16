# DEPRECATED

This repository has been replaced by:
- https://github.com/kanselarij-vlaanderen/file-bundling-service
- https://github.com/kanselarij-vlaanderen/file-bundling-job-creation-service


## Configuration snippets

#### docker-compose

```yml
document-grouping:
  image: kanselarij/document-grouping-service
```

#### Dispatcher

```elixir
get "/agendas/:id/agendaitems/documents", @any do
  Proxy.forward conn, [], "http://document-grouping/agendas/" <> id <> "/agendaitems/documents"
end
```
