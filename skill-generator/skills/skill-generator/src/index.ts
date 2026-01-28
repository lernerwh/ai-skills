/**
 * Skill Generator - 技能自动生成器
 *
 * 让 AI 自动创建新技能的元技能
 *
 * @module skill-generator
 */

import { generateSkill } from './core/generator';
import { analyzeRequirement, extractSkillConfig } from './utils/skill-parser';
import {
  SkillConfig,
  GeneratedSkill,
  RequirementAnalysis,
  ValidationResult,
  SkillTemplateType,
} from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 技能生成器主类
 */
export class SkillGenerator {
  private basePath: string;

  constructor(basePath: string = '.') {
    this.basePath = basePath;
  }

  /**
   * 从用户输入生成技能
   */
  async generateFromInput(
    userInput: string,
    options: {
      name?: string;
      description?: string;
      type?: SkillTemplateType;
      autoWrite?: boolean;
    } = {}
  ): Promise<GeneratedSkill> {
    console.log(`🤖 分析需求: ${userInput.slice(0, 100)}...`);

    // 分析需求
    const analysis = analyzeRequirement(userInput);
    console.log(`📊 分析结果:`);
    console.log(`   - 技能名称: ${analysis.skillName}`);
    console.log(`   - 技能类型: ${analysis.suggestedType}`);
    console.log(`   - 需要代码: ${analysis.needsCode}`);
    console.log(`   - 需要工具: ${analysis.requiredTools.join(', ') || '无'}`);

    // 生成技能
    const skill = await generateSkill(userInput, this.basePath, options);

    // 如果启用了自动写入
    if (options.autoWrite) {
      await this.writeSkillFiles(skill);
      console.log(`✅ 技能文件已写入: ${skill.path}`);
    }

    return skill;
  }

  /**
   * 写入技能文件到磁盘
   */
  async writeSkillFiles(skill: GeneratedSkill): Promise<void> {
    for (const file of skill.files) {
      const filePath = path.join(this.basePath, file.path);
      const dirPath = path.dirname(filePath);

      // 确保目录存在
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // 写入文件
      fs.writeFileSync(filePath, file.content, 'utf-8');
    }
  }

  /**
   * 验证生成的技能
   */
  validateSkill(skill: GeneratedSkill): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证技能名称
    if (!skill.name || !/^[a-z][a-z0-9-]*$/.test(skill.name)) {
      errors.push('技能名称必须是小写字母、数字和连字符，且以字母开头');
    }

    // 验证 SKILL.md 格式
    if (!skill.skillMd.includes('---') || !skill.skillMd.includes('name:')) {
      errors.push('SKILL.md 格式无效：缺少 frontmatter 或 name 字段');
    }

    // 验证文件列表
    const requiredFiles = [
      'SKILL.md',
      'README.md',
      'plugin.json',
      'package.json',
    ];

    for (const requiredFile of requiredFiles) {
      if (!skill.files.some(f => f.path.endsWith(requiredFile))) {
        errors.push(`缺少必需文件: ${requiredFile}`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 获取技能预览
   */
  previewSkill(userInput: string): string {
    const analysis = analyzeRequirement(userInput);
    const config = extractSkillConfig(userInput);

    return `
## 📋 技能预览

### 基本信息
- **名称**: \`${analysis.skillName}\`
- **类型**: ${analysis.suggestedType}
- **描述**: ${analysis.description}

### 触发条件
${analysis.triggers.map((t, i) => `${i + 1}. ${t}`).join('\n')}

### 技术规格
- **需要代码**: ${analysis.needsCode ? '是' : '否'}
- **工具权限**: ${analysis.requiredTools.join(', ') || '无'}

### 预计文件
- skills/${analysis.skillName}/SKILL.md
- skills/${analysis.skillName}/README.md
${analysis.needsCode ? `- skills/${analysis.skillName}/src/index.ts\n- skills/${analysis.skillName}/src/types.ts` : ''}
- .claude-plugin/plugin.json
- package.json
`;
  }
}

/**
 * 快捷函数：生成技能
 */
export async function createSkill(
  userInput: string,
  options: {
    basePath?: string;
    name?: string;
    description?: string;
    type?: SkillTemplateType;
    autoWrite?: boolean;
  } = {}
): Promise<GeneratedSkill> {
  const generator = new SkillGenerator(options.basePath || '.');
  return generator.generateFromInput(userInput, options);
}

/**
 * 快捷函数：预览技能
 */
export function previewSkill(userInput: string): string {
  const generator = new SkillGenerator();
  return generator.previewSkill(userInput);
}

// 导出类型
export * from './types';
export * from './core/generator';
export * from './utils/skill-parser';

/**
 * 默认导出
 */
export default SkillGenerator;
