### Collect Env

This GitHub Action allows you to collect environment variables with a specific prefix and write them to a file. It is useful when you want to extract environment variables that match a certain pattern and save them to a `.env` file for deployment or configuration purposes.

#### Usage

```yaml
- name: Collect environment variables
  uses: dev-five-git/collect-env-action@main
  with:
    prefix: 'API_'
    output: '.env.api'
    remove-prefix: true
```

#### Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| prefix | The prefix to filter environment variables by | true | - |
| output | The output file to write the collected variables to | true | - |
| remove-prefix | Whether to remove the prefix from variable names in the output | false | false |

#### Example Workflow

```yaml
name: Collect API environment variables

on:
  push:
    branches: [main]

jobs:
  collect-env:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Collect API environment variables
        uses: dev-five-git/collect-env-action@main
        with:
          prefix: 'API_'
          output: '.env.api'
          remove-prefix: true
```

#### Example

If you have the following environment variables:
- `API_KEY=secret123`
- `API_URL=https://api.example.com`
- `API_TIMEOUT=5000`
- `DATABASE_URL=postgres://localhost`

And you run the action with:
- `prefix: 'API_'`
- `remove-prefix: true`

The output file will contain:
```
KEY=secret123
URL=https://api.example.com
TIMEOUT=5000
```

If `remove-prefix: false`, the output will be:
```
API_KEY=secret123
API_URL=https://api.example.com
API_TIMEOUT=5000
```