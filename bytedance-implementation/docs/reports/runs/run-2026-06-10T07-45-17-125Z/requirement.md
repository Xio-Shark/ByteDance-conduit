# Requirement

```json
{
  "id": "REQ-001",
  "source_input": "在文章详情页底部显示「本文共 XXX 字，预计阅读 Y 分钟」，前端基于 Article.body 计算字数",
  "goal": "在文章详情页底部展示字数与预计阅读时间",
  "scope": {
    "include": [
      "文章详情页底部区域",
      "前端计算字数并显示",
      "预计阅读时间根据字数估算（假设每分钟阅读300字）"
    ],
    "exclude": [
      "后端存储字数或阅读时间",
      "其他页面"
    ]
  },
  "assumptions": [
    "前端已有Article.body数据",
    "阅读速度按300字/分钟计算",
    "用户浏览时实时计算"
  ],
  "clarifications": [
    "具体阅读速度标准是否固定？先假定300字/分钟"
  ],
  "acceptance": [
    "文章详情页底部显示\"本文共 XXX 字，预计阅读 Y 分钟\"",
    "字数由前端根据Article.body内容实时计算",
    "Y分钟向上取整（至少1分钟）"
  ],
  "level": "L1"
}
```
