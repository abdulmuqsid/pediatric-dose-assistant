import { useState, useCallback } from "react";

const MEDICATIONS = [
  "Paracetamol (Acetaminophen)",
  "Ibuprofen",
  "Amoxicillin",
  "Azithromycin",
  "Cetirizine",
  "Prednisolone",
  "Salbutamol (Albuterol)",
  "Metronidazole",
  "Trimethoprim-Sulfamethoxazole",
  "Ceftriaxone",
  "Dexamethasone",
  "Ondansetron",
];

const INDICATIONS = {
  "Paracetamol (Acetaminophen)": ["Fever", "Mild Pain", "Headache", "Post-vaccination"],
  "Ibuprofen": ["Fever", "Mild-Moderate Pain", "Inflammation", "Headache"],
  "Amoxicillin": ["Otitis Media", "Strep Throat", "Pneumonia", "Sinusitis", "UTI"],
  "Azithromycin": ["Community-Acquired Pneumonia", "Strep Throat", "Otitis Media", "Skin Infection"],
  "Cetirizine": ["Allergic Rhinitis", "Urticaria", "Atopic Dermatitis"],
  "Prednisolone": ["Asthma Exacerbation", "Croup", "Allergic Reaction", "Nephrotic Syndrome"],
  "Salbutamol (Albuterol)": ["Asthma", "Bronchospasm", "Wheezing"],
  "Metronidazole": ["Giardiasis", "Anaerobic Infection", "C. difficile", "Trichomoniasis"],
  "Trimethoprim-Sulfamethoxazole": ["UTI", "Otitis Media", "Pneumocystis Prophylaxis"],
  "Ceftriaxone": ["Meningitis", "Severe Pneumonia", "Sepsis", "Pyelonephritis"],
  "Dexamethasone": ["Croup", "Meningitis", "Asthma Exacerbation"],
  "Ondansetron": ["Nausea", "Vomiting", "Gastroenteritis"],
  "Other (AI Extrapolation)": ["Other Indication"],
};

const ROUTES = ["Oral", "Intravenous", "Intramuscular", "Subcutaneous", "Inhaled", "Rectal", "Topical"];

