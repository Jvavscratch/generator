/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : AssignmentExpression.ts
* Description       : Creates an assignment expression
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock, createMutation } from "@jvavscratch/core";
import { AssignmentExpression } from "@babel/types"
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { uuid, includes } from "@jvavscratch/types"
import { getBlockNumber, getVariable, getScratchType, ScratchType } from "@jvavscratch/types";
import { evaluate } from "@jvavscratch/core";
import { join } from "path";
import { readFileSync } from "fs";
import { scratchFile } from "@jvavscratch/core";

module.exports = ((BlockCluster: BlockCluster, AssignmentExpression: AssignmentExpression, buildData: buildData) => {
    let keysGenerated: string[] = [];
    let ID = uuid(includes.scratch_alphanumeric, 16);

    keysGenerated.push(ID);

    // 自定义函数调用：x = foo() -> 先调用 foo()，再把返回值赋给 x
    if (AssignmentExpression.operator === "=" && AssignmentExpression.right.type === "CallExpression") {
        let callee = (AssignmentExpression.right as any).callee;
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
                let callExpr = AssignmentExpression.right as any;

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

                let leftName = (AssignmentExpression as any).left.name;

                BlockCluster.addBlocks({
                    [callId]: createMutation({
                        opcode: BlockOpCode.ProceduresCall,
                        inputs,
                        mutation: mutationData
                    })
                });

                if (buildData.customBlockReturn && fnData[originalName].returnType) {
                    // TurboWarp 返回值扩展：procedures_call 作为 reporter 嵌入
                    BlockCluster.blocks[callId].parent = ID;
                    BlockCluster.addBlocks({
                        [ID]: createBlock({
                            opcode: BlockOpCode.DataSetVariableTo,
                            inputs: {
                                "VALUE": getBlockNumber(callId)
                            },
                            fields: {
                                "VARIABLE": [leftName, leftName]
                            }
                        })
                    });
                } else {
                    // 普通模式：先调用，再读取临时变量
                    let retCode = fnData[originalName].retCode;
                    let valueBlock = retCode ? getVariable(retCode) : getScratchType(ScratchType.number, 0);

                    BlockCluster.addBlocks({
                        [ID]: createBlock({
                            opcode: BlockOpCode.DataSetVariableTo,
                            parent: callId,
                            inputs: {
                                "VALUE": valueBlock
                            },
                            fields: {
                                "VARIABLE": [leftName, leftName]
                            }
                        })
                    });

                    BlockCluster.blocks[callId].next = ID;
                }

                return { keysGenerated: [callId, ID] };
            }
        }
    }

    let newValue = evaluate(AssignmentExpression.right.type, BlockCluster, AssignmentExpression.right, ID, buildData)
    switch (AssignmentExpression.operator) {
        case "=":
            BlockCluster.addBlocks({
                [ID]: createBlock({
                    opcode: BlockOpCode.DataSetVariableTo,
                    inputs: {
                        "VALUE": newValue.block
                    },

                    fields: {
                        "VARIABLE": [
                            (AssignmentExpression as any).left.name,
                            (AssignmentExpression as any).left.name,
                        ]
                    }
                }),
            });

            break;
        case "+=":
            BlockCluster.addBlocks({
                [ID]: createBlock({
                    opcode: BlockOpCode.DataChangeVariableBy,
                    inputs: {
                        "VALUE": newValue.block
                    },

                    fields: {
                        "VARIABLE": [
                            (AssignmentExpression as any).left.name,
                            (AssignmentExpression as any).left.name,
                        ]
                    }
                })
            })
            break;

        case "*=":
        case "/=":
        case "-=":
        case "%=":
            let id = uuid(includes.scratch_alphanumeric);

            BlockCluster.addBlocks({
                [ID]: createBlock({
                    opcode: BlockOpCode.DataSetVariableTo,
                    inputs: {
                        "VALUE": getBlockNumber(id)
                    },

                    fields: {
                        "VARIABLE": [
                            (AssignmentExpression as any).left.name,
                            (AssignmentExpression as any).left.name,
                        ]
                    }
                }),

                [id]: createBlock({
                    opcode: AssignmentExpression.operator == "*=" ? BlockOpCode.OperatorMultiply :
                            AssignmentExpression.operator == "/=" ? BlockOpCode.OperatorDivide :
                            AssignmentExpression.operator == "%=" ? BlockOpCode.OperatorMod :
                            BlockOpCode.OperatorSubtract,
                    parent: ID,
                    inputs: {
                        "NUM1": getVariable((AssignmentExpression as any).left.name),
                        "NUM2": newValue.block
                    }
                })
            });

            break;

    };

    return { keysGenerated }
})

