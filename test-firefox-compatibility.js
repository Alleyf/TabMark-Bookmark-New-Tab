#!/usr/bin/env node

/**
 * Firefox兼容性验证脚本
 * 检查所有JS文件是否正确使用了兼容性API
 */

const fs = require('fs');
const path = require('path');

// 需要检查的文件
const filesToCheck = [
  'src/background.js',
  'src/content.js',
  'src/script.js',
  'src/sidepanel-manager.js',
  'src/sidepanel-navigation.js',
  'src/quick-links.js',
  'src/settings.js',
  'src/wallpaper.js',
  'src/search-engine-dropdown.js',
  'src/welcome.js',
  'src/localization.js',
  'src/feature-tips.js',
  'src/gesture-navigation.js',
  'src/progress.js',
  'src/navigation-handler.js',
  'src/bookmark-cleanup.js'
];

// 需要检查的API调用模式
const apiPatterns = [
  {
    pattern: /chrome\.runtime\.sendMessage(?!\()/g,
    replacement: 'api.runtime.sendMessage',
    description: 'runtime.sendMessage'
  },
  {
    pattern: /chrome\.storage\.local(?!\.)/g,
    replacement: 'api.storage.local',
    description: 'storage.local'
  },
  {
    pattern: /chrome\.storage\.sync(?!\.)/g,
    replacement: 'api.storage.sync',
    description: 'storage.sync'
  },
  {
    pattern: /chrome\.bookmarks(?!\.)/g,
    replacement: 'api.bookmarks',
    description: 'bookmarks'
  },
  {
    pattern: /chrome\.tabs(?!\.)/g,
    replacement: 'api.tabs',
    description: 'tabs'
  },
  {
    pattern: /chrome\.commands(?!\.)/g,
    replacement: 'api.commands',
    description: 'commands'
  },
  {
    pattern: /chrome\.history(?!\.)/g,
    replacement: 'api.history',
    description: 'history'
  },
  {
    pattern: /chrome\.action(?!\.)/g,
    replacement: 'api.action',
    description: 'action'
  },
  {
    pattern: /chrome\.management(?!\.)/g,
    replacement: 'api.management',
    description: 'management'
  }
];

// 允许的例外（在兼容性代码或注释中）
const exceptions = [
  'chrome.runtime.lastError',
  'chrome.runtime.getURL',
  'chrome.sidePanel',
  '// Chrome',
  '/* Chrome',
  '# Chrome',
  'chrome.runtime',
  'chrome: //',
  'chrome://',
  'chrome-devtools',
  'chrome.extension'
];

function isException(line) {
  return exceptions.some(exc => line.includes(exc));
}

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ 文件不存在: ${filePath}`);
    return { file: filePath, issues: [], hasCompatLayer: false };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  // 检查是否有兼容性层
  const hasCompatLayer = content.includes('Firefox 兼容性层') ||
                         content.includes('isFirefox') ||
                         content.includes('const api =');

  const issues = [];

  lines.forEach((line, index) => {
    // 检查每个API模式
    apiPatterns.forEach(api => {
      if (api.pattern.test(line) && !isException(line)) {
        issues.push({
          line: index + 1,
          pattern: api.description,
          text: line.trim().substring(0, 60),
          suggestion: `应使用: ${api.replacement}`
        });
      }
    });
  });

  return {
    file: filePath,
    hasCompatLayer,
    issues
  };
}

function main() {
  console.log('🔍 开始检查Firefox兼容性...\n');

  const results = filesToCheck.map(checkFile);
  let totalIssues = 0;
  let filesWithoutCompat = 0;

  results.forEach(result => {
    console.log(`\n📄 ${result.file}`);

    if (!result.hasCompatLayer) {
      console.log(`  ⚠️  缺少兼容性层`);
      filesWithoutCompat++;
    } else {
      console.log(`  ✅ 包含兼容性层`);
    }

    if (result.issues.length > 0) {
      console.log(`  ⚠️  发现 ${result.issues.length} 个问题:`);
      result.issues.forEach(issue => {
        console.log(`    - 行 ${issue.line}: ${issue.pattern}`);
        console.log(`      ${issue.text}...`);
        console.log(`      💡 ${issue.suggestion}`);
        totalIssues++;
      });
    } else {
      console.log(`  ✅ 未发现API调用问题`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 检查总结:');
  console.log(`  总文件数: ${filesToCheck.length}`);
  console.log(`  包含兼容性层: ${results.length - filesWithoutCompat}`);
  console.log(`  缺少兼容性层: ${filesWithoutCompat}`);
  console.log(`  总问题数: ${totalIssues}`);
  console.log('='.repeat(60));

  if (totalIssues === 0 && filesWithoutCompat === 0) {
    console.log('\n✅ 所有文件都符合Firefox兼容性要求！');
    process.exit(0);
  } else {
    console.log('\n⚠️  发现问题，请修复后再提交。');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkFile };
