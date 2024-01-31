# my-mini-vue

学习vue3，实现vue3最核心的功能，采用monorepo架构，使用pnpm进行项目管理。

运行`pnpm run build`生成打包后的文件，放在packages/vue/dist目录下。

# 项目结构

reactivity - 响应式核心功能

runtime-core - 运行时核心

runtime-dom - 运行时的dom实现

compiler-core - 模板转义功能

shared - 公共方法

vue - 项目总入口

页面调试的事例放在packages/vue/examples目录下。
