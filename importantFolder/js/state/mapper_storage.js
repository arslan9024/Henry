// FILE: js/state/mapper_storage.js
/**
 * [Category 3: Values State - OUTBOUND CALIBRATION PERSISTENCE ONLY]
 * White Caves Real Estate - Output Template Coordinate Persistence & Script Export Helper (mapper_storage.js)
 * 
 * ⚠️ ARCHITECTURAL ISOLATION:
 * Manages localStorage persistence strictly for the Outbound Template Stamping Coordinates (contract_mapper.js).
 * Used during Step 2 Precision Calibration to adjust (x, y) coordinates for the NEW BLANK TEMPLATE.
 * Has ZERO relation to reading or parsing old tenancy contracts.
 * Single-responsibility module for saving, loading, resetting, and exporting coordinates.
 */

window.ContractMapperHelper = {
    STORAGE_KEY: "wcre_calibrated_contract_mapper_v3",

    loadSavedCoordinates: function () {
        if (typeof localStorage === "undefined") return false;
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            if (parsed && parsed.page1 && parsed.page3) {
                for (const k in window.ContractMapper.page1) {
                    if (parsed.page1[k]) {
                        window.ContractMapper.page1[k].x = Number(parsed.page1[k].x);
                        window.ContractMapper.page1[k].y = Number(parsed.page1[k].y);
                    }
                }
                for (const k in window.ContractMapper.page3) {
                    if (parsed.page3[k]) {
                        window.ContractMapper.page3[k].x = Number(parsed.page3[k].x);
                        window.ContractMapper.page3[k].y = Number(parsed.page3[k].y);
                    }
                }
                return true;
            }
        } catch (e) {
            console.warn("[MapperStorage] Load warning:", e);
        }
        return false;
    },

    saveCoordinatesToStorage: function () {
        if (typeof localStorage === "undefined") return;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(window.ContractMapper));
        } catch (e) {}
    },

    resetToDefaults: function () {
        window.ContractMapper = JSON.parse(JSON.stringify(window.DefaultContractMapper));
        if (typeof localStorage !== "undefined") {
            try { localStorage.removeItem(this.STORAGE_KEY); } catch (e) {}
        }
        return window.ContractMapper;
    },

    exportMapperScriptFile: function () {
        const codeText = `window.ContractMapper = ${JSON.stringify(window.ContractMapper, null, 4)};\n`;
        const blob = new Blob([codeText], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "contract_mapper.js";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

window.ContractMapperHelper.loadSavedCoordinates();

function loadCoordinatesFromStorage() { return window.ContractMapperHelper.loadSavedCoordinates(); }
function saveCoordinatesToStorage() { return window.ContractMapperHelper.saveCoordinatesToStorage(); }
function resetCoordinatesToDefault() { return window.ContractMapperHelper.resetToDefaults(); }
function exportContractMapperFile() { return window.ContractMapperHelper.exportMapperScriptFile(); }