const GUIDELINE_DOSES = {
  "Paracetamol (Acetaminophen)": {
    mgPerKgPerDose: 15, maxMgPerKgPerDay: 60, absoluteMaxPerDose: 1000, absoluteMaxPerDay: 4000,
    interval: "Every 4–6 hours", intervalHours: 6, route: "Oral/Rectal/IV",
    ageMin: 0, references: ["WHO Pocket Book of Hospital Care for Children (2013)", "AAP Paracetamol Monograph"],
  },
  "Ibuprofen": {
    mgPerKgPerDose: 10, maxMgPerKgPerDay: 40, absoluteMaxPerDose: 400, absoluteMaxPerDay: 2400,
    interval: "Every 6–8 hours", intervalHours: 8, route: "Oral",
    ageMin: 0.5, references: ["BNF for Children 2023-2024", "AAP Ibuprofen Guidelines"],
    contraindications: ["Renal Impairment", "< 6 months age"],
  },
  "Amoxicillin": {
    indicationDoses: {
    "Otitis Media":    { mgPerKgPerDay: 80, dividedDoses: 3, interval: "Every 8 hours", note: "High-dose for AOM" },
    "Strep Throat":    { mgPerKgPerDay: 50, dividedDoses: 2, interval: "Every 12 hours", note: "Standard strep dosing" },
    "Pneumonia":       { mgPerKgPerDay: 90, dividedDoses: 3, interval: "Every 8 hours", note: "High-dose for pneumonia" },
    "Sinusitis":       { mgPerKgPerDay: 80, dividedDoses: 3, interval: "Every 8 hours", note: "High-dose for sinusitis" },
    "UTI":             { mgPerKgPerDay: 40, dividedDoses: 3, interval: "Every 8 hours", note: "Standard UTI dosing" },
  },
  absoluteMaxPerDay: 3000, route: "Oral", ageMin: 0,
  references: ["AAP Red Book 2021–2024", "Nelson's Pediatric Antimicrobial Therapy"],
  },
  "Azithromycin": {
    mgPerKgPerDose: 10, maxMgPerKgPerDay: 10, absoluteMaxPerDose: 500, absoluteMaxPerDay: 500,
    interval: "Once daily (Day 1: 10 mg/kg, Days 2–5: 5 mg/kg)", intervalHours: 24, route: "Oral",
    ageMin: 0.5, references: ["AAP Red Book 2021–2024"],
  },
  "Cetirizine": {
    special: true, interval: "Once daily", intervalHours: 24, route: "Oral",
    ageMin: 0.5, references: ["BNF for Children 2023-2024"],
    ageDoses: [
      { minAge: 0.5, maxAge: 2, dose: 2.5, maxDose: 2.5 },
      { minAge: 2, maxAge: 6, dose: 2.5, maxDose: 5 },
      { minAge: 6, maxAge: 12, dose: 5, maxDose: 10 },
      { minAge: 12, maxAge: 999, dose: 10, maxDose: 10 },
    ],
  },
  "Prednisolone": {
    mgPerKgPerDose: 1, maxMgPerKgPerDay: 2, absoluteMaxPerDay: 60,
    interval: "Once or twice daily", intervalHours: 24, route: "Oral",
    ageMin: 0, references: ["BNF for Children 2023-2024", "Pediatric Formulary Committee"],
  },
  "Salbutamol (Albuterol)": {
    mgPerKgPerDose: 0.15, absoluteMaxPerDose: 5, absoluteMaxPerDay: 30,
    interval: "Every 4–6 hours as needed", intervalHours: 6, route: "Inhaled/Oral",
    ageMin: 0, references: ["GINA Pediatric Asthma Guidelines 2023", "BNF for Children"],
  },
  "Metronidazole": {
    mgPerKgPerDose: 7.5, maxMgPerKgPerDay: 30, absoluteMaxPerDose: 500, absoluteMaxPerDay: 2000,
    interval: "Every 8 hours", intervalHours: 8, route: "Oral/IV",
    ageMin: 0, references: ["AAP Red Book", "Sanford Guide Pediatric Antimicrobial Therapy"],
  },
  "Trimethoprim-Sulfamethoxazole": {
    mgPerKgPerDose: 4, maxMgPerKgPerDay: 8, absoluteMaxPerDose: 160, absoluteMaxPerDay: 320,
    interval: "Every 12 hours", intervalHours: 12, route: "Oral",
    ageMin: 0.167, references: ["AAP Red Book 2021-2024"],
    note: "Dose based on TMP component",
  },
  "Ceftriaxone": {
    mgPerKgPerDose: 50, maxMgPerKgPerDay: 100, absoluteMaxPerDose: 2000, absoluteMaxPerDay: 4000,
    interval: "Once daily (or every 12h for meningitis)", intervalHours: 24, route: "IV/IM",
    ageMin: 0, references: ["Sanford Guide", "AAP Red Book 2021-2024"],
  },
  "Dexamethasone": {
    indicationDoses: {
    "Croup":               { mgPerKgPerDose: 0.6, maxPerDose: 10, interval: "Single dose", note: "Single dose for croup" },
    "Meningitis":          { mgPerKgPerDose: 0.15, maxPerDose: 10, interval: "Every 6 hours x 4 days", note: "Give before or with first antibiotic dose" },
    "Asthma Exacerbation": { mgPerKgPerDose: 0.6, maxPerDose: 16, interval: "Once daily x 1–2 days", note: "Short course for asthma" },
  },
  route: "Oral/IV/IM", ageMin: 0,
  references: ["Cochrane Review Croup 2018", "AAP Clinical Guidelines"],
  },
  "Ondansetron": {
     indicationDoses: {
    "Nausea":          { mgPerKgPerDose: 0.15, maxPerDose: 8, interval: "Every 8 hours as needed" },
    "Vomiting":        { mgPerKgPerDose: 0.15, maxPerDose: 8, interval: "Every 8 hours as needed" },
    "Gastroenteritis": { mgPerKgPerDose: 0.15, maxPerDose: 8, interval: "Every 8 hours as needed", note: "Single dose often sufficient" },
  },
  route: "Oral/IV", ageMin: 0.5,
  references: ["AAP Gastroenteritis Guidelines", "BNF for Children"], 
  },
};

