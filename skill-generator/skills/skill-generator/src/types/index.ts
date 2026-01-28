/**
 * 技能生成器 - 类型定义
 */

/**
 * 技能配置
 */
export interface SkillConfig {
  /** 技能名称 (kebab-case) */
  name: string;
  /** 技能描述 */
  description: string;
  /** 技能标题 */
  title: string;
  /** 版本号 */
  version?: string;
  /** 作者 */
  author?: string;
  /** 触发条件列表 */
  triggers: TriggerCondition[];
  /** 使用示例 */
  examples: string[];
  /** 是否需要代码实现 */
  hasCode?: boolean;
  /** 需要的工具权限 */
  tools?: string[];
  /** 配置项 */
  configurations?: ConfigItem[];
}

/**
 * 触发条件
 */
export interface TriggerCondition {
  /** 条件标题 */
  title: string;
  /** 条件描述 */
  description: string;
  /** 示例用户输入 */
  examples: string[];
}

/**
 * 配置项
 */
export interface ConfigItem {
  /** 配置名称 */
  name: string;
  /** 配置类型 */
  type: 'env' | 'file' | 'option';
  /** 是否必需 */
  required: boolean;
  /** 描述 */
  description: string;
}

/**
 * 生成的技能结构
 */
export interface GeneratedSkill {
  /** 技能名称 */
  name: string;
  /** 技能目录路径 */
  path: string;
  /** 生成的文件列表 */
  files: GeneratedFile[];
  /** SKILL.md 内容 */
  skillMd: string;
  /** README.md 内容 */
  readmeMd: string;
}

/**
 * 生成的文件
 */
export interface GeneratedFile {
  /** 文件路径 */
  path: string;
  /** 文件内容 */
  content: string;
}

/**
 * 用户需求分析结果
 */
export interface RequirementAnalysis {
  /** 检测到的技能名称 */
  skillName: string;
  /** 检测到的技能描述 */
  description: string;
  /** 检测到的触发条件 */
  triggers: string[];
  /** 检测到的关键词 */
  keywords: string[];
  /** 建议的技能类型 */
  suggestedType: 'search' | 'analyzer' | 'generator' | 'operator' | 'other';
  /** 是否需要代码实现 */
  needsCode: boolean;
  /** 需要的工具权限 */
  requiredTools: string[];
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否通过 */
  success: boolean;
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
}

/**
 * 技能模板类型
 */
export enum SkillTemplateType {
  /** 简单技能（仅文档） */
  SIMPLE = 'simple',
  /** 中等技能（带基础代码） */
  MEDIUM = 'medium',
  /** 复杂技能（完整TypeScript项目） */
  COMPLEX = 'complex',
}
