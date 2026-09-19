/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : VariableDeclaration.ts
* Description       : Creates a VariableDeclaration (Set variable to X)
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock, createMutation } from "@jvavscratch/core";
import { VariableDeclaration } from "@babel/types"
import { Block, BlockOpCode, buildData, typeData } from "@jvavscratch/types";
import { getScratchType, ScratchType, getVariable, getBlockNumber } from "@jvavscratch/types";
import { uuid, includes } from "@jvavscratch/types"
import { evaluate } from "@jvavscratch/core";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { scratchFile } from "@jvavscratch/core";

module.exports = ((BlockCluster: BlockCluster, VariableDeclaration: VariableDeclaration, buildData: buildData) => {

    let keysGenerated: string[] = [];
    let blocks: {[key: string]: Block} = {};
    for (let i = 0; i < VariableDeclaration.declarations.length; i++) {
        let declarations = VariableDeclaration.declarations[i];
        let variableName = (declarations as any).id.name;

        let global = false;
        let local = false;
        let cloud = false;
        if (variableName.startsWith("_g_")) {
            global = true;
            variableName = variableName.slice(3);
            variableName = variableName.slice(3);
        } else if (variableName.startsWith("_c_")) { 
            cloud = true;
            global = true;
            variableName = variableName.slice(3);
        } else if (variableName.startsWith("_l_")) {
            local = true;
            variableName = variableName.slice(3);
        } else {
            global = true
        }

        if (local) {
            let jsonFile = scratchFile("variables.json");
            let content = JSON.parse(readFileSync(jsonFile).toString()) as any[];
            content.push(variableName);

            writeFileSync(jsonFile, JSON.stringify(content));
        }

        if (declarations.init != null && declarations.init.type == "NewExpression") {
            return require('./types/NewExpression')(BlockCluster, VariableDeclaration, declarations.init, buildData, variableName)
        }

        // User-defined function call: let x = foo() -> call foo() first, then
        // assign its return value to x
        if (declarations.init != null && declarations.init.type == "CallExpression") {
            let callee = (declarations.init as any).callee;
            if (callee && callee.type === "Identifier") {
                let fnName = callee.name;
                let originalName = fnName;
                let wasTurbo = fnName.startsWith("turbo_");
                if (wasTurbo) {
                    fnName = fnName.substring(6);
                }

                let fnJsonPath = scratchFile("fn.json");
                let fnData = JSON.parse(readFileSync(fnJsonPath).toString());

                if (fnData[originalName] && !fnData[originalName].async) {
                    let callId = uuid(includes.scratch_alphanumeric, 16);
                    let inputs: { [key: string]: any } = {};
                    let argumentids = "[";
                    let callExpr = declarations.init as any;

                    for (let j = 0; j < callExpr.arguments.length; j++) {
                        let code = fnName + "_" + j;
                        let param = callExpr.arguments[j];
                        inputs[code] = evaluate(param.type, BlockCluster, param, callId, buildData).block;
                        let hasNext = (j + 1) <= (callExpr.arguments.length - 1);
                        argumentids += `"${code}"${hasNext && "," || ""}`;
                    }
                    argumentids += "]";

                    let mutationData: any = {
                        tagName: "mutation",
                        children: [],
                        proccode: fnName + " " + "%s ".repeat(callExpr.arguments.length).trimEnd(),
                        argumentids,
                        warp: wasTurbo && "true" || "false",
                    };

                    if (buildData.customBlockReturn && fnData[originalName].returnType) {
                        mutationData.return = fnData[originalName].returnType;
                    }

                    blocks[callId] = createMutation({
                        opcode: BlockOpCode.ProceduresCall,
                        inputs,
                        mutation: mutationData
                    });

                    let assignId = uuid(includes.scratch_alphanumeric, 16);

                    if (buildData.customBlockReturn && fnData[originalName].returnType) {
                        // TurboWarp return-value extension: procedures_call is embedded as a reporter
                        blocks[callId].parent = assignId;
                        blocks[assignId] = createBlock({
                            opcode: BlockOpCode.DataSetVariableTo,
                            inputs: {
                                "VALUE": getBlockNumber(callId)
                            },
                            fields: {
                                "VARIABLE": [variableName, variableName]
                            }
                        });
                    } else {
                        // Plain mode: call first, then read the temporary variable
                        let retCode = fnData[originalName].retCode;
                        let valueBlock = retCode ? getVariable(retCode) : getScratchType(ScratchType.number, 0);

                        blocks[assignId] = createBlock({
                            opcode: BlockOpCode.DataSetVariableTo,
                            inputs: {
                                "VALUE": valueBlock
                            },
                            fields: {
                                "VARIABLE": [variableName, variableName]
                            }
                        });

                        blocks[callId].next = assignId;
                        blocks[assignId].parent = callId;
                    }

                    keysGenerated.push(callId, assignId);
                    continue;
                }
            }
        }

        let id = uuid(includes.scratch_alphanumeric, 16);
        let value: typeData | any = (declarations.init != null && declarations.init != undefined)
            ? evaluate(declarations.init.type, BlockCluster, declarations.init, id, buildData)
            : { block: getScratchType(ScratchType.number, 0) };

        blocks[id] = createBlock(
            {
                opcode: BlockOpCode.DataSetVariableTo,
                inputs: {
                    "VALUE": value.block
                },
                fields: {
                    "VARIABLE": [
                        variableName,
                        variableName
                    ]
                }
            }
        );
       

        keysGenerated.push(id);
    }

    // Skip the last one
    for (let i = 0; i < keysGenerated.length - 1; i++)
    {
        let block = blocks[keysGenerated[i]];
        let nextBlock = blocks[keysGenerated[i + 1]];

        if (nextBlock)
        {
            block.next = keysGenerated[i + 1];
            nextBlock.parent = keysGenerated[i];
        }
    }

    BlockCluster.addBlocks(blocks);

    return { keysGenerated }
})

