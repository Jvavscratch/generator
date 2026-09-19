/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : AwaitExpression.ts
* Description       : Creates an await expression
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { AwaitExpression, CallExpression, Identifier, SourceLocation } from "@babel/types";
import { BlockCluster, createBlock } from "@jvavscratch/core";
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { join } from "path";
import { JvavscratchError } from "@jvavscratch/core";
import { readFileSync } from "fs";
import { scratchFile } from "@jvavscratch/core";

function parseAwait(Block_Cluster: BlockCluster, AwaitExpression: AwaitExpression, buildData: buildData) {
    if (AwaitExpression.argument.type != "CallExpression") {
        let loc = AwaitExpression.loc as SourceLocation;
        new JvavscratchError("Argument must be a function call!", buildData.originalSource, [
            {
                line: loc.start.line,
                column: loc.start.column,
                length: loc.end.column - loc.start.column,
            }
        ], loc.filename);
    }

    if ((AwaitExpression.argument as CallExpression).callee.type != "Identifier") {
        let loc = AwaitExpression.loc as SourceLocation;
        new JvavscratchError("Argument must be a function call, not a library call!", buildData.originalSource, [
            {
                line: loc.start.line,
                column: loc.start.column,
                length: loc.end.column - loc.start.column,
            }
        ], loc.filename);
    }

    let path = scratchFile("fn.json");
    let fnData = JSON.parse(readFileSync(path).toString());
    let fnName = ((AwaitExpression.argument as CallExpression).callee as Identifier).name

    if (!fnData[fnName] || !fnData[fnName].async) {
        let loc = AwaitExpression.loc as SourceLocation;
        new JvavscratchError("Argument must be an existing async function!", buildData.originalSource, [
            {
                line: loc.start.line,
                column: loc.start.column,
                length: loc.end.column - loc.start.column,
            }
        ], loc.filename);
    } 

    buildData.isAsync = true;
    return require('./CallExpression')(Block_Cluster, AwaitExpression.argument, buildData)
}

module.exports = parseAwait;

