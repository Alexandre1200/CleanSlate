const fs = require('fs').promises;
const path = require('path');

/**
 * Generate a markdown report of the issues found
 * @param {Array} issues - Array of issues found
 * @param {string} scannedDirectory - Directory that was scanned
 * @returns {string} - Path to the generated report
 */
async function generateReport(issues, scannedDirectory) {
  try {
    const reportPath = path.join(process.cwd(), 'report.md');
    const relativePath = path.relative(process.cwd(), scannedDirectory);
    
    // Group issues by file
    const issuesByFile = {};
    issues.forEach(issue => {
      const filePath = issue.filePath;
      if (!issuesByFile[filePath]) {
        issuesByFile[filePath] = [];
      }
      issuesByFile[filePath].push(issue);
    });
    
    // Generate report content
    let reportContent = `# CleanSlate Code Hygiene Report\n\n`;
    reportContent += `## Summary\n\n`;
    reportContent += `- **Directory scanned**: \`${relativePath}\`\n`;
    reportContent += `- **Total issues found**: ${issues.length}\n`;
    reportContent += `- **Files with issues**: ${Object.keys(issuesByFile).length}\n\n`;
    
    // Add issue type counts
    const issueTypes = {};
    issues.forEach(issue => {
      if (!issueTypes[issue.type]) {
        issueTypes[issue.type] = 0;
      }
      issueTypes[issue.type]++;
    });
    
    reportContent += `### Issues by Type\n\n`;
    Object.keys(issueTypes).forEach(type => {
      reportContent += `- **${type}**: ${issueTypes[type]}\n`;
    });
    
    reportContent += `\n## Issues by File\n\n`;
    
    // Add issues by file
    Object.keys(issuesByFile).sort().forEach(filePath => {
      const fileIssues = issuesByFile[filePath];
      const relativeFilePath = path.relative(process.cwd(), filePath);
      
      reportContent += `### ${relativeFilePath}\n\n`;
      reportContent += `| Line | Type | Message |\n`;
      reportContent += `| ---- | ---- | ------- |\n`;
      
      fileIssues.sort((a, b) => a.line - b.line).forEach(issue => {
        reportContent += `| ${issue.line} | ${issue.type} | ${issue.message} |\n`;
      });
      
      reportContent += `\n`;
    });
    
    reportContent += `## Recommendations\n\n`;
    
    // Add recommendations based on issue types
    if (issueTypes['Unused Function'] || issueTypes['Unused Variable']) {
      reportContent += `- **Remove unused code**: There ${issueTypes['Unused Function'] + issueTypes['Unused Variable'] > 1 ? 'are' : 'is'} ${issueTypes['Unused Function'] || 0} unused function(s) and ${issueTypes['Unused Variable'] || 0} unused variable(s). Removing them will make your code cleaner and more maintainable.\n`;
    }
    
    if (issueTypes['Long Function']) {
      reportContent += `- **Refactor long functions**: There ${issueTypes['Long Function'] > 1 ? 'are' : 'is'} ${issueTypes['Long Function']} function(s) that are too long. Consider breaking them down into smaller, more focused functions.\n`;
    }
    
    if (issueTypes['Deeply Nested Code']) {
      reportContent += `- **Simplify nested code**: There ${issueTypes['Deeply Nested Code'] > 1 ? 'are' : 'is'} ${issueTypes['Deeply Nested Code']} instance(s) of deeply nested code. Consider extracting some logic into separate functions or using early returns to reduce nesting.\n`;
    }
    
    if (issueTypes['Dead Code']) {
      reportContent += `- **Remove unreachable code**: There ${issueTypes['Dead Code'] > 1 ? 'are' : 'is'} ${issueTypes['Dead Code']} instance(s) of code that will never execute. Remove this code to improve clarity.\n`;
    }
    
    if (issueTypes['TODO/FIXME Comment']) {
      reportContent += `- **Address TODO comments**: There ${issueTypes['TODO/FIXME Comment'] > 1 ? 'are' : 'is'} ${issueTypes['TODO/FIXME Comment']} TODO/FIXME comment(s) in your code. Consider addressing these issues.\n`;
    }
    
    reportContent += `\n## Next Steps\n\n`;
    reportContent += `Run \`clean-slate comment --inline\` to add helpful comments to your code that explain these issues in more detail.\n`;
    
    // Write the report to a file
    await fs.writeFile(reportPath, reportContent);
    
    return reportPath;
  } catch (error) {
    throw new Error(`Failed to generate report: ${error.message}`);
  }
}

module.exports = {
  generateReport
};