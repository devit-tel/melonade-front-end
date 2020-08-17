# melonade-front-end

## To start

```bash
  nvm install v10.16.3
  nvm use

  npm install
  npm start
```

# Docker .env

```bash
PORT=8083
REACT_APP_EVENT_LOGGER_HTTP_BASEURL=http://localhost:8082/
REACT_APP_PROCESS_MANAGER_HTTP_BASEURL=http://localhost:8081/
```

## TODO

- [x] Reverse proxy
- [x] Transaction detail page quite slow on long transaction
- [x] Optimize build (uglify, remove unused lib, JSON)
- [ ] Dark mode
- [x] Query transactions by tags
- [x] Transaction show duplicate
- [ ] Workflow design quite hard to use

## Known issues

- [x] Google Chart (timeline) broken if span < 1 second
