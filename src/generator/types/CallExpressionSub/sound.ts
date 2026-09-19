/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : sound.ts
* Description       : Sound library (types)
*                    
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { CallExpression } from "@babel/types";
import { BlockOpCode, buildData, typeData } from "@jvavscratch/types";
import { BlockCluster, createBlock } from "@jvavscratch/core";
import { includes, uuid } from "@jvavscratch/types"
import { getBlockNumber, getScratchType, getVariable, ScratchType } from "@jvavscratch/types"
import { JvavscratchError } from "@jvavscratch/core";
import { evaluate } from "@jvavscratch/core";

function createFunction(data: {
    minArgs: number,
    argTypes?: string[]
    doParse: boolean,
    body: (parsedArguments: typeData[], callExpression: CallExpression, blockCluster: BlockCluster, parentID: string, buildData: buildData) => void
}) {
    return ((callExpression: CallExpression, blockCluster: BlockCluster, parentID: string, buildData: buildData) => {
        if (callExpression.arguments.length < data.minArgs) {
            new JvavscratchError("Not enough arguments", buildData.originalSource, [{ line: callExpression.loc?.start.line || 1, column: callExpression.loc?.start.column || 1, length: (callExpression.loc?.end.column || 1) - (callExpression.loc?.start.column || 1) }], callExpression.loc?.filename || "")
        }

        let args: typeData[] = [];

        for (let i = 0; i < callExpression.arguments.length; i++) {
            let type = callExpression.arguments[i].type;
            if ((data.argTypes && data.argTypes[i] && data.argTypes[i] == type) || !data.argTypes || data.argTypes && !data.argTypes[i]) {
                if (!data.doParse) continue;

                args.push(
                    evaluate(type, blockCluster, callExpression.arguments[i], parentID, buildData)
                )
            } else if (data.argTypes && data.argTypes[i] && data.argTypes[i] != type) {
                new JvavscratchError(`Expected '${data.argTypes[i]}' for argument '${i + 1}', got: '${type}'`, buildData.originalSource, [{ line: callExpression.loc?.start.line || 1, column: callExpression.loc?.start.column || 1, length: (callExpression.loc?.end.column || 1) - (callExpression.loc?.start.column || 1) }], callExpression.loc?.filename || "")
            }
        }

        return data.body(args, callExpression, blockCluster, parentID, buildData);
    })
}

module.exports = {
    volume: createFunction({
        minArgs: 0,
        doParse: false,
        body: ((parsedArguments: typeData[], callExpression: CallExpression, blockCluster: BlockCluster) => {
            let key = uuid(includes.scratch_alphanumeric, 16);

            blockCluster.addBlocks({
                [key]: createBlock({
                    opcode: BlockOpCode.SoundVolume,
                })
            });

            return {
                isStaticValue: true,
                blockId: key,
                block: getBlockNumber(key)
            }
        })
    }),
}

