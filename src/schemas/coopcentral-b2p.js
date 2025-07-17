// Schema summary:
// ---------------------------------------------------------------------------
// Handle: b2p-send
// Record: intent
// Format: json-schema

// Schema content:
// ---------------------------------------------------------------------------
const b2pSendSchema = {
  properties: {
    claims: {
      additionalItems: false,
      items: [
        {
          properties: {
            action: {
              enum: ["transfer"],
              type: "string",
            },
            amount: {
              title: "Amount",
              type: "integer",
            },
            source: {
              properties: {
                custom: {
                  properties: {
                    documentNumber: {
                      minLength: 1,
                      title: "Document Number",
                      type: "string",
                    },
                    documentType: {
                      enum: [
                        "txid",
                        "ccpt",
                        "nidn",
                        "pep",
                        "ppt",
                        "nuip",
                        "ce",
                        "cc",
                      ],
                      title: "Document Type",
                      type: "string",
                    },
                    entityType: {
                      enum: ["business"],
                      title: "Entity Type",
                      type: "string",
                    },
                    name: {
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                  },
                  required: [
                    "name",
                    "entityType",
                    "documentType",
                    "documentNumber",
                  ],
                  title: " ",
                  type: "object",
                },
                handle: {
                  pattern:
                    "^(svgs|cacc|dbmo|dord|dbmi):\\d+@[a-zA-Z0-9_\\-+.]+$",
                  title: "Handle",
                  type: "string",
                },
              },
              required: ["handle", "custom"],
              title: "Source",
              type: "object",
            },
            symbol: {
              properties: {
                handle: {
                  enum: ["cop"],
                  title: "Symbol",
                  type: "string",
                },
              },
              required: ["handle"],
              title: " ",
              type: "object",
            },
            target: {
              properties: {
                custom: {
                  properties: {
                    accountRef: {
                      title: "Account Reference",
                      type: "string",
                    },
                    documentNumber: {
                      minLength: 1,
                      title: "Document Number",
                      type: "string",
                    },
                    documentType: {
                      enum: [
                        "txid",
                        "ccpt",
                        "nidn",
                        "pep",
                        "ppt",
                        "nuip",
                        "ce",
                        "cc",
                      ],
                      title: "Document Type",
                      type: "string",
                    },
                    entityType: {
                      enum: ["individual"],
                      title: "Entity Type",
                      type: "string",
                    },
                    name: {
                      minLength: 1,
                      title: "Name",
                      type: "string",
                    },
                  },
                  required: [
                    "name",
                    "entityType",
                    "documentType",
                    "documentNumber",
                  ],
                  title: " ",
                  type: "object",
                },
                handle: {
                  pattern:
                    "^(svgs|cacc|dbmo|dord|dbmi):\\d+@[a-zA-Z0-9_\\-+.]+$",
                  title: "Handle",
                  type: "string",
                },
              },
              required: ["handle", "custom"],
              title: "Target",
              type: "object",
            },
          },
          required: ["action", "source", "target", "symbol", "amount"],
          title: " ",
          type: "object",
        },
      ],
      minItems: 1,
      title: " ",
      type: "array",
    },
    custom: {
      additionalProperties: false,
      properties: {
        description: {
          maxLength: 255,
          title: "Description",
          type: "string",
        },
        routingCode: {
          enum: ["TFY", "ENT", "CRB", "VIS", "SRV"],
          title: "Routing Code",
          type: "string",
        },
      },
      title: "",
      type: "object",
    },
    handle: {
      pattern: "^\\d{8}\\d{9}.{3}\\d{15}$",
      title: "Handle",
      type: "string",
    },
  },
  required: ["handle", "claims"],
  title: "B2P Send",
  type: "object",
};
