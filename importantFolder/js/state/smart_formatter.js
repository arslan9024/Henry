// FILE: js/state/smart_formatter.js
/**
 * [Category 3: Values State / Formatting Engine]
 * White Caves Real Estate - Smart Input Formatter, Currency-in-Words & Jump-to-Missing Handler
 * Handles live input masking (Emirates ID, Phone), currency spellout, demo deal loader, and gate navigation.
 */

window.SmartFormatter = {
    init: function () {
        this.bindInputMasks();
        this.updateCurrencyInWords();
    },

    /**
     * Real-time Emirates ID masking: 784-YYYY-NNNNNNN-X
     */
    maskEmiratesId: function (val) {
        if (!val) return "";
        const clean = val.replace(/\D/g, "").substring(0, 15);
        let out = "";
        if (clean.length > 0) out += clean.substring(0, 3);
        if (clean.length >= 4) out += "-" + clean.substring(3, 7);
        if (clean.length >= 8) out += "-" + clean.substring(7, 14);
        if (clean.length >= 15) out += "-" + clean.substring(14, 15);
        return out;
    },

    /**
     * Real-time UAE Phone formatting
     */
    maskUaePhone: function (val) {
        if (!val) return "";
        let clean = val.replace(/\D/g, "");
        if (clean.startsWith("971")) {
            clean = clean.substring(3);
            return `+971 ${clean.substring(0, 2)} ${clean.substring(2, 5)} ${clean.substring(5, 9)}`.trim();
        }
        if (clean.length > 3) {
            return `${clean.substring(0, 3)} ${clean.substring(3, 6)} ${clean.substring(6, 10)}`.trim();
        }
        return val;
    },

    /**
     * Converts a numeric amount to English words (UAE Dirhams)
     */
    numberToWords: function (num) {
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        num = Math.floor(Math.abs(Number(num)));
        if (num === 0) return 'Zero UAE Dirhams Only';

        function convertGroup(n) {
            let str = '';
            if (n >= 100) {
                str += a[Math.floor(n / 100)] + ' Hundred ';
                n %= 100;
            }
            if (n >= 20) {
                str += b[Math.floor(n / 10)] + ' ';
                n %= 10;
            }
            if (n > 0) {
                str += a[n] + ' ';
            }
            return str;
        }

        let words = '';
        const millions = Math.floor(num / 1000000);
        num %= 1000000;
        const thousands = Math.floor(num / 1000);
        const remainder = num % 1000;

        if (millions > 0) words += convertGroup(millions) + 'Million ';
        if (thousands > 0) words += convertGroup(thousands) + 'Thousand ';
        if (remainder > 0) words += convertGroup(remainder);

        return words.trim() + ' UAE Dirhams Only';
    },

    updateCurrencyInWords: function () {
        const rentInput = document.getElementById("field-annual_rent");
        if (!rentInput) return;

        let caption = document.getElementById("annual-rent-words-caption");
        if (!caption) {
            caption = document.createElement("span");
            caption.id = "annual-rent-words-caption";
            caption.className = "currency-words-caption";
            rentInput.parentNode.appendChild(caption);
        }

        const raw = String(rentInput.value).replace(/[^0-9]/g, "");
        const num = parseInt(raw, 10);
        if (num && num > 0) {
            caption.innerText = `🗣️ In Words: ${this.numberToWords(num)}`;
            caption.style.display = "block";
        } else {
            caption.style.display = "none";
        }
    },

    bindInputMasks: function () {
        const eidInput = document.getElementById("field-tenant_eid");
        if (eidInput && !eidInput._maskBound) {
            eidInput._maskBound = true;
            eidInput.addEventListener("input", (e) => {
                const cursorPos = e.target.selectionStart;
                const formatted = this.maskEmiratesId(e.target.value);
                e.target.value = formatted;
            });
        }

        const rentInput = document.getElementById("field-annual_rent");
        if (rentInput && !rentInput._maskBound) {
            rentInput._maskBound = true;
            rentInput.addEventListener("input", () => {
                this.updateCurrencyInWords();
            });
        }
    },

    /**
     * Loads a complete, verified luxury demo tenancy deal in 1 click
     */
    loadDemoDeal: async function () {
        const demoData = {
            contract_date: "01-10-2026",
            owner_name: "MOHAMMED KHALID AL NUAIMI",
            lessor_name: "MOHAMMED KHALID AL NUAIMI",
            lessor_id: "784-1979-1234567-3",
            lessor_email: "alnuaimi.properties@gmail.com",
            lessor_phone: "+971 50 112 3456",
            tenant_name: "ALEXANDER WILLIAM WRIGHT",
            tenant_eid: "784-1988-7654321-1",
            tenant_email: "alex.wright@horizonventures.ae",
            tenant_phone: "+971 50 882 1943",
            prop_usage: "✓",
            plot_no: "491-1202",
            building_name: "PRIMROSE",
            property_no: "142",
            property_type: "VILLA",
            property_area: "185.50",
            location: "DAMAC HILLS 2",
            dewa_premises: "908123456",
            date_from: "01-11-2026",
            date_to: "31-10-2027",
            contract_value: "115,000 AED",
            annual_rent: "115,000 AED",
            security_deposit: "5,750 AED",
            mode_of_payment: "4 CHEQUES"
        };

        // Populate fields
        for (const k in demoData) {
            const el = document.getElementById(`field-${k}`);
            if (el) el.value = demoData[k];
        }

        this.updateCurrencyInWords();

        if (window.WorkflowEngine) {
            window.WorkflowEngine.onFormInputMutated();
            window.WorkflowEngine.confirmations.step1InputsConfirmed = true;
            window.WorkflowEngine.confirmations.coordinatesConfirmed = true;
            window.WorkflowEngine.confirmations.addendumConfirmed = true;
            window.WorkflowEngine.confirmations.receiptConfirmed = true;
            window.WorkflowEngine.updateSidebarStatusUI();
        }

        if (window.ChequeScheduleView) {
            window.ChequeScheduleView.render("chequeScheduleRoot");
        }

        if (window.ClientHandoverView) {
            window.ClientHandoverView.render("clientHandoverRoot");
        }

        alert("⚡ Demo Deal Loaded: Alexander Wright | Unit 142 PRIMROSE (115,000 AED in 4 Cheques). All Verification Gates confirmed!");
    },

    /**
     * Interactive Click-to-Jump from Verification Gates in Column C
     */
    jumpToGate: function (gateId) {
        if (!window.WorkflowEngine) return;

        if (gateId === "check-fields-p1") {
            window.WorkflowEngine.goToStep(1);
            // Scan for empty input in page 1
            setTimeout(() => {
                const inputs = document.querySelectorAll('#contractDataForm input[type="text"]');
                let target = null;
                for (const inp of inputs) {
                    if (!inp.value || inp.value.trim() === "") {
                        target = inp;
                        break;
                    }
                }
                if (!target) target = document.getElementById("field-contract_date");
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                    target.focus();
                    target.classList.add("field-attention-pulse");
                    setTimeout(() => target.classList.remove("field-attention-pulse"), 4200);
                }
            }, 100);
        } else if (gateId === "check-fields-p3") {
            window.WorkflowEngine.goToStep(1);
            setTimeout(() => {
                const c1 = document.getElementById("field-term_line_1");
                if (c1) {
                    c1.scrollIntoView({ behavior: "smooth", block: "center" });
                    c1.focus();
                    c1.classList.add("field-attention-pulse");
                    setTimeout(() => c1.classList.remove("field-attention-pulse"), 4200);
                }
            }, 100);
        } else if (gateId === "check-addendum") {
            window.WorkflowEngine.goToStep(2);
            setTimeout(() => {
                const addRoot = document.getElementById("addendumFieldsRoot");
                if (addRoot) {
                    const firstInp = addRoot.querySelector("input");
                    if (firstInp) {
                        firstInp.scrollIntoView({ behavior: "smooth", block: "center" });
                        firstInp.focus();
                        firstInp.classList.add("field-attention-pulse");
                        setTimeout(() => firstInp.classList.remove("field-attention-pulse"), 4200);
                    }
                }
            }, 100);
        } else if (gateId === "check-receipt") {
            window.WorkflowEngine.goToStep(3);
            setTimeout(() => {
                const recRoot = document.getElementById("receiptFieldsRoot");
                if (recRoot) {
                    const firstInp = recRoot.querySelector("input");
                    if (firstInp) {
                        firstInp.scrollIntoView({ behavior: "smooth", block: "center" });
                        firstInp.focus();
                        firstInp.classList.add("field-attention-pulse");
                        setTimeout(() => firstInp.classList.remove("field-attention-pulse"), 4200);
                    }
                }
            }, 100);
        } else if (gateId === "check-calibration") {
            // Toggle Column B tools
            if (window.ViewerToolbarView) {
                window.ViewerToolbarView.toggleCalibrationTools(true);
            }
        } else if (gateId === "check-stamped-pdf") {
            window.WorkflowEngine.goToStep(4);
            const procBtn = document.getElementById("btn-footer-process");
            if (procBtn) {
                procBtn.classList.add("field-attention-pulse");
                setTimeout(() => procBtn.classList.remove("field-attention-pulse"), 4200);
            }
        }
    }
};

