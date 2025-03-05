export function parseProgram(program) {
    const regex = /([a-z_][a-zA-Z0-9_]*)\s*\(([\w\s,]*)\)/g;
    let result = [];
    let match;
  
    while ((match = regex.exec(program)) !== null) {
      let name = match[1];
      let arity = match[2].split(",").length
      if(!result.some(obj => obj.name === name && obj.arity === arity)){
        result.push({ name: name, arity: arity });
      }
    }
  
    return result;
  }