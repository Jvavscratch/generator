/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : IfStatement.ts
* Description       : Creates a If Statement
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock } from "@jvavscratch/core";
import { BlockStatement, IfStatement, SourceLocation } from "@babel/types"
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { parseProgram } from "@jvavscratch/core";
import { includes, uuid } from "@jvavscratch/types";
import { evaluate } from "@jvavscratch/core";
import { getBlockNumber, getScratchType, getSubstack, ScratchType } from "@jvavscratch/types";
import { isBlockStatement } from "@babel/types";
import { isIfStatement } from "@babel/types";

function parseIf(Block_Cluster: BlockCluster, IfStatement: IfStatement, buildData: buildData) {
    let keysGenerated: string[] = [];
    let id = uuid(includes.scratch_alphanumeric, 16);

    keysGenerated.push(id);
    let substackA = parseProgram((IfStatement.consequent as BlockStatement), (IfStatement.loc as SourceLocation).filename, false, buildData.packages)
    for (let i = 0; i < Object.keys(substackA.blocks).length; i++) {
        substackA.blocks[Object.keys(substackA.blocks)[i]].parent = id;
    }

    let substackB: {[key: string]: any} | undefined;
    if (IfStatement.alternate != null) {
        if (isBlockStatement(IfStatement.alternate)) {
            substackB = parseProgram((IfStatement.alternate as BlockStatement), (IfStatement.loc as SourceLocation).filename, false, buildData.packages)
        } else if (isIfStatement(IfStatement.alternate)) {
            let newBlockCluster = new BlockCluster();
            let ifData = parseIf(newBlockCluster, IfStatement.alternate, buildData);

            substackB = {};
            substackB.firstIndex = ifData.keysGenerated[0];
            substackB.blocks = newBlockCluster.blocks;
        }

        for (let i = 0; i < Object.keys((substackB as any).blocks).length; i++) {
            (substackB as any).blocks[Object.keys((substackB as any).blocks)[i]].parent = id;
        }
    }

    let evaluated = evaluate(IfStatement.test.type, Block_Cluster, IfStatement.test, id, buildData).block;
    let extra: {[key: string]: any} = {};
    if (IfStatement.test.type != "LogicalExpression" && !(IfStatement.test.type == "BinaryExpression" && ["<", ">", "==", "===", "!=", "!==", "<=", ">="].includes(IfStatement.test.operator)))
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
        "SUBSTACK2": substackB !== undefined ? getSubstack(substackB.firstIndex) : undefined,
    }

    if (!substackB) substackB = {};

    Block_Cluster.addBlocks({
        [id]: createBlock({
            opcode: Object.keys(substackB).length != 0 ? BlockOpCode.ControlIfElse : BlockOpCode.ControlIf,
            inputs: commonFields
        }),

        ...substackA.blocks,
        ...substackB.blocks,
        ...extra,
    });

    return { keysGenerated }
}

module.exports = parseIf;

