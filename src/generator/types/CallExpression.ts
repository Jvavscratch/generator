/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : CallExpression.ts
* Description       : Creates an call expression (type)
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { CallExpression, Identifier } from "@babel/types";
import { BlockCluster, getLibrary } from "@jvavscratch/core";
import { buildData } from "@jvavscratch/types";
import { readFileSync } from "fs";
import { Warn } from "@jvavscratch/core";
import { join } from "path";
import { includes, uuid } from "@jvavscratch/types";
import { getScratchType, getVariable, ScratchType } from "@jvavscratch/types";

module.exports = ((BlockCluster: BlockCluster, CallExpression: CallExpression, p_: string, buildData: buildData) => {
    let callee = (CallExpression as any).callee;
    // Library name
    if (callee.object && callee.object.name) {
        let libName = callee.object.name;
        let fnName = callee.property.name;

                // 内置库优先(与拆分前一致),其次第三方运行时包。
        let requiredLib: any = getLibrary("value", libName);

        if (!requiredLib) {
            let valueLibs: any[] = buildData.packages.libraries.valueLibraries;
            let finished = false;
            let endLoop = false;

            valueLibs.forEach((value) => {
                if (!endLoop && value.name == libName) {
                    finished = true;
                    endLoop = true;
                    requiredLib = value.functions;
                }
            });

            if (!finished) {
                Warn(`Unknown library, got: '${libName}'`);
                return { err: true };
            }
        }

        let requiredFn = requiredLib[fnName];

        if (!requiredFn) { Warn(`Unknown function of library ${libName}, got: '${fnName}'`); return { err: true }; }
        let ID = uuid(includes.scratch_alphanumeric, 16);

        return requiredFn(CallExpression, BlockCluster, ID, buildData);
    } 

    Warn("Cannot get the value of a function! Use `util.getReturnAddress` instead.");
    return { err: true };
})

