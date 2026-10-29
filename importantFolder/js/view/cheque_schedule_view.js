// FILE: js/view/cheque_schedule_view.js
/**
 * [Category 1: View]
 * White Caves Real Estate - Dynamic Cheque Payment Schedule View Builder (cheque_schedule_view.js)
 * Generates an interactive cheque breakdown table (1, 2, 4, 6, 12 cheques)
 * with auto-calculated due dates and instalment amounts based on annual rent and commencement date.
 * Zero business logic inside event listeners.
 */

window.ChequeScheduleView = {
    selectedChequeCount: 4,
    chequesData: [],

    render: function (containerId) {
        if (typeof document === "undefined") return;
        const root = document.getElementById(containerId);
        if (!root) return;

        // Pull annual rent and commencement date from form metrics
        const metrics = window.FormLayoutBuilder ? window.FormLayoutBuilder.collectCurrentFormMetrics() : null;
        const page1 = metrics && metrics.payload ? metrics.payload.page1 : {};
        const rawRent = String(page1.annual_rent || "115,000 AED").replace(/[^0-9.]/g, "");
        const rentNumeric = parseFloat(rawRent) || 115000;
        const startDateStr = page1.date_from || "01-10-2025";

        this.generateDefaultCheques(this.selectedChequeCount, rentNumeric, startDateStr);

        let optionsHtml = "";
        const counts = [1, 2, 4, 6, 12];
        counts.forEach(cnt => {
            const label = cnt === 1 ? "1 Cheque (100% Upfront)" : (cnt === 4 ? "4 Cheques (Standard UAE)" : `${cnt} Cheques`);
            optionsHtml += `<option value="${cnt}" ${this.selectedChequeCount === cnt ? "selected" : ""}>${label}</option>`;
        });

        let rowsHtml = "";
        this.chequesData.forEach((ch, idx) => {
            rowsHtml += `
                <tr>
                    <td style="font-weight:700; color:#1e3a8a;">#${idx + 1}</td>
                    <td>
                        <input type="text" class="cheque-date-input" data-cheque-idx="${idx}" value="${ch.dueDate}" style="font-weight:600;">
                    </td>
                    <td>
                        <input type="text" class="cheque-amount-input" data-cheque-idx="${idx}" value="${ch.amount.toLocaleString()} AED" style="font-weight:700; color:#059669;">
                    </td>
                    <td>
                        <input type="text" class="cheque-number-input" data-cheque-idx="${idx}" value="${ch.chequeNo}" placeholder="e.g. 00012${idx + 1}">
                    </td>
                    <td>
                        <input type="text" class="cheque-bank-input" data-cheque-idx="${idx}" value="${ch.bankName}" placeholder="e.g. Emirates NBD">
                    </td>
                    <td>
                        <span class="diff-pill diff-badge-renewal" style="font-size:0.68rem;">Instalment ${idx + 1}/${this.selectedChequeCount}</span>
                    </td>
                </tr>
            `;
        });

        root.innerHTML = `
            <div class="cheque-schedule-card">
                <div class="cheque-schedule-header">
                    <div class="cheque-schedule-title">
                        <span>💳</span>
                        <span>Cheque Payment Schedule (${this.selectedChequeCount} Cheques)</span>
                    </div>
                    <div class="cheque-count-selector">
                        <label for="chequeCountSelect" style="font-size:0.75rem; font-weight:600; color:#475569;">Instalments:</label>
                        <select id="chequeCountSelect" class="viewer-select viewer-select-narrow" style="padding:3px 8px; font-weight:700;">
                            ${optionsHtml}
                        </select>
                    </div>
                </div>

                <div style="font-size:0.73rem; color:#64748b; margin-bottom:8px;">
                    Annual Rent: <strong>${rentNumeric.toLocaleString()} AED</strong> divided across <strong>${this.selectedChequeCount}</strong> instalments from <strong>${startDateStr}</strong>.
                </div>

                <div style="overflow-x:auto;">
                    <table class="cheque-table">
                        <thead>
                            <tr>
                                <th style="width:50px;">Cheque</th>
                                <th style="width:125px;">Due Date</th>
                                <th style="width:130px;">Amount (AED)</th>
                                <th>Cheque Number</th>
                                <th>Drawn On Bank</th>
                                <th style="width:110px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.bindEvents(root);
    },

    generateDefaultCheques: function (count, totalRent, startDateStr) {
        this.chequesData = [];
        const instalment = Math.round(totalRent / count);

        // Parse start date DD-MM-YYYY
        let startD = 1, startM = 0, startY = 2025;
        const parts = String(startDateStr).split(/[-\/\.]/);
        if (parts.length === 3) {
            startD = parseInt(parts[0], 10) || 1;
            startM = (parseInt(parts[1], 10) || 10) - 1;
            startY = parseInt(parts[2], 10) || 2025;
        }

        const monthsInterval = 12 / count;

        for (let i = 0; i < count; i++) {
            const dueDateObj = new Date(startY, startM + Math.round(i * monthsInterval), startD);
            const pad = (n) => String(n).padStart(2, "0");
            const dueDateStr = `${pad(dueDateObj.getDate())}-${pad(dueDateObj.getMonth() + 1)}-${dueDateObj.getFullYear()}`;

            this.chequesData.push({
                index: i + 1,
                dueDate: dueDateStr,
                amount: instalment,
                chequeNo: `00010${i + 1}`,
                bankName: "Emirates NBD"
            });
        }
    },

    bindEvents: function (root) {
        const sel = root.querySelector("#chequeCountSelect");
        if (sel) {
            sel.addEventListener("change", (e) => {
                this.selectedChequeCount = parseInt(e.target.value, 10) || 4;
                this.render(root.id);
                // Also update Mode of Payment field in Step 1
                const modeInput = document.getElementById("field-mode_of_payment");
                if (modeInput) {
                    modeInput.value = `${this.selectedChequeCount} CHEQUES`;
                    if (window.WorkflowEngine) window.WorkflowEngine.onFormInputMutated();
                }
            });
        }

        root.querySelectorAll(".cheque-date-input").forEach(inp => {
            inp.addEventListener("change", (e) => {
                const idx = parseInt(e.target.getAttribute("data-cheque-idx"), 10);
                if (this.chequesData[idx]) this.chequesData[idx].dueDate = e.target.value;
            });
        });

        root.querySelectorAll(".cheque-amount-input").forEach(inp => {
            inp.addEventListener("change", (e) => {
                const idx = parseInt(e.target.getAttribute("data-cheque-idx"), 10);
                const num = parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0;
                if (this.chequesData[idx]) this.chequesData[idx].amount = num;
            });
        });

        root.querySelectorAll(".cheque-number-input").forEach(inp => {
            inp.addEventListener("change", (e) => {
                const idx = parseInt(e.target.getAttribute("data-cheque-idx"), 10);
                if (this.chequesData[idx]) this.chequesData[idx].chequeNo = e.target.value;
            });
        });

        root.querySelectorAll(".cheque-bank-input").forEach(inp => {
            inp.addEventListener("change", (e) => {
                const idx = parseInt(e.target.getAttribute("data-cheque-idx"), 10);
                if (this.chequesData[idx]) this.chequesData[idx].bankName = e.target.value;
            });
        });
    }
};

