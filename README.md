# Validate JSON Action

Validate JSON files agains their `$schema`.

Usage:

```
name: Validate JSON

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate JSON
        uses: walbo/validate-json@v0.0.2
        env:
          files: folder/**/*.json
          schema: schemas/schema.json

          # optional, default: draft-04
          schema-version: draft-06

          # optional, default: false
          print-valid-files: true

          # optional, default: false
          c: true
```
