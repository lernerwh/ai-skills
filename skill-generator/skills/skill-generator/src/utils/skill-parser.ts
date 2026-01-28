/**
 * 需求分析器 - 分析用户输入，提取技能需求
 */

import { RequirementAnalysis } from '../types';

/**
 * 关键词映射表
 */
const KEYWORD_MAP = {
  // 搜索类
  search: ['搜索', '查找', 'search', 'find', '查询', '寻找'],
  // 分析类
  analyze: ['分析', '解析', 'analyze', '解析器', '分析器'],
  // 生成类
  generate: ['生成', '创建', 'generate', 'create', '自动生成', '自动创建'],
  // 操作类
  operate: ['清理', '删除', '更新', 'clean', 'delete', 'update', '操作'],
};

/**
 * 技能类型前缀
 */
const SKILL_PREFIXES = {
  search: 'search',
  analyze: 'analyzer',
  generate: 'generator',
  operate: 'cleaner',
};

/**
 * 工具权限关键词
 */
const TOOL_KEYWORDS = {
  Read: ['读取文件', '查看文件', 'read file', '查看代码'],
  Write: ['写入文件', '创建文件', '修改文件', 'write file'],
  Bash: ['执行命令', '运行脚本', '执行操作', 'run command'],
  WebSearch: ['搜索', '网上查找', 'web search'],
  Grep: ['搜索代码', '查找代码', 'grep'],
};

/**
 * 分析用户需求
 */
export function analyzeRequirement(userInput: string): RequirementAnalysis {
  const analysis: RequirementAnalysis = {
    skillName: '',
    description: '',
    triggers: [],
    keywords: [],
    suggestedType: 'other',
    needsCode: false,
    requiredTools: [],
  };

  // 提取关键词
  analysis.keywords = extractKeywords(userInput);

  // 确定技能类型
  analysis.suggestedType = determineSkillType(userInput);

  // 提取技能名称
  analysis.skillName = extractSkillName(userInput, analysis.suggestedType);

  // 生成描述
  analysis.description = generateDescription(userInput, analysis.skillName);

  // 提取触发条件
  analysis.triggers = extractTriggers(userInput);

  // 判断是否需要代码
  analysis.needsCode = determineNeedsCode(userInput);

  // 确定需要的工具
  analysis.requiredTools = determineRequiredTools(userInput);

  return analysis;
}

/**
 * 提取关键词
 */
function extractKeywords(input: string): string[] {
  const keywords: string[] = [];
  const lowerInput = input.toLowerCase();

  for (const [type, words] of Object.entries(KEYWORD_MAP)) {
    for (const word of words) {
      if (lowerInput.includes(word.toLowerCase())) {
        keywords.push(type);
      }
    }
  }

  return [...new Set(keywords)];
}

/**
 * 确定技能类型
 */
function determineSkillType(input: string): RequirementAnalysis['suggestedType'] {
  const lowerInput = input.toLowerCase();

  for (const [type, words] of Object.entries(KEYWORD_MAP)) {
    for (const word of words) {
      if (lowerInput.includes(word.toLowerCase())) {
        switch (type) {
          case 'search':
            return 'search';
          case 'analyze':
            return 'analyzer';
          case 'generate':
            return 'generator';
          case 'operate':
            return 'operator';
        }
      }
    }
  }

  return 'other';
}

/**
 * 提取技能名称
 */
function extractSkillName(input: string, type: RequirementAnalysis['suggestedType']): string {
  // 尝试提取用户明确指定的名称
  const patterns = [
    /叫\s*["']?([\w-]+)["']?/,
    /名为\s*["']?([\w-]+)["']?/,
    /名称[是为]\s*["']?([\w-]+)["']?/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      return toKebabCase(match[1]);
    }
  }

  // 根据功能推断名称
  const functionWords = extractFunctionWords(input);
  if (functionWords.length > 0) {
    const prefix = SKILL_PREFIXES[type] || 'skill';
    const suffix = functionWords[0];
    return `${prefix}-${suffix}`;
  }

  // 默认名称
  return `custom-${type}`;
}

/**
 * 提取功能词汇
 */
function extractFunctionWords(input: string): string[] {
  const words: string[] = [];

  // 常见功能词汇
  const functionPatterns = [
    '日志', 'log',
    '代码', 'code',
    '文件', 'file',
    '测试', 'test',
    '文档', 'doc',
    '错误', 'error',
    '性能', 'performance',
    'git',
  ];

  const lowerInput = input.toLowerCase();
  for (const word of functionPatterns) {
    if (lowerInput.includes(word.toLowerCase())) {
      words.push(toKebabCase(word));
    }
  }

  return words;
}

/**
 * 生成描述
 */
function generateDescription(input: string, skillName: string): string {
  // 尝试提取用户输入中的描述部分
  const patterns = [
    /用来(.+)/,
    /可以(.+)/,
    /能够(.+)/,
    /实现(.+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // 默认描述
  return `自动${input.slice(0, 50)}...`;
}

/**
 * 提取触发条件
 */
function extractTriggers(input: string): string[] {
  const triggers: string[] = [];

  // 分析用户输入，提取可能的触发场景
  if (input.includes('分析') || input.includes('analyze')) {
    triggers.push('用户要求分析某项内容');
  }
  if (input.includes('生成') || input.includes('generate')) {
    triggers.push('用户要求生成某项内容');
  }
  if (input.includes('搜索') || input.includes('search')) {
    triggers.push('用户要求搜索某项内容');
  }
  if (input.includes('创建') || input.includes('create')) {
    triggers.push('用户要求创建某项内容');
  }

  return triggers;
}

/**
 * 判断是否需要代码实现
 */
function determineNeedsCode(input: string): boolean {
  // 包含这些词时需要代码
  const codeKeywords = [
    '实现', 'implement', 'parse', '解析', 'process', '处理',
    '计算', 'calculate', 'transform', '转换', 'validate', '验证'
  ];

  const lowerInput = input.toLowerCase();
  return codeKeywords.some(keyword => lowerInput.includes(keyword));
}

/**
 * 确定需要的工具权限
 */
function determineRequiredTools(input: string): string[] {
  const tools: string[] = [];
  const lowerInput = input.toLowerCase();

  for (const [tool, keywords] of Object.entries(TOOL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        tools.push(tool);
        break;
      }
    }
  }

  // 默认需要 Read
  if (tools.length === 0) {
    tools.push('Read');
  }

  return [...new Set(tools)];
}

/**
 * 转换为 kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * 从用户输入中智能提取技能配置
 */
export function extractSkillConfig(userInput: string): Partial<RequirementAnalysis> {
  const analysis = analyzeRequirement(userInput);

  return {
    skillName: analysis.skillName,
    description: analysis.description,
    suggestedType: analysis.suggestedType,
    needsCode: analysis.needsCode,
    requiredTools: analysis.requiredTools,
  };
}
