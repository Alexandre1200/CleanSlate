// Example file with code hygiene issues for testing

// This function is never used
function unusedFunction() {
  console.log("This function is never called");
}

// This is a very long function with deep nesting
function processData(data) {
  let result = [];
  
  // TODO: Optimize this loop
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    
    if (item.type === 'user') {
      if (item.status === 'active') {
        if (item.role === 'admin') {
          // Deeply nested code (3 levels)
          if (item.permissions.includes('write')) {
            // Even deeper nesting (4 levels)
            for (let j = 0; j < item.groups.length; j++) {
              if (item.groups[j].type === 'special') {
                result.push({
                  id: item.id,
                  name: item.name,
                  specialAccess: true
                });
              }
            }
          }
        }
      }
    }
  }
  
  return result;
  
  // Dead code after return statement
  console.log("This will never execute");
  result = [];
}

// FIXME: This function needs error handling
function fetchUserData(userId) {
  // Simulate API call
  return {
    id: userId,
    name: 'User ' + userId,
    status: 'active'
  };
}

// This variable is declared but never used
const unusedVariable = "I'm never used";

// Function with too many lines (for demonstration)
function veryLongFunction() {
  console.log("Line 1");
  console.log("Line 2");
  console.log("Line 3");
  console.log("Line 4");
  console.log("Line 5");
  console.log("Line 6");
  console.log("Line 7");
  console.log("Line 8");
  console.log("Line 9");
  console.log("Line 10");
  console.log("Line 11");
  console.log("Line 12");
  console.log("Line 13");
  console.log("Line 14");
  console.log("Line 15");
  console.log("Line 16");
  console.log("Line 17");
  console.log("Line 18");
  console.log("Line 19");
  console.log("Line 20");
  console.log("Line 21");
  console.log("Line 22");
  console.log("Line 23");
  console.log("Line 24");
  console.log("Line 25");
  console.log("Line 26");
  console.log("Line 27");
  console.log("Line 28");
  console.log("Line 29");
  console.log("Line 30");
  console.log("Line 31");
  console.log("Line 32");
  console.log("Line 33");
  console.log("Line 34");
  console.log("Line 35");
  console.log("Line 36");
  console.log("Line 37");
  console.log("Line 38");
  console.log("Line 39");
  console.log("Line 40");
  console.log("Line 41");
  console.log("Line 42");
  console.log("Line 43");
  console.log("Line 44");
  console.log("Line 45");
  console.log("Line 46");
  console.log("Line 47");
  console.log("Line 48");
  console.log("Line 49");
  console.log("Line 50");
  console.log("Line 51");
}

// This function is actually used
function main() {
  const userData = fetchUserData(123);
  const processedData = processData([
    {
      id: 1,
      type: 'user',
      status: 'active',
      role: 'admin',
      permissions: ['read', 'write'],
      groups: [
        { type: 'regular' },
        { type: 'special' }
      ],
      name: 'John Doe'
    }
  ]);
  
  console.log(userData, processedData);
}

// Call the main function
main();