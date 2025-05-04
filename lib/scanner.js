const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const acorn = require('acorn');
const walk = require('acorn-walk');
const util = require('util');

const globPromise = util.promisify(glob);

/**
 * Scan a directory for code hygiene issues
 * @param {string} directory - Directory to scan
 * @returns {Promise<Array>} - Array of issues found
 */
async function scanDirectory(directory) {
  try {
    console.log(`Scanning directory: ${directory}`);
    // Use path.resolve to ensure we have an absolute path
    const absoluteDir = path.resolve(process.cwd(), directory);
    console.log(`Absolute path: ${absoluteDir}`);
    
    // Use a more explicit glob pattern and log the pattern
    const pattern = path.join(absoluteDir, '**', '*.js').replace(/\\/g, '/');
    console.log(`Glob pattern: ${pattern}`);
    
    const files = await globPromise(pattern, { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
      dot: false
    });
    
    console.log(`Found ${files.length} JavaScript files to scan:`);
    files.forEach(file => console.log(` - ${file}`));
    
    let allIssues = [];
    
    for (const file of files) {
      console.log(`\nScanning file: ${file}`);
      const issues = await scanFile(file);
      console.log(`Found ${issues.length} issues in ${file}`);
      allIssues = [...allIssues, ...issues];
    }
    
    return allIssues;
  } catch (error) {
    console.error(`Error scanning directory: ${error.message}`);
    throw new Error(`Failed to scan directory: ${error.message}`);
  }
}

/**
 * Scan a single file for code hygiene issues
 * @param {string} filePath - Path to the file
 * @returns {Promise<Array>} - Array of issues found
 */
async function scanFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];
    
    // Parse the file with acorn
    let ast;
    try {
      ast = acorn.parse(content, {
        ecmaVersion: 2022,
        sourceType: 'script', // Changed from 'module' to 'script' for better compatibility
        locations: true
      });
    } catch (parseError) {
      console.error(`Parse error in ${filePath}: ${parseError.message}`);
      issues.push({
        type: 'Syntax Error',
        filePath,
        line: parseError.loc ? parseError.loc.line : 1,
        message: `Syntax error: ${parseError.message}`,
        code: lines[parseError.loc ? parseError.loc.line - 1 : 0] || ''
      });
      return issues;
    }
    
    // Check for TODO/FIXME comments
    checkForTodoComments(content, filePath, lines, issues);
    
    // Check for unused variables and functions
    checkForUnusedCode(ast, content, filePath, lines, issues);
    
    // Check for long functions
    checkForLongFunctions(ast, content, filePath, lines, issues);
    
    // Check for deeply nested code
    checkForDeeplyNestedCode(ast, content, filePath, lines, issues);
    
    // Check for dead code
    checkForDeadCode(ast, content, filePath, lines, issues);
    
    return issues;
  } catch (error) {
    console.error(`Error scanning file ${filePath}: ${error.message}`);
    throw new Error(`Failed to scan file ${filePath}: ${error.message}`);
  }
}

/**
 * Check for TODO/FIXME comments in the code
 */
function checkForTodoComments(content, filePath, lines, issues) {
  const todoRegex = /\/\/\s*(TODO|FIXME)[:|\s]*(.*)/gi;
  let match;
  
  while ((match = todoRegex.exec(content)) !== null) {
    const lineNumber = getLineNumberFromIndex(content, match.index);
    console.log(`Found TODO/FIXME comment at line ${lineNumber}: ${match[0]}`);
    issues.push({
      type: 'TODO/FIXME Comment',
      filePath,
      line: lineNumber,
      message: `Found ${match[1]} comment: ${match[2] || 'No description provided'}`,
      code: lines[lineNumber - 1] || ''
    });
  }
}

/**
 * Check for unused variables and functions
 */
