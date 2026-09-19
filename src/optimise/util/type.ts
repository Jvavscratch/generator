/*******************************************************************
* Copyright         : 2024 saaawdust
* File Name         : type.ts
* Description       : Utilisation for types
*
* Revision History  :
* Date        Author          Comments
* ------------------------------------------------------------------
* 10/12/2025  NeuronPulse     Modified
/******************************************************************/

import { ScratchInput } from "@jvavscratch/types";

export function getValue(input: ScratchInput) {
    if (input[0] == 1) {
        switch(input[1][0]) {

            // NUMBER
            case 4: {
                return input[1][1]
            }
        }
    }
}

export function isNumericValue(input: ScratchInput): number | null {
    return (input[0] == 1 && input[1][0] == 4) && input[1][1] || null
}

export function isNumericValueInvert(input: ScratchInput): number | null {
    return (input[0] == 1 && input[1][0] == 4) && null || input[1][1]
}

export function isBlock(input: ScratchInput) {
    return input[0] == 3 && typeof(input[1]) == "string"
}

export function isBlockKey(input: ScratchInput): string | null {
    return (isBlock(input)) && (input[1] as string) || null
}

