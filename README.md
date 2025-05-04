# CleanSlate - The Code Hygiene Bot for Vibe Coders

CleanSlate is a command-line tool designed for vibe coders—developers who may not fully understand code hygiene but are eager to clean up and improve their code. It scans JavaScript codebases, detects issues like unused functions, complex code, TODO/FIXME comments, and more, and then provides helpful comments to make the code more understandable, maintainable, and clean.

![CleanSlate Logo](https://via.placeholder.com/150x150.png?text=CleanSlate)

## Features

CleanSlate detects the following code hygiene issues:

### 1. Unused Code Detection
- **Unused Functions**: Functions that are declared but never called
- **Unused Variables**: Variables that are declared but never used
- **Unused Imports**: Import statements that aren't utilized in the code

### 2. Complex Code Identification
- **Long Functions**: Functions that exceed 50 lines of code
- **Deeply Nested Code**: Code with more than 3 levels of nesting (if/for/while statements)
- **Complex Logic**: Identifies overly complex conditional statements

### 3. Dead Code Detection
- **Unreachable Code**: Code that appears after return statements
- **Redundant Conditions**: Conditions that will never be met

### 4. TODO/FIXME Management
- **Pending Tasks**: Identifies TODO and FIXME comments in the code
- **Suggests Improvements**: Adds context to existing TODO comments

### 5. Reporting
- **Terminal Output**: Clear, color-coded terminal output of issues
- **Markdown Reports**: Generates detailed markdown reports with issue summaries
- **Inline Comments**: Adds helpful comments directly to your code

## Installation

### Global Installation (Recommended)

```bash
# Install globally from npm
npm install -g clean-slate
```

### Local Installation

```bash
# Install in your project
npm install clean-slate

# Run using npx
npx clean-slate scan ./src
```

## Usage

### Basic Commands

#### Scan a directory for code hygiene issues

```bash
clean-slate scan ./src
```

This will scan all JavaScript files in the `./src` directory and display any issues found in the terminal with color-coded output.

#### Generate a detailed report

```bash
clean-slate report
```

This will generate a comprehensive markdown report (`report.md`) summarizing all the issues found during the last scan, including:
- Total number of issues by type
- Issues organized by file
- Specific line numbers and code snippets
- Recommended actions for each issue type

#### Add inline comments to your code

```bash
clean-slate comment --inline
```

This will automatically insert helpful comments directly in your code where issues were detected:
- Comments are prefixed with `// CLEAN-SLATE: ` for easy identification
- Each comment explains the issue and suggests how to fix it
- Comments are placed directly above the problematic code

#### Dry run mode

```bash
clean-slate scan ./src --dry-run
```

This will show the detected issues without modifying any files or generating reports, perfect for initial assessment.

### Example Workflow

Here's a typical workflow using CleanSlate:

1. **Initial Scan**: Run `clean-slate scan ./src` to identify issues
2. **Review Issues**: Look through the terminal output to understand what problems exist
3. **Generate Report**: Run `clean-slate report` to create a shareable document of all issues
4. **Add Comments**: Run `clean-slate comment --inline` to add helpful comments to your code
5. **Fix Issues**: Address the problems identified in your code
6. **Verify Fixes**: Run another scan to confirm issues are resolved

## Issue Types in Detail

### Unused Code
Unused code increases maintenance burden and can lead to confusion. CleanSlate identifies:
- Functions that are defined but never called
- Variables that are declared but never used
- Import statements that aren't utilized

### Long Functions
Functions longer than 50 lines are flagged as they:
- Are harder to understand and maintain
- Often try to do too many things
- Are more difficult to test properly

### Deeply Nested Code
Code with more than 3 levels of nesting is flagged because:
- It's difficult to follow the execution flow
- It increases cognitive load when reading
- It's often a sign that the code should be refactored

### Dead Code
Code that will never execute is identified:
- Statements after return statements
- Conditions that can never be true
- Unused branches in switch statements

### TODO/FIXME Comments
These comments often indicate:
- Incomplete features
- Known bugs that need fixing
- Areas that need optimization

## Troubleshooting

### PowerShell Execution Policy Error

If you encounter an error like:
```
clean-slate : File C:\Users\username\AppData\Roaming\npm\clean-slate.ps1 cannot be loaded because running scripts is disabled on this system.
```

You have three options:

1. **Use Command Prompt instead of PowerShell**
   - Open Command Prompt (cmd.exe)
   - Run the commands there instead

2. **Change PowerShell's execution policy** (as Administrator):
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

3. **Use npx to run the tool**:
   ```
   npx clean-slate scan ./src
   ```

### Common Issues

#### No Issues Found When Expected
If CleanSlate reports no issues when you expect it to find some:
- Check that you're scanning the correct directory
- Verify that your files have the `.js` extension
- Try running with more verbose output: `clean-slate scan ./src --verbose`

#### Error Parsing JavaScript Files
If you see syntax errors:
- Ensure your code is valid JavaScript
- Check for missing semicolons or brackets
- Verify that you're not using newer JavaScript features unsupported by the parser

## Contributing

Contributions are welcome! Here's how you can help:
- Report bugs by opening issues
- Suggest new features
- Submit pull requests with improvements
- Help with documentation

## License

MIT