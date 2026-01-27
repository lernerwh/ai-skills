export type QuestionType =
  | 'implementation'  // 如何实现
  | 'debugging'       // 调试问题
  | 'selection'       // 技术选型
  | 'best-practice';  // 最佳实践

export class QueryBuilder {
  /**
   * 分析问题类型
   */
  analyzeQuestionType(question: string): QuestionType {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('如何') || lowerQ.includes('怎么') || lowerQ.includes('how to')) {
      return 'implementation';
    }

    if (lowerQ.includes('错误') || lowerQ.includes('bug') || lowerQ.includes('为什么')) {
      return 'debugging';
    }

    if (lowerQ.includes('哪个') || lowerQ.includes('选择') || lowerQ.includes('用什么')) {
      return 'selection';
    }

    if (lowerQ.includes('最佳') || lowerQ.includes('推荐') || lowerQ.includes('建议')) {
      return 'best-practice';
    }

    return 'implementation'; // 默认
  }

  /**
   * 根据问题类型构建查询
   */
  buildQuery(question: string, questionType: QuestionType): string {
    const baseQuery = this.extractKeywords(question);

    switch (questionType) {
      case 'implementation':
        return `${baseQuery} example`;

      case 'debugging':
        return `${baseQuery} error fix`;

      case 'selection':
        return `${baseQuery} stars:>100`;

      case 'best-practice':
        return `${baseQuery} best practices`;

      default:
        return baseQuery;
    }
  }

  /**
   * 提取关键词
   */
  private extractKeywords(question: string): string {
    // 移除常见的提问词
    const stopWords = ['如何', '怎么', '怎样', '怎么样',
                       '如何实现', '怎么写', '怎么用',
                       'how to', 'how do i', 'how can'];

    let result = question.toLowerCase();

    for (const word of stopWords) {
      result = result.replace(new RegExp(word, 'gi'), '');
    }

    return result.trim();
  }

  /**
   * 推断编程语言
   */
  inferLanguage(question: string): string | undefined {
    const languages = [
      'javascript', 'typescript', 'python', 'java', 'rust',
      'go', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin'
    ];

    const lowerQ = question.toLowerCase();

    for (const lang of languages) {
      if (lowerQ.includes(lang)) {
        return lang;
      }
    }

    return undefined;
  }
}
