const pythonPrependScript = `
import sys
from io import StringIO

all_input = sys.stdin.read().strip().splitlines()

for line in all_input:
    sys.stdin = StringIO(line)
    # User code will be appended below this
`

const javascriptPrependScript = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let inputLines = '';

// Collect all input at once
rl.on('line', (line) => {
  inputLines += line;
  inputLines += '\\n';
});


rl.on('close', () => {
  const lines = inputLines.trim().split('\\n'); // Now process all input at once

  const func = (input) => {
`

const javascriptAppendScript = `
  }
  lines.forEach(input => func(input))
});
`
// only python3 and js code can be run against test cases (for now)
export const formatRawCode = (rawCode: string, language: string) => {
    if (language === 'python3') {
        const formattedRawCode = rawCode
            .split('\n')
            .map(line => `    ${line}`) // push the rawCode 4 spaces to the right (equivalent to 1 tab)
            .join('\n')
        const combinedScript = `${pythonPrependScript}\n${formattedRawCode}`
        return combinedScript
    }
            
    if (language === 'nodejs') { // same as javascript
        const formattedRawCode = rawCode
        .split('\n')
        .map(line => `    ${line}`) // Indent user code by 4 spaces
        .join('\n');
        
        const combinedScript = `${javascriptPrependScript}\n${formattedRawCode}\n${javascriptAppendScript}\n`;
        return combinedScript;
    }

    // for all languagues that are currently not supported, simply return the rawCode
    return rawCode
    
}