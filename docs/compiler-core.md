# compiler-core
将template内容解析为render函数


## 简易步骤：

1. 通过baseParse生成AST(基于HTML规则解析，最终是树结构)。
2. 使用transform处理AST（根据不同的类型处理AST，比如element，comment，text等）
3. 生成最终的render函数

示例

[https://template-explorer.vuejs.org/#eyJzcmMiOiJoaSIsInNzciI6ZmFsc2UsIm9wdGlvbnMiOnsiaG9pc3RTdGF0aWMiOnRydWV9fQ==](https://template-explorer.vuejs.org/#eyJzcmMiOiJoaSIsInNzciI6ZmFsc2UsIm9wdGlvbnMiOnsiaG9pc3RTdGF0aWMiOnRydWV9fQ==)