// FILE: server/services/contract_parser.js
/**
 * White Caves Real Estate - DLD Unified Tenancy Contract (v1.4) & RERA Addendum Anchor Parser
 * 
 * ⚠️ STRICT ARCHITECTURAL ISOLATION RULE:
 * This microservice module is dedicated EXCLUSIVELY to INBOUND extraction and parsing of uploaded
 * Old Tenancy Contracts, Ejari Certificates, and KYC documents.
 * 
 * ⛔ NEVER MIX WITH OUTBOUND STAMPING CALIBRATION:
 * Coordinate calibration for stamping/burning text onto the new blank template is located exclusively
 * in the client-side Outbound Coordinate Matrix (contract_mapper.js). This inbound parser operates
 * purely on text and OCR arrays without any template drawing coordinates.
 * 
 * Extracts structured contract values using rigid government anchor lines.
 * Features strict label-rejection guards so that field labels are never captured as extracted values.
 * Supports all 24 Page 1 DLD fields, property usage tick (✓), and 5 Page 3 additional clauses.
 */

const ContractParser = {
    parse: function (rawText, ocrLines) {
        const text = String(rawText || '');
        const lines = ocrLines || text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        const data = {};
        const arabicRegex = /[\u0600-\u06FF]/g;
        const cleanPunctuation = (str) => {
            if (!str) return '';
            return str
                .replace(/^[\s\.\:\/\-\|#\*_•]+|[\s\.\:\/\-\|#\*_•]+$/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        };

        // Guard against matching legal clauses or paragraph snippets instead of entity names
        const isLegalClause = (str) => {
            if (!str || str.length < 2) return true;
            const legalKeywords = /\b(shall|hereby|agree|agrees|agreed|covenant|covenants|accordance|statutory|regulation|regulations|decree|provisions|provided|conflict|ambiguity|prevail|strictly|exclusive|exclusively|prohibited|without|obtaining|consent|notice|vacate|eviction|routine|disputes|adjudication|integral|binding|executed|between|jurisdiction|addendum|attached|herein|parties|witnesseth)\b/i;
            return legalKeywords.test(str);
        };

        // Comprehensive DLD / Ejari Form Label Guard
        const isLabel = (str) => {
            if (!str || typeof str !== 'string') return true;
            const clean = str
                .replace(arabicRegex, '')
                .replace(/[:\/\-\|\#\.\,\(\)\*]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (clean.length < 2) return true;

            const hasDigits = /\d/.test(clean);

            const labelPatterns = [
                /^(?:the\s+)?tenant(?:['’]s)?(?:\s+(?:name|info|information|details))?$/i,
                /^(?:the\s+)?(?:landlord|lessor|owner)(?:['’]s)?(?:\s+(?:name|info|information|details))?$/i,
                /^(?:name\s+of\s+)?(?:tenant|lessor|owner|landlord)$/i,
                /^(?:first|second)\s+party$/i,
                /^(?:tenant(?:['’]s)?\s+)?(?:emirates\s*id|id\s*(?:no|number)?|passport(?:\s*(?:no|number))?)$/i,
                /^(?:lessor(?:['’]s)?\s+)?(?:emirates\s*id|id\s*(?:no|number)?|passport(?:\s*(?:no|number))?)$/i,
                /^(?:tenant(?:['’]s)?\s+)?(?:email|e-mail|phone|mobile|telephone|fax)(?:\s*(?:no|number))?$/i,
                /^(?:lessor(?:['’]s)?\s+)?(?:email|e-mail|phone|mobile|telephone|fax)(?:\s*(?:no|number))?$/i,
                /^(?:nationality|gender|profession|license\s*no)$/i,
                /^(?:plot|plot\s*(?:no|number))$/i,
                /^(?:building|tower|cluster|project)(?:['’]s)?(?:\s*name)?$/i,
                /^(?:property|unit|flat|apartment|villa)(?:\s*(?:no|number))?$/i,
                /^(?:property\s+)?type$/i,
                /^(?:property\s+)?(?:area|size)(?:\s*\(?s\.?m\.?\)?)?$/i,
                /^(?:property\s+)?usage$/i,
                /^(?:location|community|area|master\s+developer)$/i,
                /^(?:premise|premises|dewa|dewa\s+premise(?:s)?)(?:\s*(?:no|number))?$/i,
                /^(?:contract|ejari|registration)(?:\s*(?:no|number))?$/i,
                /^(?:period|tenancy\s+period|period\s*[-–]\s*from|period\s*[-–]\s*to|from\s+date|to\s+date|commencement|expiration|expiry)$/i,
                /^(?:annual\s+rent|rent\s+value|total\s+rent|gross\s+annual\s+rent|contract\s+value)$/i,
                /^(?:security\s+deposit|deposit|refundable\s+security\s+deposit)$/i,
                /^(?:mode\s+of\s+payment|payment\s+mode|payment\s+frequency|number\s+of\s+cheques|installments)$/i,
                /^(?:unified\s+tenancy\s+contract|tenancy\s+contract|ejari|rera|dld|dubai\s+land\s+department)$/i,
                /^(?:terms\s+and\s+conditions|special\s+conditions|additional\s+terms|general\s+terms|clauses)$/i,
                /^(?:signature|signatures|witness|witnesses|date|stamp|signed\s+by)$/i
            ];

            for (const pat of labelPatterns) {
                if (pat.test(clean)) return true;
            }

            if (!hasDigits) {
                const labelKeywords = /^(?:tenant|lessor|landlord|owner|name|emirates|id|passport|email|phone|mobile|property|unit|flat|building|plot|area|location|premise|dewa|contract|ejari|period|from|to|rent|annual|value|deposit|security|cheque|cheques|mode|payment|usage|type|signature|section|clause|first|second|party|details|info)$/i;
                const words = clean.split(' ').filter(w => w.length > 2);
                if (words.length > 0 && words.every(w => labelKeywords.test(w))) {
                    return true;
                }
            }

            return false;
        };

        const matchRegex = (regex) => {
            const m = text.match(regex);
            return m ? (m[1] || m[0]).trim() : '';
        };

        const extractByAnchor = (anchorPatterns, stopPatterns = [], skipLineRegex = null) => {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (skipLineRegex && skipLineRegex.test(line)) continue;

                for (const pattern of anchorPatterns) {
                    if (pattern.test(line)) {
                        let rem = line.replace(pattern, '').replace(arabicRegex, '');
                        for (const sp of stopPatterns) {
                            const idx = rem.search(sp);
                            if (idx !== -1) rem = rem.substring(0, idx);
                        }
                        rem = cleanPunctuation(rem);
                        if (rem.length >= 1 && !isLabel(rem) && !isLegalClause(rem)) return rem;

                        for (let j = 1; j <= 4 && (i + j) < lines.length; j++) {
                            const rawNext = lines[i + j];
                            if (skipLineRegex && skipLineRegex.test(rawNext)) continue;

                            let next = rawNext.replace(arabicRegex, '');
                            for (const sp of stopPatterns) {
                                const idx = next.search(sp);
                                if (idx !== -1) next = next.substring(0, idx);
                            }
                            next = cleanPunctuation(next);

                            if (isLabel(next) || isLegalClause(next)) continue;
                            if (next.length >= 1) return next;
                        }
                    }
                }
            }
            return '';
        };

        // Section boundaries
        const lessorIdx = lines.findIndex(l => /(?:owner|lessor|landlord)\s*(?:info|information|details)|بيانات\s*المؤجر|الطرف\s*الأول/i.test(l));
        const tenantIdx = lines.findIndex(l => /tenant\s*(?:info|information|details)|بيانات\s*المستأجر|الطرف\s*الثاني/i.test(l));
        const propIdx = lines.findIndex(l => /property\s*(?:info|information|details|address)|بيانات\s*العقار/i.test(l));
        const termsIdx = lines.findIndex(l => /contract\s*(?:info|information|terms)|financial\s*terms|بيانات\s*العقد/i.test(l));

        const getSectionText = (start, end) => {
            const s = start >= 0 ? start : 0;
            const e = end >= 0 ? end : lines.length;
            return lines.slice(s, e).join('\n');
        };

        const lessorSection = getSectionText(lessorIdx, tenantIdx > lessorIdx ? tenantIdx : -1);
        const tenantSection = getSectionText(tenantIdx, propIdx > tenantIdx ? propIdx : -1);

        // Normalize Date
        const normalizeDate = (str) => {
            if (!str) return '';
            const parts = str.replace(/[\/\.]/g, '-').split('-');
            if (parts.length === 3) {
                let [d, m, y] = parts;
                if (d.length === 4) { const tmp = d; d = y; y = tmp; }
                return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
            }
            return str;
        };

        // 1. Contract Date
        const contractDateMatch = matchRegex(/(?:Contract\s*Date|Date\s*of\s*Contract|تاريخ\s*العقد)[:\s]+(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/i)
            || matchRegex(/(?:Dubai|Date)[:\s]+(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/i);
        if (contractDateMatch) data.contract_date = normalizeDate(contractDateMatch);

        // 2. Tenancy Period (From & To)
        const fromMatch = matchRegex(/(?:Period\s*[-–]?\s*From|Commencement|Start\s*Date|Tenancy\s*Commencement|من\s*تاريخ)[:\s]+(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/i)
            || matchRegex(/\bFrom[:\s]+(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/i);
        const toMatch = matchRegex(/(?:Period\s*[-–]?\s*To|Expiration|Expiry|End\s*Date|Tenancy\s*Expiration|إلى\s*تاريخ)[:\s]+(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/i)
            || matchRegex(/\bTo[:\s]+(\d{2}[-\/\.]\d{2}[-\/\.]\d{4})/i);

        if (fromMatch) data.date_from = normalizeDate(fromMatch);
        if (toMatch) data.date_to = normalizeDate(toMatch);

        if (!data.date_from || !data.date_to) {
            const allDates = text.match(/\b\d{2}[-\/\.]\d{2}[-\/\.]\d{4}\b/g) || [];
            if (allDates.length >= 2) {
                if (!data.date_from) data.date_from = normalizeDate(allDates[0]);
                if (!data.date_to) data.date_to = normalizeDate(allDates[1]);
            }
        }

        // 3. Financial Terms
        const rentMatch = matchRegex(/(?:Annual\s*Rent|Rent\s*Value|Total\s*Rent|Gross\s*Annual\s*Rent|الإيجار\s*السنوي)[:\s]+(?:AED)?\s*([\d,]+(?:\.\d{2})?)/i)
            || matchRegex(/AED\s*([\d,]{4,10})/i);
        if (rentMatch) {
            const rentVal = rentMatch.replace(/AED/gi, '').trim();
            data.annual_rent = `${rentVal} AED`;
            data.contract_value = `${rentVal} AED`;
        }

        const contractValMatch = matchRegex(/(?:Contract\s*Value|Total\s*Contract\s*Value|قيمة\s*العقد)[:\s]+(?:AED)?\s*([\d,]+(?:\.\d{2})?)/i);
        if (contractValMatch) {
            data.contract_value = `${contractValMatch.replace(/AED/gi, '').trim()} AED`;
        }

        const depMatch = matchRegex(/(?:Security\s*Deposit|Deposit|Refundable\s*Security\s*Deposit|مبلغ\s*التأمين)[:\s]+(?:AED)?\s*([\d,]+(?:\.\d{2})?)/i);
        if (depMatch) {
            data.security_deposit = `${depMatch.replace(/AED/gi, '').trim()} AED`;
        }

        const chequeMatch = matchRegex(/(\d+)\s*(?:Cheques?|Installments?|CHEQUES|Payments?)/i)
            || matchRegex(/(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Twelve)\s*\(\d+\)\s*Installments/i)
            || matchRegex(/(?:Mode\s*of\s*Payment|Payment\s*Mode|طريقة\s*الدفع)[:\s]+([^\n\r,]{2,30})/i);
        if (chequeMatch) {
            const cleanCheque = cleanPunctuation(chequeMatch.replace(arabicRegex, ''));
            if (!isLabel(cleanCheque)) {
                data.mode_of_payment = cleanCheque.toUpperCase().includes('CHEQUE') ? cleanCheque : `${cleanCheque} CHEQUES`;
            }
        }

        // 4. DEWA Premises No.
        const dewaMatch = matchRegex(/(?:DEWA|Premise(?:s)?\s*(?:No|Number|\#)?|رقم\s*ديوا)[:\s\.\-]+(\d{7,12})/i)
            || matchRegex(/\b(9\d{8})\b/);
        if (dewaMatch) data.dewa_premises = dewaMatch;

        // 5. Emirates IDs & Passports
        const allEids = text.match(/\b784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d\b/g) || [];
        if (allEids.length > 0) {
            data.tenant_eid = allEids[0].replace(/\s+/g, '-');
            if (allEids.length > 1) {
                data.lessor_id = allEids[1].replace(/\s+/g, '-');
            }
        }

        if (!data.lessor_id) {
            const lessorIdMatch = matchRegex(/(?:Lessor|Owner|Landlord)\s*(?:ID|Passport|Emirates\s*ID)[:\s]+([A-Za-z0-9\/\-\s]{5,35})/i)
                || matchRegex(/\b([A-Z]\s*\d{8,10})\b/);
            if (lessorIdMatch && !isLabel(lessorIdMatch)) data.lessor_id = cleanPunctuation(lessorIdMatch);
        }

        // 6. Emails & Phones
        const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g) || [];
        if (emails.length > 0) {
            const firstEmail = emails[0];
            if (tenantSection.includes(firstEmail)) {
                data.tenant_email = firstEmail;
                if (emails.length > 1) data.lessor_email = emails[1];
            } else if (lessorSection.includes(firstEmail)) {
                data.lessor_email = firstEmail;
                if (emails.length > 1) data.tenant_email = emails[1];
            } else {
                data.tenant_email = firstEmail;
                if (emails.length > 1) data.lessor_email = emails[1];
            }
        }

        const phoneRegex = /(?:\+?971|0)?(?:5[0-9]{8}|[423679][0-9]{7}|[0-9]{10,12})\b/g;
        const phones = text.match(phoneRegex) || [];
        if (phones.length > 0) {
            data.tenant_phone = phones[0];
            if (phones.length > 1) data.lessor_phone = phones[1];
        }

        // 7. Property Details
        const plotMatch = matchRegex(/(?:Plot\s*(?:No|Number|\#)?|رقم\s*الأرض)[:\s]+(\d+)/i)
            || matchRegex(/\bPlot\s*[:\.]?\s*(\d+)/i);
        if (plotMatch) {
            data.plot_no = plotMatch;
        } else {
            const plotVal = extractByAnchor([/(?:plot)\s*(?:no|number|\#|\:|\.)/i, /رقم\s*الأرض/], [/(?:building|property|location|area)/i]);
            if (plotVal && !isLabel(plotVal)) data.plot_no = plotVal.replace(/\D/g, '') || plotVal;
        }

        const unitMatch = matchRegex(/(?:Property|Unit|Flat|Apartment)\s*(?:No|Number|\#)?[:\s]+(\d+[A-Za-z0-9\-]*)/i)
            || matchRegex(/\bUnit\s*[:\.]?\s*(\d+)/i);
        if (unitMatch) {
            data.property_no = unitMatch;
        } else {
            const unitVal = extractByAnchor([/(?:property|unit|flat|apartment)\s*(?:no|number|\#|\:|\.)/i, /رقم\s*العقار/, /رقم\s*الوحدة/], [/(?:building|plot|location|area|premise|dewa|type)/i], /premise|dewa/i);
            if (unitVal && !isLabel(unitVal)) data.property_no = unitVal;
        }

        const bldgMatch = matchRegex(/(?:Building|Tower|Cluster|Project)\s*(?:Name)?[:\s]+([A-Za-z0-9\s\-]{2,30})/i);
        if (bldgMatch && !isLabel(bldgMatch)) {
            data.building_name = cleanPunctuation(bldgMatch);
        } else {
            const bldgVal = extractByAnchor([/(?:building|tower|cluster|project)\s*(?:['’]s)?\s*name/i, /اسم\s*المبنى/, /اسم\s*البرج/], [/(?:property|unit|flat|plot|location|area|premise|dewa|type)/i]);
            if (bldgVal && !isLabel(bldgVal)) data.building_name = bldgVal;
        }

        const locMatch = matchRegex(/(?:Location|Community|Area\s*Name|Master\s*Developer)[:\s]+([A-Za-z0-9\s\-]{3,40})/i);
        if (locMatch && !isLabel(locMatch)) {
            data.location = cleanPunctuation(locMatch);
        } else {
            const locVal = extractByAnchor([/(?:location|community|area\s*name|master\s*developer)/i, /الموقع/, /المنطقة/], [/(?:plot|premise|building|property|dewa)/i]);
            if (locVal && !isLabel(locVal)) data.location = locVal;
        }

        const typeMatch = text.match(/\b(Apartment|Villa|Townhouse|Land|Commercial|Residential|Office|Retail)\b/i);
        if (typeMatch) data.property_type = typeMatch[1].toUpperCase();

        const areaMatch = matchRegex(/(?:Property\s*Area|Area|Size)\s*(?:\(?s\.?m\.?\)?)?[:\s]+(\d+(?:\.\d{1,2})?)/i)
            || matchRegex(/(\d+(?:\.\d{1,2})?)\s*(?:Sq\.?\s*M|s\.m|sqm)/i);
        if (areaMatch) data.property_area = areaMatch;

        // Property Usage Tick
        data.prop_usage = '✓';

        // 8. Tenant & Owner Names
        if (!data.tenant_name) {
            const tenantMatch = matchRegex(/(?:Tenant(?:['’]s)?\s*Name|Name\s*of\s*Tenant|اسم\s*المستأجر)[:\s]+([A-Za-z\s\.\,\-]+)/i);
            if (tenantMatch && !isLabel(tenantMatch) && !isLegalClause(tenantMatch)) {
                data.tenant_name = cleanPunctuation(tenantMatch);
            }
        }
        if (!data.tenant_name) {
            const tenantVal = extractByAnchor([/(?:tenant)(?:['’]s)?\s*name/i, /name\s*of\s*tenant/i, /اسم\s*المستأجر/], [/(?:lessor|owner|landlord|phone|email|mobile|passport|eid|nationality|signature)/i]);
            if (tenantVal && !isLabel(tenantVal) && !isLegalClause(tenantVal)) data.tenant_name = tenantVal;
        }

        if (!data.owner_name) {
            const ownerMatch = matchRegex(/(?:Owner(?:['’]s)?\s*Name|Lessor(?:['’]s)?\s*Name|Name\s*of\s*(?:Owner|Lessor)|اسم\s*(?:المالك|المؤجر))[:\s]+([A-Za-z\s\.\,\-]+)/i);
            if (ownerMatch && !isLabel(ownerMatch) && !isLegalClause(ownerMatch)) {
                data.owner_name = cleanPunctuation(ownerMatch);
                data.lessor_name = data.owner_name;
            }
        }
        if (!data.owner_name) {
            const ownerVal = extractByAnchor([/(?:owner|lessor|landlord)(?:['’]s)?\s*name/i, /name\s*of\s*(?:owner|lessor|landlord)/i, /اسم\s*المالك/, /اسم\s*المؤجر/], [/(?:tenant|building|property|unit|phone|email|mobile|passport|nationality|signature)/i]);
            if (ownerVal && !isLabel(ownerVal) && !isLegalClause(ownerVal)) {
                data.owner_name = ownerVal;
                data.lessor_name = ownerVal;
            }
        } else if (!data.lessor_name) {
            data.lessor_name = data.owner_name;
        }

        // 9. Page 3 Clauses (term_line_1 to term_line_5)
        const defaultClauses = [
            'The addendum attached to this is an integral part of the tenancy contract.',
            'This contract is valid for 1 year only. Renewal of the contract is subject to the approval of the landlord.',
            'The security deposit is non-refundable if the house isn\'t returned clean, undamaged, and with proof of required services.',
            'The landlord will confirm and arrange the maintenance, including cleaning, painting, and AC service, for the tenant before MOVE-IN.',
            'The key handover will be processed after the submission of EJARI, DEWA receipt, and MOVE-IN permit by DAMAC.'
        ];

        const clausePatterns = [
            /(?:^|\n)\s*1[\.\)\-]\s*([^\n\r]{15,300})/i,
            /(?:^|\n)\s*2[\.\)\-]\s*([^\n\r]{15,300})/i,
            /(?:^|\n)\s*3[\.\)\-]\s*([^\n\r]{15,300})/i,
            /(?:^|\n)\s*4[\.\)\-]\s*([^\n\r]{15,300})/i,
            /(?:^|\n)\s*5[\.\)\-]\s*([^\n\r]{15,300})/i
        ];

        for (let i = 1; i <= 5; i++) {
            const key = `term_line_${i}`;
            const m = text.match(clausePatterns[i - 1]);
            if (m && m[1]) {
                const cleanedClause = cleanPunctuation(m[1].replace(arabicRegex, ''));
                if (cleanedClause.length >= 10 && !isLabel(cleanedClause)) {
                    data[key] = cleanedClause;
                    continue;
                }
            }
            data[key] = defaultClauses[i - 1];
        }

        // 10. Auto-Calculate Renewal Dates (+1 Year Advance)
        data.renewalDates = this.calculateRenewalDates(data.date_from, data.date_to);

        return data;
    },

    calculateRenewalDates: function (oldFromStr, oldToStr) {
        if (!oldToStr) return null;
        try {
            const parts = oldToStr.split('-');
            if (parts.length !== 3) return null;
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);

            const oldExpiryDate = new Date(year, month, day);
            const newStartDate = new Date(oldExpiryDate);
            newStartDate.setDate(newStartDate.getDate() + 1);

            const newExpiryDate = new Date(newStartDate);
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
            newExpiryDate.setDate(newExpiryDate.getDate() - 1);

            const pad = (n) => String(n).padStart(2, '0');
            const newFrom = `${pad(newStartDate.getDate())}-${pad(newStartDate.getMonth() + 1)}-${newStartDate.getFullYear()}`;
            const newTo = `${pad(newExpiryDate.getDate())}-${pad(newExpiryDate.getMonth() + 1)}-${newExpiryDate.getFullYear()}`;

            return {
                originalOldFrom: oldFromStr,
                originalOldTo: oldToStr,
                suggestedRenewalFrom: newFrom,
                suggestedRenewalTo: newTo,
                reason: 'Auto-advanced by 1 year for Tenancy Renewal'
            };
        } catch (e) {
            return null;
        }
    }
};

module.exports = ContractParser;
