#!/usr/bin/env node

const { program } = require('commander');
const scanner = require('../lib/scanner');
const reporter = require('../lib/reporter');
const commenter = require('../lib/commenter');
const chalk = require('chalk');
const path = require('path');

program
  .name('clean-slate')
  .description('A code hygiene tool for vibe coders')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan a directory for code hygiene issues')
  .argument('<directory>', 'Directory to scan')
  .option('--dry-run', 'Show issues without modifying files or generating reports')
  .action(async (directory, options) => {
    try {
      console.log(chalk.blue(`🔍 Scanning ${directory} for code hygiene issues...`));
      
      const targetDir = path.resolve(process.cwd(), directory);
      const issues = await scanner.scanDirectory(targetDir);
      
      if (issues.length === 0) {
        console.log(chalk.green('✅ No issues found! Your code is clean.'));
        return;
      }
      
      console.log(chalk.yellow(`Found ${issues.length} issues:`));
      
      issues.forEach(issue => {
        const relativePath = path.relative(process.cwd(), issue.filePath);
        console.log(
          `${chalk.yellow('!')} ${chalk.cyan(issue.type)} in ${chalk.magenta(relativePath)}:${chalk.yellow(issue.line)} - ${issue.message}`
        );
      });
      
      console.log(chalk.blue('\nRun `clean-slate report` to generate a detailed report'));
      console.log(chalk.blue('Run `clean-slate comment --inline` to add helpful comments to your code'));
      
      // Store issues for later use by other commands
      global.lastScanResults = issues;
      global.lastScannedDirectory = targetDir;
    } catch (error) {
      console.error(chalk.red(`Error scanning directory: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate a markdown report of the last scan')
  .action(() => {
    try {
      if (!global.lastScanResults) {
        console.error(chalk.red('No scan results found. Run `clean-slate scan <directory>` first.'));
        process.exit(1);
      }
      
      console.log(chalk.blue('📝 Generating report...'));
      const reportPath = reporter.generateReport(global.lastScanResults, global.lastScannedDirectory);
      console.log(chalk.green(`✅ Report generated at ${reportPath}`));
    } catch (error) {
      console.error(chalk.red(`Error generating report: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('comment')
  .description('Add helpful comments to your code')
  .option('--inline', 'Insert comments directly into the code')
  .action((options) => {
    try {
      if (!global.lastScanResults) {
        console.error(chalk.red('No scan results found. Run `clean-slate scan <directory>` first.'));
        process.exit(1);
      }
      
      if (options.inline) {
        console.log(chalk.blue('💬 Adding inline comments to your code...'));
        const modifiedFiles = commenter.addInlineComments(global.lastScanResults);
        console.log(chalk.green(`✅ Added comments to ${modifiedFiles} files`));
      } else {
        console.error(chalk.yellow('Please specify --inline to add comments to your code.'));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red(`Error adding comments: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}