function calcRuleBasedDose(med, weight, age, renalImpairment, hepaticImpairment, indication) {
  const g = GUIDELINE_DOSES[med];
  if (!g) return null;

  let warnings = [];
  let safetyStatus = "Within safe limits";
  let safetyColor = "success";

  if (g.ageMin && age < g.ageMin) {
    warnings.push(`Not recommended for age < ${g.ageMin < 1 ? Math.round(g.ageMin * 12) + " months" : g.ageMin + " years"}`);
    safetyStatus = "Contraindicated (age)";
    safetyColor = "danger";
  }

  if (renalImpairment) {
    const renalWarnings = {
      "Ibuprofen": { msg: "AVOID — NSAIDs reduce renal blood flow and worsen kidney function in children.", color: "danger", status: "Contraindicated" },
      "Trimethoprim-Sulfamethoxazole": { msg: "Reduce dose by 50% if GFR 15–30. AVOID if GFR < 15 — risk of crystalluria, hyperkalemia and electrolyte imbalance.", color: "danger", status: "Dose adjustment required" },
      "Metronidazole": { msg: "Metabolites may accumulate in severe renal failure — extend dosing interval to every 12h. Monitor for neurotoxicity.", color: "warning", status: "Dose adjustment required" },
      "Ceftriaxone": { msg: "Reduce dose by 25–50% in severe renal impairment. Monitor drug levels if available.", color: "warning", status: "Dose adjustment required" },
      "Amoxicillin": { msg: "Extend interval to every 12h if GFR < 30. Avoid high-dose regimen in severe renal impairment.", color: "warning", status: "Dose adjustment required" },
      "Cetirizine": { msg: "Reduce dose to 2.5 mg once daily in renal impairment — drug is renally cleared.", color: "warning", status: "Dose adjustment required" },
      "Ondansetron": { msg: "No adjustment needed for mild-moderate renal impairment. Use with caution in severe renal failure.", color: "warning", status: "Use with caution" },
    };
    const rw = renalWarnings[med];
    if (rw) {
      warnings.push("RENAL: " + rw.msg);
      safetyColor = rw.color;
      safetyStatus = rw.status;
    } else {
      warnings.push("RENAL: Use with caution — consult nephrology for dose adjustment.");
      if (safetyColor !== "danger") safetyColor = "warning";
      safetyStatus = "Dose adjustment required";
    }
  }

  if (hepaticImpairment) {
    const hepaticWarnings = {
      "Paracetamol (Acetaminophen)": { msg: "REDUCE dose to 10 mg/kg and extend interval to every 8h. Max daily dose 40 mg/kg/day. Severe hepatic failure: AVOID — risk of fulminant hepatotoxicity.", color: "danger", status: "Dose adjustment required" },
      "Metronidazole": { msg: "Metabolized extensively by the liver — reduce dose by 50% in severe hepatic impairment. Monitor for CNS side effects (encephalopathy risk).", color: "danger", status: "Dose adjustment required" },
      "Ibuprofen": { msg: "AVOID in severe hepatic impairment — risk of hepatorenal syndrome and GI bleeding.", color: "danger", status: "Contraindicated" },
      "Prednisolone": { msg: "Use with caution — hepatic impairment may increase steroid bioavailability. Monitor for cushingoid effects.", color: "warning", status: "Use with caution" },
      "Ondansetron": { msg: "Reduce single dose to max 4 mg in severe hepatic impairment (Child-Pugh C) — reduced clearance.", color: "warning", status: "Dose adjustment required" },
      "Azithromycin": { msg: "AVOID in severe hepatic impairment — primarily hepatically metabolized and excreted in bile.", color: "danger", status: "Contraindicated" },
      "Cetirizine": { msg: "No hepatic dose adjustment needed — renally cleared, not hepatically metabolized.", color: "success", status: "Within safe limits" },
    };
    const hw = hepaticWarnings[med];
    if (hw) {
      warnings.push("HEPATIC: " + hw.msg);
      if (hw.color === "danger" || safetyColor === "danger") safetyColor = "danger";
      else if (hw.color === "warning") safetyColor = "warning";
      safetyStatus = hw.status;
    } else {
      warnings.push("HEPATIC: Use with caution — consult hepatology for dose adjustment.");
      if (safetyColor !== "danger") safetyColor = "warning";
      safetyStatus = "Dose adjustment required";
    }
  }
  

  // Indication-specific dosing
  if (g.indicationDoses) {
    const indDose = g.indicationDoses[indication] || Object.values(g.indicationDoses)[0];
    let singleDose;
    if (indDose.mgPerKgPerDose) {
      singleDose = Math.min(indDose.mgPerKgPerDose * weight, indDose.maxPerDose || 9999);
    } else if (indDose.mgPerKgPerDay && indDose.dividedDoses) {
      singleDose = Math.min((indDose.mgPerKgPerDay * weight) / indDose.dividedDoses, (g.absoluteMaxPerDay || 9999) / indDose.dividedDoses);
    }
    if (indDose.note) warnings.unshift(indDose.note);
    return {
      singleDose: Math.round(singleDose * 10) / 10,
      unit: "mg",
      dosePerKg: indDose.mgPerKgPerDose || (indDose.mgPerKgPerDay / indDose.dividedDoses),
      maxDailyDose: g.absoluteMaxPerDay || Math.round(singleDose * (indDose.dividedDoses || 1)),
      interval: indDose.interval,
      route: g.route,
      safetyStatus, safetyColor, warnings,
      references: g.references,
      note: null,
      source: "Guideline-based",
    };
  }

  let singleDose;
  if (g.mgPerKgPerDose) {
    singleDose = g.mgPerKgPerDose * weight;
    if (g.absoluteMaxPerDose) singleDose = Math.min(singleDose, g.absoluteMaxPerDose);
  } else if (g.mgPerKgPerDay && g.dividedDoses) {
    singleDose = (g.mgPerKgPerDay * weight) / g.dividedDoses;
    const maxSingle = g.absoluteMaxPerDay / g.dividedDoses;
    singleDose = Math.min(singleDose, maxSingle);
  }

  const maxDaily = g.absoluteMaxPerDay || (g.maxMgPerKgPerDay * weight);

  return {
    singleDose: Math.round(singleDose),
    unit: "mg",
    dosePerKg: g.mgPerKgPerDose || (g.mgPerKgPerDay / g.dividedDoses),
    maxDailyDose: Math.min(maxDaily, g.absoluteMaxPerDay || maxDaily),
    interval: g.interval,
    route: g.route,
    safetyStatus,
    safetyColor,
    warnings,
    references: g.references,
    note: g.note || null,
    source: "Guideline-based",
  };
}



