/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : BooleanLiteral.ts
* Description       : Creates a boolean block
*                    
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock } from "@jvavscratch/core";
import { BooleanLiteral } from "@babel/types"
import { getBlockNumber, getScratchType, ScratchType } from "@jvavscratch/types"
import { includes, uuid } from "@jvavscratch/types";
import { BlockOpCode } from "@jvavscratch/types";

module.exports = ((BlockCluster: BlockCluster, BooleanLiteral: BooleanLiteral, ParentIndex: string) => {
    let key = uuid(includes.scratch_alphanumeric, 16);
    BlockCluster.addBlocks({
        [key]: createBlock({
            opcode: BlockOpCode.OperatorEquals,
            parent: ParentIndex,

            inputs: {
                "OPERAND1": getScratchType(ScratchType.number, "1"),
                "OPERAND2": getScratchType(ScratchType.number, BooleanLiteral.value === true ? "1" : "0")
            }
        })
    })

    return {
        isStaticValue: true,
        blockId: key,
        block: getBlockNumber(key)
    }
})

