/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : UpdateExpression.ts
* Description       : Creates an Update expression
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock } from "@jvavscratch/core";
import { UpdateExpression } from "@babel/types"
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { uuid, includes } from "@jvavscratch/types"
import { getScratchType, ScratchType } from "@jvavscratch/types";

module.exports = ((BlockCluster: BlockCluster, UpdateExpression: UpdateExpression, buildData: buildData) => {

    let keysGenerated: string[] = [];
    let ID = uuid(includes.scratch_alphanumeric, 16);

    keysGenerated.push(ID);

    BlockCluster.addBlocks({
        [ID]: createBlock({
            opcode: BlockOpCode.DataChangeVariableBy,
            inputs: {
                "VALUE": getScratchType(ScratchType.number, UpdateExpression.operator == "++" && "1" || "-1")
            },
    
            fields: {
                "VARIABLE": [
                    (UpdateExpression as any).argument.name,
                    (UpdateExpression as any).argument.name,
                ]
            }
        })
    });

    return { keysGenerated }
})

