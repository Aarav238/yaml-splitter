# yaml-splitter

`yaml-splitter` is a CLI tool to split and manage YAML files, especially OpenAPI Specification (OAS) YAML files. It helps developers break large YAML files into smaller, manageable parts and merge them back when needed.

## Features

- **Split OAS YAML files** into individual files based on endpoints (paths).
- **List available YAML files** in a directory.
- **Interactive mode** for user-friendly file selection.
- **Merge split YAML files** back into a single file.

## Installation

To install `yaml-splitter` globally, run:


```bash
npm install -g yaml-splitter
```
## Usage
After installation, the yaml-splitter command becomes available globally. Here are the available commands:

### 1. List YAML Files
List all .yaml or .yml files in a specified directory:

```bash
yaml-splitter list --dir <directory>
```

Example: 
```bash
yaml-splitter list --dir ./my_yaml_files

```

### 2. Split an OAS YAML File
Split a YAML file into smaller files based on endpoints (paths):
```bash
yaml-splitter split --file <path-to-yaml> --output-dir <output-directory>
```

Example:
```bash
yaml-splitter split --file ./input_folder/sample.yaml --output-dir ./output_folder
```
Options:

 - `--file`: Path to the input YAML file.
 - `--output-dir`: Directory to save the split files (default: ./split_endpoints).
  
### 3. Interactive Mode
Interactively select a YAML file to split:
```bash
yaml-splitter interactive --dir <directory>
```
Example:
```bash
yaml-splitter interactive --dir ./input_folder
```
The command will:

1. List all YAML files in the specified directory.
2. Prompt you to select a file and specify an output directory.

### 4. Merge YAML Files
Merge multiple YAML files from a directory into one:
```bash
yaml-splitter merge --input-dir <input-directory> --output <output-file>
```
Example:
```bash
yaml-splitter merge --input-dir ./output_folder --output ./combined.yaml
```
Options:

 `--input-dir`: Directory containing split YAML files.
 `--output`: Path to save the combined YAML file.


## Examples
### Splitting an OAS YAML File
Suppose you have an OpenAPI YAML file (api.yaml) in the` ./input_folder`, and you want to split it into individual files based on endpoints:
```bash
yaml-splitter split --file ./input_folder/api.yaml --output-dir ./split_output
```
After running the command, you’ll find split YAML files in the `./split_output folder`.

### Interactive Splitting
Run the interactive command to select and split a file:
```bash
yaml-splitter interactive --dir ./input_folder
```
The tool will:

1. List all YAML files in `./input_folder`.
2. Allow you to choose a file.
3. Prompt for an output directory (or use the default ./split_endpoints).

### Merging Split Files
To combine all split YAML files from ./split_output into a single file:
```bash
yaml-splitter merge --input-dir ./split_output --output ./merged_api.yaml
```
The result is a `merged_api.yaml` file.

## Requirements
- Node.js v14 or higher.
- YAML files must follow a valid structure (e.g., OpenAPI Specification).
  

## Contributing

Contributions are welcome! If you encounter any issues or have feature requests, feel free to open an issue or submit a pull request on [GitHub](https://github.com/Aarav238/yaml-splitter).