function checkForUnusedCode(ast, content, filePath, lines, issues) {
  // Track declarations and references separately
  const declarations = new Map();
  const references = new Set();
  
  // First pass: collect all declarations
  walk.simple(ast, {
    VariableDeclarator(node) {
      if (node.id.type === 'Identifier') {
        const name = node.id.name;
        const line = getLineNumberFromIndex(content, node.start);
        console.log(`Found variable declaration: ${name} at line ${line}`);
        declarations.set(name, {
          type: 'Variable',
          line,
          used: false
        });
      }
    },
    FunctionDeclaration(node) {
      if (node.id && node.id.type === 'Identifier') {
        const name = node.id.name;
        const line = getLineNumberFromIndex(content, node.start);
        console.log(`Found function declaration: ${name} at line ${line}`);
        declarations.set(name, {
          type: 'Function',
          line,
          used: false
        });
      }
    }
  });
  
  // Second pass: collect all references
  walk.ancestor(ast, {
    Identifier(node, ancestors) {
      const name = node.name;
      
      // Skip if this identifier is a declaration itself
      const isDeclaration = ancestors.some(ancestor => {
        return (
          (ancestor.type === 'VariableDeclarator' && ancestor.id === node) ||
          (ancestor.type === 'FunctionDeclaration' && ancestor.id === node)
        );
      });
      
      if (!isDeclaration && declarations.has(name)) {
        console.log(`Found reference to: ${name}`);
        references.add(name);
        declarations.get(name).used = true;
      }
    }
  });
  
  // Check for unused declarations
  declarations.forEach((info, name) => {
    // Skip special names
    if (name === 'exports' || name === 'module' || name === 'require') {
      return;
    }
    
    if (!info.used) {
      console.log(`Found unused ${info.type.toLowerCase()}: ${name}`);
      issues.push({
        type: `Unused ${info.type}`,
        filePath,
        line: info.line,
        message: `Unused ${info.type.toLowerCase()} '${name}'`,
        code: lines[info.line - 1] || ''
      });
    }
  });
}

/**
 * Check for long functions
 */
function checkForLongFunctions(ast, content, filePath, lines, issues) {
  const MAX_FUNCTION_LENGTH = 50; // Maximum number of lines for a function
  
  walk.simple(ast, {
    FunctionDeclaration(node) {
      const startLine = getLineNumberFromIndex(content, node.start);
      const endLine = getLineNumberFromIndex(content, node.end);
      const functionLength = endLine - startLine;
      
      if (functionLength > MAX_FUNCTION_LENGTH) {
        console.log(`Found long function: ${node.id ? node.id.name : 'anonymous'} (${functionLength} lines)`);
        issues.push({
          type: 'Long Function',
          filePath,
          line: startLine,
          message: `Function '${node.id ? node.id.name : 'anonymous'}' is too long (${functionLength} lines)`,
          code: lines[startLine - 1] || ''
        });
      }
    },
    FunctionExpression(node) {
      const startLine = getLineNumberFromIndex(content, node.start);
      const endLine = getLineNumberFromIndex(content, node.end);
      const functionLength = endLine - startLine;
      
      if (functionLength > MAX_FUNCTION_LENGTH) {
        const parentNode = findParentNode(ast, node);
        const functionName = parentNode && parentNode.type === 'VariableDeclarator' && parentNode.id ? 
          parentNode.id.name : 'anonymous';
        
        console.log(`Found long function expression: ${functionName} (${functionLength} lines)`);
        issues.push({
          type: 'Long Function',
          filePath,
          line: startLine,
          message: `Function '${functionName}' is too long (${functionLength} lines)`,
          code: lines[startLine - 1] || ''
        });
      }
    },
    ArrowFunctionExpression(node) {
      const startLine = getLineNumberFromIndex(content, node.start);
      const endLine = getLineNumberFromIndex(content, node.end);
      const functionLength = endLine - startLine;
      
      if (functionLength > MAX_FUNCTION_LENGTH) {
        const parentNode = findParentNode(ast, node);
        const functionName = parentNode && parentNode.type === 'VariableDeclarator' && parentNode.id ? 
          parentNode.id.name : 'anonymous';
        
        console.log(`Found long arrow function: ${functionName} (${functionLength} lines)`);
        issues.push({
          type: 'Long Function',
          filePath,
          line: startLine,
          message: `Arrow function '${functionName}' is too long (${functionLength} lines)`,
          code: lines[startLine - 1] || ''
        });
      }
    }
  });
}

