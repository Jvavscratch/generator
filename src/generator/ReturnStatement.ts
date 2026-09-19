/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : ReturnStatement.ts
* Description       : Creates a return statement
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { AwaitExpression, CallExpression, Identifier, ReturnStatement, SourceLocation } from "@babel/types";
import { BlockCluster, createBlock } from "@jvavscratch/core";
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { join } from "path";
import { JvavscratchError } from "@jvavscratch/core";
import { readFileSync } from "fs";
import { evaluate } from "@jvavscratch/core";
import { includes, uuid } from "@jvavscratch/types";
import { scratchFile } from "@jvavscratch/core";

function parseReturn(Block_Cluster: BlockCluster, ReturnStatement: ReturnStatement, buildData: buildData) {

    if (buildData.isFunction && ReturnStatement.argument) {
        let path = scratchFile("fn.json");
        let content = JSON.parse(readFileSync(path).toString());
        let fnData = content[buildData.functionName || ""];
        let arg = ReturnStatement.argument;

        let newId = uuid(includes.scratch_alphanumeric, 16);
        let evaluated = evaluate(arg.type, Block_Cluster, arg, newId, buildData);

        if (buildData.customBlockReturn && fnData.returnType) {
            // TurboWarp return-value extension: use procedures_return
            let finalId = uuid(includes.scratch_alphanumeric, 16);
            Block_Cluster.addBlocks({
                [finalId]: createBlock({
                    opcode: BlockOpCode.ProceduresReturn,
                    inputs: {
                        "VALUE": evaluated.block
                    }
                })
            });

            if (buildData.isFunction) {
                buildData.isFunction = false;
                buildData.functionName = undefined;
            }

            return {keysGenerated: [finalId]}
        } else {
            // Plain mode: use a temporary variable
            let finalId = uuid(includes.scratch_alphanumeric, 16);
            let retCode = fnData.retCode;

            Block_Cluster.addBlocks({
                [finalId]: createBlock({
                    opcode: BlockOpCode.DataSetVariableTo,
                    inputs: {
                        "VALUE": evaluated.block
                    },
                    fields: {
                        "VARIABLE": [
                           retCode,
                           retCode,
                        ]
                    }
                })
            });

            if (buildData.isFunction) {
                buildData.isFunction = false;
                buildData.functionName = undefined;
            }

            return {keysGenerated: [finalId]}
        }
    }

    if (buildData.isFunction) {
        buildData.isFunction = false;
        buildData.functionName = undefined;
    }
    
    return {keysGenerated: []}
}

module.exports = parseReturn;
