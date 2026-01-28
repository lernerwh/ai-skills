/**
 * 技能生成器核心 - 根据分析结果生成技能文件
 */

import { SkillConfig, GeneratedSkill, GeneratedFile, SkillTemplateType } from '../types';
import { analyzeRequirement } from '../utils/skill-parser';

/**
 * 生成新技能
 */
export async function generateSkill(
  userInput: string,
  basePath: string = '.',
  options: {
    name?: string;
    description?: string;
    type?: SkillTemplateType;
  } = {}
): Promise<GeneratedSkill> {
  // 分析用户需求
  const analysis = analyzeRequirement(userInput);

  // 确定技能配置
  const config: SkillConfig = {
    name: options.name || analysis.skillName,
    description: options.description || analysis.description,
    title: toTitleCase(analysis.skillName),
    version: '1.0.0',
    author: 'AI Generated',
    triggers: generateTriggers(analysis),
    examples: generateExamples(analysis),
    hasCode: analysis.needsCode,
    tools: analysis.requiredTools,
  };

  // 确定模板类型
  const templateType = options.type || (analysis.needsCode ? SkillTemplateType.COMPLEX : SkillTemplateType.SIMPLE);

  // 生成技能目录
  const skillPath = `${basePath}/${config.name}`;

  // 生成文件
  const files: GeneratedFile[] = [];

  // 1. 生成 SKILL.md
  const skillMd = generateSkillMd(config);
  files.push({
    path: `${skillPath}/skills/${config.name}/SKILL.md`,
    content: skillMd,
  });

  // 2. 生成 README.md
  const readmeMd = generateReadmeMd(config);
  files.push({
    path: `${skillPath}/skills/${config.name}/README.md`,
    content: readmeMd,
  });

  // 3. 生成 plugin.json
  const pluginJson = generatePluginJson(config);
  files.push({
    path: `${skillPath}/.claude-plugin/plugin.json`,
    content: pluginJson,
  });

  // 4. 生成 package.json
  const packageJson = generatePackageJson(config);
  files.push({
    path: `${skillPath}/package.json`,
    content: packageJson,
  });

  // 5. 如果需要代码，生成 TypeScript 源码结构
  if (config.hasCode && templateType !== SkillTemplateType.SIMPLE) {
    const sourceFiles = generateSourceFiles(config);
    files.push(...sourceFiles);
  }

  return {
    name: config.name,
    path: skillPath,
    files,
    skillMd,
    readmeMd,
  };
}

/**
 * 生成 SKILL.md
 */
function generateSkillMd(config: SkillConfig): string {
  const triggersSection = config.triggers
    .map((trigger, i) => {
      const examples = trigger.examples
        .map(ex => `   - "${ex}"`)
        .join('\n');
      return `${i + 1}. **${trigger.title}**: ${trigger.description}\n${examples}`;
    })
    .join('\n');

  const toolsSection = config.tools && config.tools.length > 0
    ? `\n## 工具权限\n\n此技能需要以下工具权限：\n\n${config.tools.map(t => `- \`${t}\``).join('\n')}\n`
    : '';

  const configSection = config.configurations && config.configurations.length > 0
    ? `\n## 配置\n\n${config.configurations.map(c => `### ${c.name}\n${c.description}\n${c.required ? '**必需**' : '**可选**'}`).join('\n\n')}\n`
    : '';

  return `---
name: ${config.name}
description: ${config.description}
---

# ${config.title}

${config.description}

## 触发条件

此 skill 在以下情况下自动触发:

${triggersSection}
${toolsSection}
${configSection}
## 使用方式

\`\`\`
# ${config.description}
${config.examples.slice(0, 2).map(ex => `# 示例: ${ex}`).join('\n')}
\`\`\`

## 示例

${config.examples.map((ex, i) => `### 示例 ${i + 1}\n\`\`\`\n输入: ${ex}\n输出: [AI 生成的结果]\n\`\`\``).join('\n\n')}

