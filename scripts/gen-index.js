#!/usr/bin/env node
/*
 * 重新生成 generator/src/index.ts 的注册清单。
 *
 * 新增 / 删除生成器后跑一次:
 *     node scripts/gen-index.js
 * 键名 = 文件名去掉 .ts,因为派发就是按 AST 节点类型 / 库名查表的。
 */
const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "src");
const list = (dir) =>
    fs.readdirSync(dir)
        .filter((f) => f.endsWith(".ts") && f !== "index.ts")
        .map((f) => f.slice(0, -3))
        .sort();

const stmts = list(path.join(src, "generator"));
const types_ = list(path.join(src, "generator", "types"));
const blibs = list(path.join(src, "generator", "CallExpressionSub"));
const vlibs = list(path.join(src, "generator", "types", "CallExpressionSub"));

const block = (label, fn, arg, names, sub) => {
    const head = `// ---- ${label}(${names.length}) ----`;
    const body = names.map((n) =>
        arg
            ? `${fn}("${arg}", "${n}", require("./generator/${sub}${n}"));`
            : `${fn}("${n}", require("./generator/${sub}${n}"));`
    );
    return [head, ...body].join("\n");
};

const total = stmts.length + types_.length + blibs.length + vlibs.length;
const out = `import {
    registerStatement,
    registerType,
    registerLibrary,
} from "@jvavscratch/core";

// 本文件由 scripts/gen-index.js 生成,请勿手改;新增生成器后重跑该脚本。
// 共注册 ${total} 个实现:语句 ${stmts.length} + 值 ${types_.length} + 块库 ${blibs.length} + 值库 ${vlibs.length}。

${block("语句生成器", "registerStatement", null, stmts, "")}

${block("值生成器", "registerType", null, types_, "types/")}

${block("块库", "registerLibrary", "block", blibs, "CallExpressionSub/")}

${block("值库", "registerLibrary", "value", vlibs, "types/CallExpressionSub/")}

export * from "./optimise";
`;

fs.writeFileSync(path.join(src, "index.ts"), out);
console.log(`generator/src/index.ts 已重新生成,共 ${total} 个实现`);
