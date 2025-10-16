# Handling Text Attachments for Agents

## Background
- **Problem**: CSV uploads routed through the “Upload as Text” flow were stored as plain text but never surfaced to custom agents, so request payloads reached `Tahsilat Agent` without file content.
- **Driver**: End users need spreadsheet screenshots or CSV exports to appear in the system message so the agent can parse payment rows.

## Implemented Fix
- **Structured System Message** (`api/server/services/Files/images/encode.js:177`): we now emit a `<file>` block per text attachment and wrap contents in `<![CDATA[ ... ]]>` with `]]>` escaping.
- **Attachment Routing** (`api/app/clients/BaseClient.js:1255`): text-backed files (`source === text` or `text/*` mimetypes) are queued with image OCR processing so `message.ocr` is populated and metadata survives downstream.
- **Config Reminder**: keep the `ocr` block in `librechat.yaml` and set `MISTRAL_API_KEY` in `.env`. Restart the backend (`npm run backend:dev`) after updating secrets.

## Verification Steps
- Upload a CSV via “Upload as Text”.
- Inspect the system prompt in the agent request; you should see:
  ```xml
  The user has attached a file:

  <file>
    <filename>payments.csv</filename>
    <type>text/csv</type>
    <content><![CDATA[customer_full_name,amount,...]]></content>
  </file>
  ```
- Trigger the agent and confirm it consumes the table data.

## Future TODO
- Extend the parser so `.xlsx` and `.xls` uploads are converted to CSV (or JSON) before generating the `<file>` block.
- Add regression tests covering multiple-file payloads (`csv + txt`) to ensure escaping stays stable.
