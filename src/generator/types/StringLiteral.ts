/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : StringLiteral.ts
* Description       : Creates a string
*                    
* Revision History  :
* Date		Author 			Comments
* ------------------------------------------------------------------
\n* 11/27/2025\tNeuronPulse\tModified\n* *
/******************************************************************/

import { BlockCluster } from "../../util/blocks";
import { StringLiteral } from "@babel/types"
import { getScratchType, ScratchType } from "../../util/scratch-type"

module.exports = ((BlockCluster: BlockCluster, StringLiteral: StringLiteral) => {
    return {
        isStaticValue: true,
        blockId: null,
        block: getScratchType(ScratchType.string, StringLiteral.value)
    }
})

