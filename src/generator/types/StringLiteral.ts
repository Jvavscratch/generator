/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : StringLiteral.ts
* Description       : Creates a string block
*                    
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster } from "@jvavscratch/core";
import { StringLiteral } from "@babel/types"
import { getScratchType, ScratchType } from "@jvavscratch/types"

module.exports = ((BlockCluster: BlockCluster, StringLiteral: StringLiteral) => {
    return {
        isStaticValue: true,
        blockId: null,
        block: getScratchType(ScratchType.string, StringLiteral.value)
    }
})

