const fs = require('fs').promises;
const path = require('path');

/**
 * Add inline comments to files based on issues found
 * @param {Array} issues - Array of issues found
 * @returns {number} - Number of files modified
 */
async function addInlineComments(issues) {
  try {
    // Group issues by file
    const issuesByFile = {};
    issues.forEach(issue => {
      const filePath = issue.filePath;
      if (!issuesByFile[filePath]) {
        issuesByFile[filePath] = [];
      }
      issuesByFile[filePath].push(issue);
    });
    
    const modifiedFiles = new Set();
    
    // Process each file
    for (const filePath of Object.keys(issuesByFile)) {
      const fileIssues = issuesByFile[filePath];
      
      // Sort issues by line number in descending order to avoid line number changes
      fileIssues.sort((a, b) => b.line - a.line);
      
      // Read file content
      let content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Add comments for each issue
      for (const issue of fileIssues) {
        const commentLine = issue.line - 1; // Convert to 0-based index
        
        if (commentLine < 0 || commentLine >= lines.length) {
          continue; // Skip if line number is out of bounds
        }
        
        // Generate appropriate comment based on issue type
        const comment = generateComment(issue);
        
        // Insert comment before the issue line
        lines.splice(commentLine, 0, comment);
      }
      
      // Write modified content back to file
      await fs.writeFile(filePath, lines.join('\n'));
      modifiedFiles.add(filePath);
    }
    
    return modifiedFiles.size;
  } catch (error) {
    throw new Error(`Failed to add inline comments: ${error.message}`);
  }
}

/**
 * Generate an appropriate comment based on the issue type
 * @param {Object} issue - Issue object
 * @returns {string} - Comment to insert
 */
function generateComment(issue) {
  const commentPrefix = '// CLEAN-SLATE: ';
  
  switch (issue.type) {
    case 'Unused Function':
      return `${commentPrefix}This function is unused. Consider removing it or documenting why it's needed.`;
      
    case 'Unused Variable':
      return `${commentPrefix}This variable is unused. Consider removing it or documenting why it's needed.`;
      
    case 'Long Function':
      return `${commentPrefix}This function is too long (exceeds 50 lines). Consider breaking it down into smaller, more focused functions.`;
      
    case 'Deeply Nested Code':
      return `${commentPrefix}This code is deeply nested. Consider extracting some logic into separate functions or using early returns to reduce nesting.`;
      
    case 'Dead Code':
      return `${commentPrefix}This code is unreachable (after a return statement). It should be removed.`;
      
    case 'TODO/FIXME Comment':
      return `${commentPrefix}Don't forget to address this TODO/FIXME comment. Consider adding more context or a deadline.`;
      
    default:
      return `${commentPrefix}${issue.message}`;
  }
}

module.exports = {
  addInlineComments
};