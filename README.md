# Qorx + Jev source check

[Try the two questions in your browser](https://bbrainfuckk.github.io/qorx-jev-source-check/).

A coding agent can retrieve a plausible file and still lack the lines that answer a question. This exercise gives you two short FastAPI excerpts. Choose the one that supports the answer, or choose **Neither excerpt**. Swap the file order, inspect the sources, and download the exact request that the local runner prepares for Jev.

## Where the lines came from

The open-source Qorx 1.0.7 CLI indexed `fastapi/routing.py` and `fastapi/applications.py` from [FastAPI commit 7a0a3f0](https://github.com/fastapi/fastapi/tree/7a0a3f0b286c6c865cf4398ea0e957a87b8bffa4). Separate `strict-answer --limit 8` queries located routes in lines 3113–3192 of the routing file and the OpenAPI handler in lines 1121–1200 of the applications file. We selected nine lines inside each cited range and checked them against the pinned source. The browser removes common leading indentation for readability. The downloaded requests retain the original whitespace.

Both questions use these same excerpts. One asks for an implementation they do not contain. The other asks about a specific WebSocket route shown in one excerpt. The browser grades your choice against a fixed answer key, locally.

The [earlier Qorx Flow case study](https://qorx.idra-ai.com/docs/decide.html#decide-example) reports six excerpts and two recorded Jev decisions. This exercise has its own source selection, request payloads and answer key. A new live run generates its own results.

## Run locally

Python 3.10 or later is sufficient. No Python dependencies are required.

```sh
python jev_check.py
python jev_check.py --question positive
```

Each preview prints two JSON records. The evidence stays fixed while the two filenames swap places in the Choice criteria. Each request also includes a Noul question asking whether any excerpt provides sufficient evidence. The answer key stays on your machine. [TypeSafe's companion Noul pattern](https://docs.typesafe.ai/patterns/companion-noul)

To obtain a new decision, set `TYPESAFE_API_KEY` in your local environment and explicitly run:

```sh
python jev_check.py --question negative --live
```

This sends up to two billable requests to TypeSafe for the selected question using `jev-1.14.0`. The script prints the request and validated provider response. Its illustrative policy reports a supported candidate only if an excerpt was selected and both the sufficiency score and selected probability are at least 0.8. The browser never requests an API key. [TypeSafe models and pricing](https://docs.typesafe.ai/models)

To test the example and serve the browser page locally:

```sh
python -B -m unittest -v
python -B build_preview.py
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`.

## Credits

Built by the Qorx maker with Codex assistance. Original demo code uses the same AGPL-3.0-only license as the [Qorx CLI](https://github.com/bbrainfuckk/qorx). The FastAPI excerpts retain their [upstream MIT notice](FASTAPI-LICENSE.txt). The Qorx name and icon follow the project's [trademark policy](https://github.com/bbrainfuckk/qorx/blob/main/TRADEMARKS.md).

[Qorx Void on the Microsoft Store](https://apps.microsoft.com/detail/9NDC66CH9VL8) · [Qorx Discord](https://discord.gg/Cnvy5wCsTA)