/**
 * Check for deeply nested code
 */
function checkForDeeplyNestedCode(ast, content, filePath, lines, issues) {
  const MAX_NESTING_LEVEL = 3; // Maximum nesting level
  
  function checkNesting(node, level = 0) {
    if (!node) return;
    
    if (
      (node.type === 'IfStatement' || 
       node.type === 'ForStatement' || 
       node.type === 'WhileStatement' || 
       node.type === 'DoWhileStatement' || 
       node.type === 'ForInStatement' || 
       node.type === 'ForOfStatement') && 
      level >= MAX_NESTING_LEVEL
    ) {
      const line = getLineNumberFromIndex(content, node.start);
      console.log(`Found deeply nested code at line ${line} (${level + 1} levels)`);
      issues.push({
        type: 'Deeply Nested Code',
        filePath,
        line,
        message: `Code is nested too deeply (${level + 1} levels)`,
        code: lines[line - 1] || ''
      });
    }
    
    // Recursively check children
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => {
            if (child && typeof child === 'object') {
              const newLevel = 
                (node.type === 'IfStatement' || 
                 node.type === 'ForStatement' || 
                 node.type === 'WhileStatement' || 
                 node.type === 'DoWhileStatement' || 
                 node.type === 'ForInStatement' || 
                 node.type === 'ForOfStatement') ? level + 1 : level;
              
              checkNesting(child, newLevel);
            }
          });
        } else if (
          key === 'body' || 
          key === 'consequent' || 
          key === 'alternate'
        ) {
          const newLevel = 
            (node.type === 'IfStatement' || 
             node.type === 'ForStatement' || 
             node.type === 'WhileStatement' || 
             node.type === 'DoWhileStatement' || 
             node.type === 'ForInStatement' || 
             node.type === 'ForOfStatement') ? level + 1 : level;
          
          checkNesting(node[key], newLevel);
        }
      }
    }
  }
  
  checkNesting(ast);
}

/**
 * Check for dead code (code after return statements)
 */
function checkForDeadCode(ast, content, filePath, lines, issues) {
  walk.simple(ast, {
    BlockStatement(node) {
      if (!node.body || node.body.length <= 1) return;
      
      let foundReturn = false;
      let returnLine = -1;
      
      for (let i = 0; i < node.body.length; i++) {
        const statement = node.body[i];
        
        if (foundReturn) {
          // Found code after return
          const line = getLineNumberFromIndex(content, statement.start);
          console.log(`Found dead code at line ${line} (after return at line ${returnLine})`);
          issues.push({
            type: 'Dead Code',
            filePath,
            line,
            message: 'Unreachable code after return statement',
            code: lines[line - 1] || ''
          });
          break; // Only report the first instance
        }
        
        if (statement.type === 'ReturnStatement') {
          foundReturn = true;
          returnLine = getLineNumberFromIndex(content, statement.start);
        }
      }
    }
  });
}

/**
 * Helper function to get line number from character index
 */
function getLineNumberFromIndex(content, index) {
  const lines = content.slice(0, index).split('\n');
  return lines.length;
}

/**
 * Helper function to find parent node
 */
function findParentNode(ast, targetNode) {
  let result = null;
  
  walk.ancestor(ast, {
    VariableDeclarator(node, ancestors) {
      if (node.init === targetNode) {
        result = node;
      }
    },
    AssignmentExpression(node, ancestors) {
      if (node.right === targetNode) {
        result = node;
      }
    },
    Property(node, ancestors) {
      if (node.value === targetNode) {
        result = node;
      }
    }
  });
  
  return result;
}

module.exports = {
  scanDirectory,
  scanFile
};