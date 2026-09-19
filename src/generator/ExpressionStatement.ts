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
 * Expression statement: hands `expression.type` off to the matching **statement**
 * generator (`AssignmentExpression` / `CallExpression` / `UpdateExpression` /
 * `AwaitExpression`).
 *
 * The original implementation probed for the file with
 * `join(__dirname, "./" + type) + ".ts"` followed by `existsSync` — but the
 * compiled artifact is `.js`, so that check was always false and **every**
 * expression statement silently turned into a "No `impl`" and got dropped in a
 * packaged run. Routing through the registry removes the filesystem probe, and
 * with it that entire class of failure.
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
