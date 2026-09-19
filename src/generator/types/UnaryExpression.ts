/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : UnaryExpression.ts
* Description       : Creates a unary expression block, that be "+",
*                   : "-", or "!".
*                    
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock } from "@jvavscratch/core";
import { UnaryExpression } from "@babel/types"
import { getBlockNumber, getScratchType, ScratchType } from "@jvavscratch/types"
import { evaluate } from "@jvavscratch/core"
import { includes, uuid } from "@jvavscratch/types";
import { BlockOpCode, buildData } from "@jvavscratch/types";

module.exports = ((BlockCluster: BlockCluster, UnaryExpression: UnaryExpression, ParentID: string, buildData: buildData) => {
    const id = uuid(includes.scratch_alphanumeric, 16);    
    const data = evaluate(UnaryExpression.argument.type, BlockCluster, UnaryExpression.argument, id, buildData);

    let mainBlock = createBlock({
        opcode: UnaryExpression.operator == "-" ? BlockOpCode.OperatorSubtract :
                UnaryExpression.operator == "+" ? BlockOpCode.OperatorAdd :
                UnaryExpression.operator == "!" ? BlockOpCode.OperatorNot :
                BlockOpCode.OperatorAdd,
        parent: ParentID,
        inputs: {
            "NUM1": getScratchType(ScratchType.number, "0"),
            "NUM2": data.block
        }
    });

    if (UnaryExpression.operator == "!") {
        mainBlock.inputs["OPERAND"] = data.block;
        delete mainBlock.inputs["NUM1"];
        delete mainBlock.inputs["NUM2"];
    }

    BlockCluster.addBlocks({
        [id]: mainBlock
    });

    return {
        isStaticValue: true,
        blockId: id,
        block: getBlockNumber(id)
    }
})