## 限制

- 此技能由 AI 自动生成，可能需要根据实际情况调整
- 建议在使用前进行测试验证
`;
}

/**
 * 生成 README.md
 */
function generateReadmeMd(config: SkillConfig): string {
  return `# ${config.title} - 使用指南

> ${config.description}

## 快速开始

### 基础用法

\`\`\`
${config.examples[0] || `使用 ${config.name} 技能`}
\`\`\`

### 完整示例

\`\`\`markdown
# 示例：使用 ${config.title}

输入：${config.examples[0] || '用户输入示例'}

输出：[AI 处理结果]
\`\`\`

## 配置

${config.configurations && config.configurations.length > 0
  ? config.configurations.map(c => `### ${c.name}\n- **类型**: ${c.type}\n- **必需**: ${c.required ? '是' : '否'}\n- **说明**: ${c.description}`).join('\n\n')
  : '无需配置'}

## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|-----|------|------|------|
| input | string | 是 | 要处理的输入内容 |
${config.tools && config.tools.includes('Read') ? '| file | string | 否 | 文件路径 |' : ''}

## 使用场景

${config.triggers.map(t => `- **${t.title}**: ${t.description}`).join('\n')}

## 常见问题

### Q: 如何触发此技能？

A: ${config.triggers[0]?.description || '直接描述您的需求，AI 会自动识别并调用此技能'}

### Q: 技能支持哪些输入格式？

A: 支持文本输入${config.tools?.includes('Read') ? '和文件读取' : ''}

## 最佳实践

1. 明确描述您的需求
2. 提供足够的上下文信息
3. 检查生成的结果是否符合预期

## 故障排除

| 问题 | 解决方案 |
|-----|---------|
| 技能未触发 | 检查输入是否包含触发关键词 |
| 结果不准确 | 提供更多上下文信息 |
| 执行失败 | 检查配置是否正确 |

## 更新日志

- **v1.0.0** (${new Date().toISOString().split('T')[0]}): 初始版本
  - 由 AI Skill Generator 自动生成

## 许可证

MIT License

---

**此技能由 [Skill Generator](../skill-generator) 自动生成**
`;
}

/**
 * 生成 plugin.json
 */
function generatePluginJson(config: SkillConfig): string {
  return JSON.stringify(
    {
      name: config.name,
      version: config.version || '1.0.0',
      description: config.description,
      author: {
        name: config.author || 'AI Generated',
      },
      skills: [
        {
          name: config.name,
          path: `skills/${config.name}/SKILL.md`,
        },
      ],
    },
    null,
    2
  );
}

/**
 * 生成 package.json
 */
function generatePackageJson(config: SkillConfig): string {
  const pkg: any = {
    name: config.name,
    version: config.version || '1.0.0',
    description: config.description,
    keywords: [config.name, 'claude-skill', 'ai-skill'],
    author: config.author || 'AI Generated',
    license: 'MIT',
  };

  if (config.hasCode) {
    pkg.main = 'dist/src/index.js';
    pkg.types = 'dist/src/index.d.ts';
    pkg.scripts = {
      build: 'tsc',
      test: 'jest',
      lint: 'eslint src/**/*.ts',
    };
    pkg.dependencies = {
      typescript: '^5.3.0',
    };
    pkg.devDependencies = {
      '@types/node': '^20.0.0',
    };
  }

  return JSON.stringify(pkg, null, 2);
}

/**
 * 生成源码文件
 */
function generateSourceFiles(config: SkillConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // types.ts
  files.push({
    path: `${config.name}/skills/${config.name}/src/types.ts`,
    content: generateTypesFile(config),
  });

  // index.ts
  files.push({
    path: `${config.name}/skills/${config.name}/src/index.ts`,
    content: generateIndexFile(config),
  });

  // utils.ts
  files.push({
    path: `${config.name}/skills/${config.name}/src/utils.ts`,
    content: generateUtilsFile(config),
  });

  // tsconfig.json
  files.push({
    path: `${config.name}/tsconfig.json`,
    content: JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        declaration: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    }, null, 2),
  });

  return files;
}

/**
 * 生成 types.ts
 */
function generateTypesFile(config: SkillConfig): string {
  return `/**
 * ${config.title} - 类型定义
 */

