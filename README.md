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
        uses: walbo/validate-json@v1.0.4
        with:
          files: folder/**/*.json

          # optional, defaults to `$schema` in your JSON file
          schema: schemas/schema.json

          # optional, default: draft-04
          schema-version: draft-04

          # optional, default: false
          print-valid-files: false

          # optional, default: false
          fail-on-missing-schema: false

          # optional, default: true
          strict: true

          # optional, default: false
          allow-matching-properties: false

          # optional, default: true
          allow-union-types: true
```
