/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : ForStatement.ts
* Description       : Creates a For Statement
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock } from "@jvavscratch/core";
import { BlockStatement, Expression, ForStatement, Identifier, SourceLocation, Statement } from "@babel/types"
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { parseProgram } from "@jvavscratch/core";
import { includes, uuid } from "@jvavscratch/types";
import { evaluate } from "@jvavscratch/core";
import { getBlockNumber, getScratchType, getSubstack, ScratchType } from "@jvavscratch/types";
import { JvavscratchError } from "@jvavscratch/core";
import { updateExpression } from "@babel/types";

function parseWhile(Block_Cluster: BlockCluster, ForStatement: ForStatement, buildData: buildData) {
    let keysGenerated: string[] = [];
    let id = uuid(includes.scratch_alphanumeric, 16);

    keysGenerated.push(id);

    let varDeclared = (ForStatement.init as Expression);
    let endCondition = (ForStatement.test as Expression);
    let update = (ForStatement.update  as Expression);

    // Extract loop variable from Identifier or AssignmentExpression
    let loopVar: any = null;
    if (varDeclared?.type === "AssignmentExpression" && (varDeclared as any).left?.type === "Identifier") {
        loopVar = (varDeclared as any).left;
    } else if (varDeclared?.type === "Identifier") {
        loopVar = varDeclared;
    } else {
        new JvavscratchError("The first argument of a For loop must be an identifier or assignment expression.", buildData.originalSource, [{ line: varDeclared?.loc?.start.line || 1, length: 5, column: varDeclared?.loc?.start.column || 1 }], ForStatement.loc?.filename || "")
        return;
    }

    if (!(endCondition.type == "BinaryExpression" && ["<", ">", "<=", ">=", "==", "===", "!=", "!=="].includes((endCondition).operator)) && (endCondition).type != "LogicalExpression" && endCondition.type != "UnaryExpression") {
        new JvavscratchError("The second argument of a For loop must be a valid expression (Binary / logical expression).", buildData.originalSource, [{ line: endCondition?.loc?.start.line || 1, length: 5, column: endCondition?.loc?.start.column || 1 }], ForStatement.loc?.filename || "")
        return;
    }

    if (!update)
    {
        update = updateExpression("++", loopVar);
    }

    if ((update).type != "UpdateExpression" && (update).type != "AssignmentExpression") {
        new JvavscratchError("The last argument of a For loop must be an update, or assignment expression.", buildData.originalSource, [{ line: update?.loc?.start.line || 1, length: 5, column: update?.loc?.start.column || 1 }], ForStatement.loc?.filename || "")
        return;
    }

    let extra: any = {};
    let condition = evaluate(endCondition.type, Block_Cluster, endCondition, id, buildData)
    let sId = uuid(includes.scratch_alphanumeric, 16);
    extra[sId] = createBlock({
        opcode: BlockOpCode.OperatorNot,
        inputs: {
            "OPERAND":  condition.block
        }
    });

    (condition as any) = getBlockNumber(sId);


    (ForStatement.body as BlockStatement).body.unshift((update as any));
    let substackA = parseProgram((ForStatement.body as any), (ForStatement.loc as SourceLocation).filename, false, buildData.packages)
    for (let i = 0; i < Object.keys(substackA.blocks).length; i++) {
        substackA.blocks[Object.keys(substackA.blocks)[i]].parent = id;
    }

    Block_Cluster.addBlocks({
        [id]: createBlock({
            opcode: BlockOpCode.ControlRepeatUntil,
            inputs: {
                "CONDITION": condition,
                "SUBSTACK": getSubstack(substackA.firstIndex)
            }
        }),

        ...substackA.blocks,
        ...extra,
    });

    return { keysGenerated }
}

module.exports = parseWhile;

