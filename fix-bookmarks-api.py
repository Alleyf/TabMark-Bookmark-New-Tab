#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
修复Firefox书签API调用 - 将回调风格转换为Promise风格
"""

import re

def fix_bookmarks_api_calls(content):
    """修复书签API调用，使用Promise风格"""

    # 替换 getChildren 调用
    patterns = [
        # 替换 api.bookmarks.getChildren(parentId, callback) => await bookmarksAPI.getChildren(parentId)
        (
            r'api\.bookmarks\.getChildren\(([^,]+),\s*function\s*\([^)]*\)\s*{',
            r'(async () => {\n      try {\n        const bookmarks = await bookmarksAPI.getChildren(\1);'
        ),
        # 替换 api.bookmarks.getTree(callback) => await bookmarksAPI.getTree()
        (
            r'api\.bookmarks\.getTree\(\s*function\s*\([^)]*\)\s*{',
            r'(async () => {\n      try {\n        const tree = await bookmarksAPI.getTree();'
        ),
        # 替换 api.bookmarks.search(query, callback) => await bookmarksAPI.search(query)
        (
            r'api\.bookmarks\.search\(([^,]+),\s*function\s*\([^)]*\)\s*{',
            r'(async () => {\n      try {\n        const results = await bookmarksAPI.search(\1);'
        ),
    ]

    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)

    return content

# 读取文件
with open('src/script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复API调用
fixed_content = fix_bookmarks_api_calls(content)

# 保存文件
with open('src/script.js', 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print("✅ 已修复书签API调用")