export interface ${toPascalCase(config.name)}Options {
  /** 输入内容 */
  input: string;
  /** 可选配置 */
  options?: {
    [key: string]: any;
  };
}

export interface ${toPascalCase(config.name)}Result {
  /** 处理结果 */
  result: string;
  /** 元数据 */
  metadata?: {
    timestamp: string;
    [key: string]: any;
  };
}
`;
}

/**
 * 生成 index.ts
 */
function generateIndexFile(config: SkillConfig): string {
  const pascalName = toPascalCase(config.name);
  return `/**
 * ${config.title} - 主入口
 */

import { ${pascalName}Options, ${pascalName}Result } from './types';
import { processInput } from './utils';

/**
 * 主函数：处理输入并返回结果
 */
export async function main(options: ${pascalName}Options): Promise<${pascalName}Result> {
  const { input, options: opts = {} } = options;

  // 处理输入
  const result = await processInput(input, opts);

  return {
    result,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}

// 导出主函数供外部使用
export default main;
`;
}

/**
 * 生成 utils.ts
 */
function generateUtilsFile(config: SkillConfig): string {
  return `/**
 * ${config.title} - 工具函数
 */

import { ${toPascalCase(config.name)}Options } from './types';

/**
 * 处理输入内容
 */
export async function processInput(
  input: string,
  options: ${toPascalCase(config.name)}Options['options'] = {}
): Promise<string> {
  // TODO: 实现具体的处理逻辑

  // 示例：简单的文本处理
  const processed = input
    .trim()
    .toLowerCase();

  return processed;
}

/**
 * 验证输入
 */
export function validateInput(input: string): boolean {
  // TODO: 实现输入验证逻辑
  return input.length > 0;
}

/**
 * 格式化输出
 */
export function formatOutput(result: string): string {
  // TODO: 实现输出格式化逻辑
  return result;
}
`;
}

/**
 * 生成触发条件
 */
function generateTriggers(analysis: any): SkillConfig['triggers'] {
  const triggers: SkillConfig['triggers'] = [];

  if (analysis.suggestedType === 'analyzer') {
    triggers.push({
      title: '分析请求',
      description: '用户要求分析某项内容',
      examples: [
        `分析${analysis.keywords.join('或')}`,
        `检查${analysis.keywords[0] || '文件'}`,
      ],
    });
  }

  if (analysis.suggestedType === 'generator') {
    triggers.push({
      title: '生成请求',
      description: '用户要求生成某项内容',
      examples: [
        `生成${analysis.keywords[0] || '内容'}`,
        `创建${analysis.keywords[0] || '文件'}`,
      ],
    });
  }

  if (analysis.suggestedType === 'search') {
    triggers.push({
      title: '搜索请求',
      description: '用户要求搜索某项内容',
      examples: [
        `搜索${analysis.keywords[0] || '内容'}`,
        `查找${analysis.keywords[0] || '文件'}`,
      ],
    });
  }

  // 默认触发条件
  if (triggers.length === 0) {
    triggers.push({
      title: '通用请求',
      description: analysis.description || '用户提出相关请求',
      examples: [
        `使用${analysis.skillName}`,
        `执行${analysis.skillName}操作`,
      ],
    });
  }

  return triggers;
}

/**
 * 生成示例
 */
function generateExamples(analysis: any): string[] {
  const examples: string[] = [];

  if (analysis.keywords.length > 0) {
    examples.push(`${analysis.keywords[0]}相关操作`);
  }

  examples.push(`使用 ${analysis.skillName} 处理数据`);
  examples.push(`${analysis.skillName} 帮助`);

  return examples;
}

// 辅助函数
function toTitleCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
