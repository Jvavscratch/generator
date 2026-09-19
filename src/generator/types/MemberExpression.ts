/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : MemberExpression.ts
* Description       : Handles list[index] and list.length syntax
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 06/18/2026  NeuronPulse     Created
/******************************************************************/

import { MemberExpression } from "@babel/types";
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { BlockCluster, createBlock } from "@jvavscratch/core";
import { includes, uuid } from "@jvavscratch/types";
import { getBlockNumber, getScratchType, ScratchType } from "@jvavscratch/types";
import { evaluate } from "@jvavscratch/core";

module.exports = ((BlockCluster: BlockCluster, MemberExpression: MemberExpression, parentID: string, buildData: buildData) => {
    if (MemberExpression.computed) {
        // list[index]
        let listName = (MemberExpression.object as any).name;
        let key = uuid(includes.scratch_alphanumeric, 16);
        
        let indexBlock = evaluate(MemberExpression.property.type, BlockCluster, MemberExpression.property, key, buildData).block;
        
        if (buildData.listIndexBase === 0) {
            let addId = uuid(includes.scratch_alphanumeric, 16);
            BlockCluster.addBlocks({
                [addId]: createBlock({
                    opcode: BlockOpCode.OperatorAdd,
                    inputs: {
                        "NUM1": indexBlock,
                        "NUM2": getScratchType(ScratchType.number, 1)
                    }
                })
            });
            indexBlock = getBlockNumber(addId);
        }

        BlockCluster.addBlocks({
            [key]: createBlock({
                opcode: BlockOpCode.DataItemOfList,
                parent: parentID,
                inputs: {
                    "INDEX": indexBlock
                },
                fields: {
                    "LIST": [listName, listName]
                }
            })
        });

        return {
            isStaticValue: true,
            blockId: key,
            block: getBlockNumber(key)
        }
    } else if ((MemberExpression.property as any).name === 'length') {
        let listName = (MemberExpression.object as any).name;
        let key = uuid(includes.scratch_alphanumeric, 16);

        BlockCluster.addBlocks({
            [key]: createBlock({
                opcode: BlockOpCode.DataLengthOfList,
                parent: parentID,
                fields: {
                    "LIST": [listName, listName]
                }
            })
        });

        return {
            isStaticValue: true,
            blockId: key,
            block: getBlockNumber(key)
        }
    }

    return { err: true };
})
