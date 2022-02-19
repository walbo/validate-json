# Validate JSON Action

Validate JSON files against their `$schema`.

Usage:

```
name: Validate JSON

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate JSON
        uses: walbo/validate-json@v1.0.2
        with:
          files: folder/**/*.json

          # optional, defaults to `$schema` in your JSON file
          schema: schemas/schema.json

          # optional, default: draft-04
          schema-version: draft-06

          # optional, default: false
          print-valid-files: true

          # optional, default: false
          allow-matching-properties: true

          # optional, default: false
          fail-on-missing-schema: true

          # optional, default: true
          strict: true
```
