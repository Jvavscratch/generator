/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : WhileStatement.ts
* Description       : Creates a While Statement
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock } from "@jvavscratch/core";
import { WhileStatement, SourceLocation } from "@babel/types"
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { parseProgram } from "@jvavscratch/core";
import { includes, uuid } from "@jvavscratch/types";
import { evaluate } from "@jvavscratch/core";
import { getBlockNumber, getScratchType, getSubstack, ScratchType } from "@jvavscratch/types";

function parseWhile(Block_Cluster: BlockCluster, WhileStatement: WhileStatement, buildData: buildData) {
    let keysGenerated: string[] = [];
    let id = uuid(includes.scratch_alphanumeric, 16);

    keysGenerated.push(id);
    let substackA = parseProgram((WhileStatement.body as any), (WhileStatement.loc as SourceLocation).filename, false, buildData.packages)
    for (let i = 0; i < Object.keys(substackA.blocks).length; i++) {
        substackA.blocks[Object.keys(substackA.blocks)[i]].parent = id;
    }

    let evaluated = evaluate(WhileStatement.test.type, Block_Cluster, WhileStatement.test, id, buildData).block;
    let extra: {[key: string]: any} = {};
    if (WhileStatement.test.type != "LogicalExpression" && !(WhileStatement.test.type == "BinaryExpression" && ["<", ">", "==", "===", "!=", "!==", "<=", ">="].includes(WhileStatement.test.operator)))
    {
        let equalId = uuid(includes.scratch_alphanumeric, 16);
        let sId = uuid(includes.scratch_alphanumeric, 16);
        extra[equalId] = createBlock({
            opcode: BlockOpCode.OperatorEquals,
            parent: sId,
            inputs: {
                "OPERAND1": evaluated,
                "OPERAND2": getScratchType(ScratchType.number, "0")
            }
        });

        extra[sId] = createBlock({
            opcode: BlockOpCode.OperatorNot,
            parent: id,
            inputs: {
                "OPERAND": getBlockNumber(equalId)
            }
        });

        evaluated = getBlockNumber(sId);
    }

    const commonFields = {
        "CONDITION": evaluated,
        "SUBSTACK": substackA.firstIndex !== undefined ? getSubstack(substackA.firstIndex) : undefined,
    }

    let type = BlockOpCode.ControlWhile;
    if (WhileStatement.test.type == "BooleanLiteral" && WhileStatement.test.value == true)
    {
        type = BlockOpCode.ControlForever;
    }

    Block_Cluster.addBlocks({
        [id]: createBlock({
            opcode: type,
            inputs: commonFields
        }),

        ...substackA.blocks,
        ...extra,
    });

    return { keysGenerated, terminate: type == BlockOpCode.ControlForever }
}

module.exports = parseWhile;

