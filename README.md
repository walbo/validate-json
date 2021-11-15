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
        uses: walbo/validate-json@v0.0.1
        env:
          schema: schemas/schema.json
          schema-version: draft-04
          print-valid-files: true
          files:
            - folder/**/*.json
            - another-folder/**/*.json
```
