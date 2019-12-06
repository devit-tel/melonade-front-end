export const eventLogger = {
  http: {
    baseURL:
      process.env["REACT_APP_EVENT_LOGGER_HTTP_BASEURL"] ||
      "/api/process-manager/"
  }
};

export const processManager = {
  http: {
    baseURL:
      process.env["REACT_APP_PROCESS_MANAGER_HTTP_BASEURL"] ||
      "/api/event-logger/"
  }
};
