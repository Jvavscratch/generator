/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : ExpressionStatement.ts
* Description       : Creates an expression statement
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
* 09/19/2026  NeuronPulse     Dispatch via registry
/******************************************************************/

import { BlockCluster, Warn, getStatement } from "@jvavscratch/core";
import { ExpressionStatement } from "@babel/types"
import { buildData } from "@jvavscratch/types";

/**
 * 表达式语句:把 `expression.type` 交给对应的**语句**生成器
 * (`AssignmentExpression` / `CallExpression` / `UpdateExpression` / `AwaitExpression`)。
 *
 * 原实现是 `join(__dirname, "./" + type) + ".ts"` 再 `existsSync` —— 编译产物是
 * `.js`,这个检查恒为 false,于是**所有**表达式语句在打包运行时会静默变成
 * "No `impl`" 并被丢弃。改走注册表后不再有文件系统探测,该故障类别消失。
 */
module.exports = ((BlockCluster: BlockCluster, ExpressionStatement: ExpressionStatement, buildData: buildData) => {
    let exprType = ExpressionStatement.expression.type;
    let impl = getStatement(exprType);

    if (!impl) {
        Warn(`No \`impl\` for '${exprType}'`);
        return { keysGenerated: [] }
    }

    return impl(BlockCluster, ExpressionStatement.expression, buildData);
})
