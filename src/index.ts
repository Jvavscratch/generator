/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : index.ts
* Description       : Generator entry — registers every impl into core's registry
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 09/19/2026  NeuronPulse     Added — registry-based dispatch
/******************************************************************/

/**
 * `@jvavscratch/generator` 的入口。**导入即注册**。
 *
 * core 不能静态依赖 generator(依赖方向是 types ← core ← utils ← generator),
 * 所以由本包在加载时把全部生成器注册进 `@jvavscratch/core` 的派发表。
 * 原先 core 靠 `require(join(__dirname, "../generator/" + node.type))` 拼路径,
 * 仓库拆开后必然指空;改成注册表后两边都只认名字。
 *
 * 这里用 `require` 而不是 `import` 是有意的:各生成器是 `module.exports = fn`
 * 形式的 CommonJS,`import x from` 会被 tsc 判为 TS1192(模块没有默认导出)。
 * 详见 CLAUDE.md 的「模块格式」一节。
 *
 * 本文件由 `scripts/gen-index.js` 生成,新增生成器后重跑即可。
 */

import {
    registerStatement,
    registerType,
    registerLibrary,
} from "@jvavscratch/core";

// ---- 语句生成器(13) ----
registerStatement("AssignmentExpression", require("./generator/AssignmentExpression"));
registerStatement("AwaitExpression", require("./generator/AwaitExpression"));
registerStatement("CallExpression", require("./generator/CallExpression"));
registerStatement("ClassDeclaration", require("./generator/ClassDeclaration"));
registerStatement("ExpressionStatement", require("./generator/ExpressionStatement"));
registerStatement("ForStatement", require("./generator/ForStatement"));
registerStatement("FunctionDeclaration", require("./generator/FunctionDeclaration"));
registerStatement("IfStatement", require("./generator/IfStatement"));
registerStatement("ReturnStatement", require("./generator/ReturnStatement"));
registerStatement("SwitchStatement", require("./generator/SwitchStatement"));
registerStatement("UpdateExpression", require("./generator/UpdateExpression"));
registerStatement("VariableDeclaration", require("./generator/VariableDeclaration"));
registerStatement("WhileStatement", require("./generator/WhileStatement"));

// ---- 值生成器(10) ----
registerType("BinaryExpression", require("./generator/types/BinaryExpression"));
registerType("BooleanLiteral", require("./generator/types/BooleanLiteral"));
registerType("CallExpression", require("./generator/types/CallExpression"));
registerType("Identifier", require("./generator/types/Identifier"));
registerType("LogicalExpression", require("./generator/types/LogicalExpression"));
registerType("MemberExpression", require("./generator/types/MemberExpression"));
registerType("NewExpression", require("./generator/types/NewExpression"));
registerType("NumericLiteral", require("./generator/types/NumericLiteral"));
registerType("StringLiteral", require("./generator/types/StringLiteral"));
registerType("UnaryExpression", require("./generator/types/UnaryExpression"));

// ---- 块库(10) ----
registerLibrary("block", "broadcast", require("./generator/CallExpressionSub/broadcast"));
registerLibrary("block", "control", require("./generator/CallExpressionSub/control"));
registerLibrary("block", "list", require("./generator/CallExpressionSub/list"));
registerLibrary("block", "looks", require("./generator/CallExpressionSub/looks"));
registerLibrary("block", "method", require("./generator/CallExpressionSub/method"));
registerLibrary("block", "motion", require("./generator/CallExpressionSub/motion"));
registerLibrary("block", "pen", require("./generator/CallExpressionSub/pen"));
registerLibrary("block", "sensing", require("./generator/CallExpressionSub/sensing"));
registerLibrary("block", "sound", require("./generator/CallExpressionSub/sound"));
registerLibrary("block", "variable", require("./generator/CallExpressionSub/variable"));

// ---- 值库(9) ----
registerLibrary("value", "list", require("./generator/types/CallExpressionSub/list"));
registerLibrary("value", "looks", require("./generator/types/CallExpressionSub/looks"));
registerLibrary("value", "math", require("./generator/types/CallExpressionSub/math"));
registerLibrary("value", "method", require("./generator/types/CallExpressionSub/method"));
registerLibrary("value", "motion", require("./generator/types/CallExpressionSub/motion"));
registerLibrary("value", "operation", require("./generator/types/CallExpressionSub/operation"));
registerLibrary("value", "sensing", require("./generator/types/CallExpressionSub/sensing"));
registerLibrary("value", "sound", require("./generator/types/CallExpressionSub/sound"));
registerLibrary("value", "util", require("./generator/types/CallExpressionSub/util"));

export * from "./optimise";
