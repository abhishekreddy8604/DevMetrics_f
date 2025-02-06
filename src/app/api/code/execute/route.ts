import { NextResponse } from "next/server";

// Language-specific execution environments
const executeJavaScript = (code: string): string => {
  try {
    const context = {
      console: {
        log: (...args: any[]) => output.push(args.join(' ')),
        error: (...args: any[]) => output.push('Error: ' + args.join(' ')),
        warn: (...args: any[]) => output.push('Warning: ' + args.join(' ')),
      }
    };
    
    const output: string[] = [];
    const fn = new Function('console', code);
    fn(context.console);
    return output.join('\n') || 'No output';
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

const executePython = (code: string): string => {
  try {
    // Basic Python code simulation
    const output: string[] = [];
    
    // Handle print statements
    code = code.replace(/print\((.*?)\)/g, (_, args) => {
      output.push(eval(args));
      return '';
    });

    // Handle basic variable assignments
    const variables: Record<string, any> = {};
    code.split('\n').forEach(line => {
      const assignment = line.match(/^(\w+)\s*=\s*(.+)$/);
      if (assignment) {
        const [_, name, value] = assignment;
        variables[name] = eval(value);
      }
    });

    return output.join('\n') || 'No output';
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

const executeTypeScript = (code: string): string => {
  try {
    // Convert TypeScript to JavaScript (basic transformation)
    const jsCode = code
      .replace(/: \w+/g, '') // Remove type annotations
      .replace(/interface \w+\s*\{[\s\S]*?\}/g, '') // Remove interfaces
      .replace(/type \w+\s*=[\s\S]*?;/g, ''); // Remove type definitions

    return executeJavaScript(jsCode);
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

const executeCpp = (code: string): string => {
  try {
    // Simulate C++ output for basic programs
    const output: string[] = [];
    
    // Handle cout statements
    code = code.replace(/cout\s*<<\s*(.*?)\s*;/g, (_, args) => {
      output.push(eval(args));
      return '';
    });

    return output.join('\n') || 'No output';
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

const executeJava = (code: string): string => {
  try {
    // Simulate Java output for basic programs
    const output: string[] = [];
    
    // Handle System.out.println statements
    code = code.replace(/System\.out\.println\((.*?)\);/g, (_, args) => {
      output.push(eval(args));
      return '';
    });

    return output.join('\n') || 'No output';
  } catch (error) {
    return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    let output: string;
    
    switch (language.toLowerCase()) {
      case 'javascript':
        output = executeJavaScript(code);
        break;
      case 'typescript':
        output = executeTypeScript(code);
        break;
      case 'python':
        output = executePython(code);
        break;
      case 'java':
        output = executeJava(code);
        break;
      case 'cpp':
        output = executeCpp(code);
        break;
      default:
        output = `Language '${language}' is not supported yet`;
    }

    return NextResponse.json({
      output,
      language,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("[CODE_EXECUTE]", error);
    return NextResponse.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    );
  }
}
