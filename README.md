
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
