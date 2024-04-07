# File Change Checker Action

This GitHub Action checks if a specified file has changed in the most recent commit. It is useful for workflows that need to conditionally run steps based on whether a file was modified.

## Inputs

- **`file-path`**: The path to the file that you want to check for changes. This path is relative to the root of the repository.

- **`tsconfig`**: The path to the tsconfig file.
- 
## Outputs

- **`dependencyChanged`**: A boolean value (`true` or `false`) indicating whether the specified file was changed in the commit.

## Example Usage

Below is an example of how to use the File Change Checker Action in a workflow. This workflow triggers on push events and uses the action to check if a file named `example.txt` has changed. Based on the output, it conditionally runs further steps.

```yaml
name: Example Workflow

on: [push]

jobs:
  check-file-change:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Check if example.txt changed
        id: file-check
        uses: your-github-username/file-change-checker-action@v1
        with:
          file-path: 'example.txt'

      - name: Conditional step based on file change
        if: steps.file-check.outputs.dependencyChanged == 'true'
        run: echo "example.txt has changed."
```
## Setting Up the Action


## Contributing

If you would like to contribute to the development of this action, please refer to the contributing guidelines.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

