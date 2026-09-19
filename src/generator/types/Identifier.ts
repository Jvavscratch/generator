/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : Identifier.ts
* Description       : Creates a reference to an identifier block
*                    
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { BlockCluster, createBlock } from "@jvavscratch/core";
import { Identifier } from "@babel/types"
import { getBlockNumber, getVariable, getList } from "@jvavscratch/types"
import { BlockOpCode, buildData } from "@jvavscratch/types";
import { includes, uuid } from "@jvavscratch/types";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

module.exports = ((BlockCluster: BlockCluster, Identifier: Identifier, _: any, buildData: buildData) => {
    let globals: any[] = buildData.packages.globals;
    let finalValue: any = undefined;

    globals.forEach((value) => {
        if (finalValue == undefined && value.name == Identifier.name) {
            finalValue = value.functions(BlockCluster);
        }
    })

    let isList = Identifier.name.startsWith("_list_");
    
    if (isList) {
        Identifier.name = Identifier.name.slice(6);
    };

    return finalValue != undefined && finalValue || {
        isStaticValue: true,
        blockId: null,
        block: !isList && getVariable(Identifier.name) || getList(Identifier.name)
    }
})

