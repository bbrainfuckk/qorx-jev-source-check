"use strict";

function showExercise(evidence, requests) {
  const byId = id => document.getElementById(id);
  const nextStep = byId("next-step");
  const names = Object.fromEntries(evidence.excerpts.map(item => [item.id, item.path.split("/").pop()]));
  names.none_of_these = "Neither excerpt";
  let active = evidence.questions[0];
  let reverse = false;
  let downloadUrl;

  function makeFile(item) {
    const figure = document.createElement("figure");
    const caption = document.createElement("figcaption");
    const link = document.createElement("a");
    const end = item.start + item.lines.length - 1;
    link.href = "https://github.com/" + evidence.repository + "/blob/" + evidence.commit + "/" + item.path + "#L" + item.start + "-L" + end;
    link.textContent = item.path;
    const range = document.createElement("span");
    range.textContent = item.start + "–" + end;
    caption.append(link, range);
    const pre = document.createElement("pre");
    pre.tabIndex = 0;
    pre.setAttribute("aria-label", item.path + " source excerpt");
    const indent = Math.min(...item.lines.filter(line => line.trim()).map(line => line.length - line.trimStart().length));
    for (const [index, line] of item.lines.entries()) {
      const row = document.createElement("span");
      row.className = "line";
      const number = document.createElement("span");
      number.className = "line-number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = item.start + index;
      row.append(number, line.slice(indent));
      pre.append(row);
    }
    figure.append(caption, pre);
    return figure;
  }

  function selectAnswer(button, candidate) {
    for (const option of byId("choices").children) option.setAttribute("aria-pressed", String(option === button));
    const correct = candidate === active.expected;
    const message = correct ? "Correct. " : "The supported choice is “" + names[active.expected] + "”. ";
    byId("answer").textContent = message + active.explanation;
    if (nextStep) nextStep.hidden = false;
  }

  function render() {
    for (const button of document.querySelectorAll("[data-question]")) {
      button.setAttribute("aria-pressed", String(button.dataset.question === active.id));
    }
    byId("question").textContent = active.question;
    const order = reverse ? "reverse" : "forward";
    const items = reverse ? [...evidence.excerpts].reverse() : evidence.excerpts;
    byId("files").replaceChildren(...items.map(makeFile));
    const buttons = [...items.map(item => item.id), "none_of_these"].map(candidate => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.textContent = names[candidate];
      button.addEventListener("click", () => selectAnswer(button, candidate));
      return button;
    });
    byId("choices").replaceChildren(...buttons);
    byId("answer").textContent = "";
    if (nextStep) nextStep.hidden = true;
    const body = requests[active.id][order];
    byId("payload").textContent = body;
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = URL.createObjectURL(new Blob([body], {type: "application/json"}));
    byId("download").href = downloadUrl;
    byId("download").download = "jev-" + active.id + "-" + order + ".json";
  }
  byId("ref").textContent = "fastapi/fastapi @ " + evidence.commit.slice(0, 7);
  for (const button of document.querySelectorAll("[data-question]")) {
    button.addEventListener("click", () => {
      active = evidence.questions.find(item => item.id === button.dataset.question);
      render();
    });
  }
  byId("reverse").addEventListener("click", () => { reverse = !reverse; render(); });
  render();
  byId("exercise").hidden = false;
  byId("load-status").hidden = true;
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Unable to load " + path);
  return response.json();
}

function redirectPublishedExercise() {
  if (location.origin !== "https://bbrainfuckk.github.io"
    || !["/qorx-jev-source-check/", "/qorx-jev-source-check/index.html"].includes(location.pathname)) return false;
  const destination = new URL("https://qorx.idra-ai.com/labs/jev-source-check/");
  const source = new URLSearchParams(location.search);
  const allowed = {
    utm_source: ["github", "youtube", "discord", "hashnode", "reddit"],
    utm_campaign: ["qorx_codex_showcase", "qorx_github_repo", "qorx_indiehackers", "qorx_jev_hashnode",
      "qorx_jev_short", "qorx_jev_sourcecheck", "qorx_jev_threads", "qorx_kilo_showcase", "qorx_observable_audit",
      "qorx_reddit_mcp", "qorx_site_trial"],
  };
  for (const [key, values] of Object.entries(allowed)) {
    const candidates = source.getAll(key);
    if (candidates.length === 1 && values.includes(candidates[0])) destination.searchParams.set(key, candidates[0]);
  }
  if (["#exercise", "#question", "#request"].includes(location.hash)) destination.hash = location.hash;
  location.replace(destination.href);
  return true;
}

if (!redirectPublishedExercise()) Promise.all([loadJson("evidence.json"), loadJson("requests.json")])
  .then(([evidence, requests]) => showExercise(evidence, requests))
  .catch(() => {
    document.getElementById("load-status").textContent = "The source excerpts could not be loaded. Reload this page or open the GitHub repository above.";
  });