const StatusBadge = ({ status, color }) => {
  const colors = {
    success: { bg: "#0d3b2a", text: "#2dd4a0", border: "#1a5c42" },
    warning: { bg: "#3b2a00", text: "#f59e0b", border: "#5c4200" },
    danger: { bg: "#3b0d0d", text: "#f87171", border: "#5c1a1a" },
  };
  const c = colors[color] || colors.success;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    }}>
      {status}
    </span>
  );
};

const Toggle = ({ value, onChange, label, icon }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
    <span style={{ fontSize: 20 }}>{icon}</span>
    <span style={{ fontSize: 13, color: "#94a3b8", flex: 1 }}>{label}</span>
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 42, height: 24, borderRadius: 12, background: value ? "#6366f1" : "#1e293b",
        border: `1.5px solid ${value ? "#818cf8" : "#334155"}`,
        position: "relative", cursor: "pointer", transition: "all 0.2s",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 9, background: "#fff",
        position: "absolute", top: 2, left: value ? 20 : 2, transition: "left 0.2s",
      }} />
    </div>
  </label>
);

const NumInput = ({ value, onChange, unit, min, max, step = 0.1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 12px" }}>
    <input
      type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      style={{ background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 15, width: 70, fontFamily: "monospace" }}
    />
    <span style={{ color: "#475569", fontSize: 12 }}>{unit}</span>
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <button onClick={() => onChange(Math.min(max, parseFloat((value + step).toFixed(2))))}
        style={{ background: "#1e293b", border: "none", borderRadius: 4, width: 22, height: 16, cursor: "pointer", color: "#94a3b8", fontSize: 10, lineHeight: 1 }}>▲</button>
      <button onClick={() => onChange(Math.max(min, parseFloat((value - step).toFixed(2))))}
        style={{ background: "#1e293b", border: "none", borderRadius: 4, width: 22, height: 16, cursor: "pointer", color: "#94a3b8", fontSize: 10, lineHeight: 1 }}>▼</button>
    </div>
  </div>
);

const FlowStep = ({ icon, title, sub }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#1e293b", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
    <span style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", fontWeight: 600 }}>{title}</span>
    <span style={{ fontSize: 10, color: "#475569", textAlign: "center" }}>{sub}</span>
  </div>
);

export default function App() {
  const [age, setAge] = useState(2.0);
  const [weight, setWeight] = useState(12.0);
  const [height, setHeight] = useState(90.0);
  const [medication, setMedication] = useState("Paracetamol (Acetaminophen)");
  const [indication, setIndication] = useState("Fever");
  const [route, setRoute] = useState("Oral");
  const [renalImpairment, setRenalImpairment] = useState(false);
  const [hepaticImpairment, setHepaticImpairment] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMedChange = useCallback((m) => {
    setMedication(m);
    const inds = INDICATIONS[m] || ["Other"];
    setIndication(inds[0]);
  }, []);

const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res = calcRuleBasedDose(medication, weight, age, renalImpairment, hepaticImpairment, indication);
      if (!res) {
        setError("This medication isn't in the guideline database yet. An API key is required for AI extrapolation.");
      } else {
        setResult(res);
      }
    } catch (e) {
      setError("Calculation failed: " + e.message);
    }
    setLoading(false);
  }; 

  const indicationOptions = INDICATIONS[medication] || ["Other"];
  const selectStyle = {
    background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8,
    color: "#e2e8f0", padding: "8px 12px", fontSize: 13, width: "100%", outline: "none",
  };

  const sectionNum = (n, label, icon) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{n}</div>
      <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{label}</span>
      <span style={{ fontSize: 18 }}>{icon}</span>
    </div>
  );

  const fieldRow = (label, icon, content) => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 10 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 13, color: "#64748b", minWidth: 100 }}>{label}</span>
      <div style={{ flex: 1 }}>{content}</div>
    </div>
  );
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#070d1a", minHeight: "100vh", padding: 20, color: "#e2e8f0" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🧒</div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg, #818cf8, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Smart Pediatric Dose Assistant</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>AI-Supported Hybrid System · Guideline-based + ML Extrapolation</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "#1e293b", border: "1px solid #f59e0b", borderRadius: 8, padding: "8px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700 }}>⚠ EDUCATIONAL PROTOTYPE</div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>NOT FOR CLINICAL USE</div>
          </div>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 16px", maxWidth: 220 }}>
            <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, marginBottom: 2 }}>💡 About</div>
            <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.4 }}>Hybrid AI system combining evidence-based pediatric guidelines with allometric ML scaling for dose extrapolation.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

        {/* LEFT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Section 1: Patient Info */}
          <div style={{ background: "#0d1526", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
            {sectionNum(1, "Patient Information", "🧑‍⚕️")}
            {fieldRow("Age (years)", "📅", <NumInput value={age} onChange={setAge} unit="years" min={0.1} max={18} step={0.1} />)}
            {fieldRow("Weight (kg)", "⚖️", <NumInput value={weight} onChange={setWeight} unit="kg" min={1} max={120} step={0.5} />)}
            {fieldRow("Height (cm)", "📏", <NumInput value={height} onChange={setHeight} unit="cm" min={40} max={200} step={0.5} />)}
          </div>

          {/* Section 2: Clinical Details */}
          <div style={{ background: "#0d1526", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
            {sectionNum(2, "Clinical Details", "💊")}
            {fieldRow("Medication", "💉", (
              <select value={medication} onChange={e => handleMedChange(e.target.value)} style={selectStyle}>
                {MEDICATIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ))}
            {fieldRow("Indication", "🎯", (
              <select value={indication} onChange={e => setIndication(e.target.value)} style={selectStyle}>
                {indicationOptions.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            ))}
            {fieldRow("Route", "🩺", (
              <select value={route} onChange={e => setRoute(e.target.value)} style={selectStyle}>
                {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            ))}
          </div>

          {/* Section 3: Additional Info */}
          <div style={{ background: "#0d1526", border: "1px solid #1e293b", borderRadius: 14, padding: 20 }}>
            {sectionNum(3, "Additional Information", "⚙️")}
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1, background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, padding: 14 }}>
                <Toggle value={renalImpairment} onChange={setRenalImpairment} label="Renal Impairment" icon="🫘" />
              </div>
              <div style={{ flex: 1, background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, padding: 14 }}>
                <Toggle value={hepaticImpairment} onChange={setHepaticImpairment} label="Hepatic Impairment" icon="🫀" />
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            style={{
              background: loading ? "#1e293b" : "linear-gradient(135deg, #6366f1, #4f46e5)",
              border: "none", borderRadius: 12, padding: "16px 24px",
              color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.2s", opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: 18 }}>⟳</span>
                Calculating Dose...
              </>
            ) : (
              <><span style={{ fontSize: 20 }}>🧠</span> Calculate Dose →</>
            )}
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

          <div style={{ background: "#0d1526", border: "1px solid #f59e0b33", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e", display: "flex", gap: 8, alignItems: "center" }}>
            <span>⚠</span> Always use clinical judgment. Verify with standard references.
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Section 4: Results */}
          <div style={{ background: "#0d1526", border: "1px solid #1e293b", borderRadius: 14, padding: 20, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "#06b6d4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>4</div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>Calculated Dose & Recommendation</span>
              </div>
              {result && (
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "4px 12px", fontSize: 10, color: "#64748b", textAlign: "center" }}>
                  <div style={{ color: "#6366f1", fontWeight: 700 }}>⚡ {result.source}</div>
                  <div>Weight-based + Safety Logic</div>
                </div>
              )}
            </div>

            {error && (
              <div style={{ background: "#3b0d0d", border: "1px solid #5c1a1a", borderRadius: 10, padding: 16, color: "#f87171", fontSize: 13 }}>
                {error}
              </div>
            )}

            {!result && !loading && !error && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, color: "#334155", gap: 12 }}>
                <div style={{ fontSize: 48 }}>💊</div>
                <div style={{ fontSize: 14, color: "#475569", textAlign: "center" }}>Enter patient details and click<br /><strong style={{ color: "#6366f1" }}>Calculate Dose</strong> to see results</div>
              </div>
            )}

            {result && (
              <>
                {/* Primary dose display */}
                <div style={{ background: "#0a1628", border: "1px solid #1e4d2b", borderRadius: 12, padding: 16, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: "#0d3b2a", border: "1.5px solid #2dd4a0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>💊</div>
                    <div>
                      <div style={{ fontSize: 11, color: "#2dd4a0", fontWeight: 600, marginBottom: 2 }}>Suggested Dose (Single Dose)</div>
                      <div style={{ fontSize: 34, fontWeight: 800, color: "#2dd4a0", lineHeight: 1 }}>{result.singleDose} {result.unit}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{result.route || route} dose</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#06b6d4", fontWeight: 600, marginBottom: 2 }}>Suggested Interval</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4" }}>⏱ {result.interval}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>For {indication}</div>
                  </div>
                </div>

                {/* Metrics grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                  {[
                    { label: "Max Daily Dose", value: `${result.maxDailyDose} mg/day`, sub: `${(result.maxDailyDose / weight).toFixed(0)} mg/kg/day`, icon: "🛡️", color: "#7c3aed" },
                    { label: "Dose Per Kg", value: `${typeof result.dosePerKg === "number" ? result.dosePerKg.toFixed(1) : result.dosePerKg} mg/kg`, sub: "Standard dosing", icon: "⚖️", color: "#0891b2" },
                    { label: "Safety Status", value: <StatusBadge status={result.safetyStatus} color={result.safetyColor} />, sub: "Based on provided details", icon: "✅", color: "#059669" },
                  ].map(m => (
                    <div key={m.label} style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 14 }}>{m.icon}</span>
                        <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{m.label}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: "#475569" }}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* AI Reasoning (if present) */}
                {result.aiReasoning && (
                  <div style={{ background: "#0f172a", border: "1px solid #312e81", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, marginBottom: 4 }}>🤖 AI Reasoning (Allometric Scaling)</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{result.aiReasoning}</div>
                  </div>
                )}

                {/* Warnings */}
                {(result.warnings?.length > 0 || result.note) && (
                  <div style={{ background: "#2a1800", border: "1px solid #92400e", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700, marginBottom: 8 }}>⚠ Important Safety Notes</div>
                    {result.warnings?.map((w, i) => (
                      <div key={i} style={{ fontSize: 12, color: "#d97706", marginBottom: 4, display: "flex", gap: 6 }}>
                        <span>•</span><span>{w.replace(/^⚠️\s*/, "")}</span>
                      </div>
                    ))}
                    {result.note && <div style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>• {result.note}</div>}
                    {!result.warnings?.length && !result.note && (
                      <div style={{ fontSize: 12, color: "#d97706" }}>• Do not exceed maximum daily dose from all sources combined.</div>
                    )}
                    <div style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>• Ensure adequate hydration and monitor for symptom progression.</div>
                    <div style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>• If symptoms persist &gt; 3 days or worsen, seek medical attention.</div>
                  </div>
                )}

                {/* References */}
                {result.references?.length > 0 && (
                  <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, marginBottom: 8 }}>📖 References Used</div>
                    {result.references.map((r, i) => <div key={i} style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>• {r}</div>)}
                  </div>
                )}
              </>
            )}

            {/* How it works */}
            <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 12 }}>🔄 How this works</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <FlowStep icon="📋" title="Patient Input" sub="Age, weight, height & details" />
                <span style={{ color: "#334155", fontSize: 16 }}>→</span>
                <FlowStep icon="⚖️" title="Guideline Check" sub="Evidence-based dosing" />
                <span style={{ color: "#334155", fontSize: 16 }}>→</span>
                <FlowStep icon="🤖" title="ML Extrapolation" sub="Allometric scaling" />
                <span style={{ color: "#334155", fontSize: 16 }}>→</span>
                <FlowStep icon="🛡️" title="Safety Checks" sub="Max dose & flags" />
                <span style={{ color: "#334155", fontSize: 16 }}>→</span>
                <FlowStep icon="✅" title="Recommendation" sub="Safe & clear output" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ background: "#0d1526", border: "1px solid #1e293b", borderRadius: 10, padding: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, marginBottom: 4 }}>Disclaimer</div>
            <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>This is an educational prototype and not a substitute for professional medical advice. Always consult a qualified healthcare professional before administering any medication.</div>
          </div>
        </div>
        <div style={{ background: "#0d1526", border: "1px solid #1e293b", borderRadius: 10, padding: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20 }}>🎓</span>
          <div>
            <div style={{ fontSize: 12, color: "#06b6d4", fontWeight: 700, marginBottom: 4 }}>Academic Research Project</div>
            <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>Smart Pediatric Dose Assistant: A Hybrid AI System to Address Pediatric Dosing Challenges. Combining rule-based guidelines with ML-based allometric scaling for safer pediatric dosing.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
