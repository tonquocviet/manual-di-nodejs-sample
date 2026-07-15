const serverStatus = document.querySelector("#serverStatus");
const responseStatus = document.querySelector("#responseStatus");
const responseTime = document.querySelector("#responseTime");
const responseBody = document.querySelector("#responseBody");

const healthButton = document.querySelector("#healthButton");
const createUserForm = document.querySelector("#createUserForm");
const createName = document.querySelector("#createName");
const createEmail = document.querySelector("#createEmail");
const getUserForm = document.querySelector("#getUserForm");
const getUserId = document.querySelector("#getUserId");

const customRequestForm = document.querySelector("#customRequestForm");
const customMethod = document.querySelector("#customMethod");
const customPath = document.querySelector("#customPath");
const customBody = document.querySelector("#customBody");

healthButton.addEventListener("click", () => {
  void sendRequest({
    method: "GET",
    path: "/health"
  });
});

createUserForm.addEventListener("submit", (event) => {
  event.preventDefault();

  void sendRequest({
    method: "POST",
    path: "/users",
    body: {
      name: createName.value,
      email: createEmail.value
    },
    onSuccess: (data) => {
      if (data && typeof data.id === "string") {
        getUserId.value = data.id;
      }
    }
  });
});

getUserForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = getUserId.value.trim();

  void sendRequest({
    method: "GET",
    path: `/users/${encodeURIComponent(id)}`
  });
});

customRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const method = customMethod.value;
  const path = normalizePath(customPath.value);
  const rawBody = customBody.value.trim();

  try {
    void sendRequest({
      method,
      path,
      body: rawBody ? JSON.parse(rawBody) : undefined
    });
  } catch (error) {
    renderResult({
      status: "Invalid JSON",
      duration: "-",
      body: {
        message: error instanceof Error ? error.message : "Unknown error"
      }
    });
  }
});

await checkHealth();

async function checkHealth() {
  try {
    const response = await fetch("/health");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    serverStatus.textContent = "Online";
    serverStatus.classList.add("ok");
    serverStatus.classList.remove("error");
  } catch {
    serverStatus.textContent = "Offline";
    serverStatus.classList.add("error");
    serverStatus.classList.remove("ok");
  }
}

async function sendRequest({ method, path, body, onSuccess }) {
  const startedAt = performance.now();
  responseStatus.textContent = "Sending...";
  responseTime.textContent = "-";
  responseBody.textContent = "";

  const headers = {};
  const requestInit = {
    method,
    headers
  };

  if (body !== undefined && method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(path, requestInit);
    const duration = `${Math.round(performance.now() - startedAt)}ms`;
    const data = await readResponseBody(response);

    renderResult({
      status: `${response.status} ${response.statusText}`,
      duration,
      body: data
    });

    if (response.ok && onSuccess) {
      onSuccess(data);
    }
  } catch (error) {
    renderResult({
      status: "Network error",
      duration: `${Math.round(performance.now() - startedAt)}ms`,
      body: {
        message: error instanceof Error ? error.message : "Unknown error"
      }
    });
  }
}

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function renderResult({ status, duration, body }) {
  responseStatus.textContent = status;
  responseTime.textContent = duration;
  responseBody.textContent =
    typeof body === "string" ? body : JSON.stringify(body, null, 2);
}

function normalizePath(path) {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return "/";
  }

  return trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
}
