/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : NumericLiteral.ts
* Description       : Creates a number block
*                    
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster } from "@jvavscratch/core";
import { NumericLiteral } from "@babel/types"
import { getScratchType, ScratchType } from "@jvavscratch/types"

module.exports = ((BlockCluster: BlockCluster, NumericLiteral: NumericLiteral) => {
    return {
        isStaticValue: true,
        blockId: null,
        block: getScratchType(ScratchType.number, NumericLiteral.value)
    }
})

