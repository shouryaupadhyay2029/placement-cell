import React, { useState } from 'react';

/**
 * Smart Placement Analyst - React Component
 * Connects to /api/analyze to evaluate dynamic student eligibility.
 */
const EligibilityAnalyzer = () => {
  // 1. State for user inputs
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    cgpa: '',
    skills: ''
  });

  // 2. State for API response & UI rendering
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle generic input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 REQUIRED FIX: The working handleAnalyze function
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // console.log debugging as requested
    console.log("1. Starting Analysis...");
    console.log("2. Form Data Submitted:", formData);

    try {
      // Clean and format payload exactly as requested
      const payload = {
        cgpa: parseFloat(formData.cgpa),
        branch: formData.branch,
        skills: formData.skills.split(',').map(skill => skill.trim().toLowerCase())
      };

      console.log("3. Sending POST Payload to API:", payload);

      // Hit specific requested backend endpoint
      const response = await fetch("https://placepro-backend.onrender.com/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}` // Secure JWT if applicable
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      console.log("4. Received API Response:", data);

      // Extract array payload regardless of backend wrapping structure
      const resultsArray = Array.isArray(data) ? data : (data.results || data.data || []);
      
      // Store response exactly correctly in State
      setResults(resultsArray);
      console.log("5. State successfully updated with results!");

    } catch (err) {
      console.error("❌ Analysis Failed:", err.message);
      setError("Failed to fetch matchmaking data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eligibility-workspace flex gap-8">
      {/* COLUMN 1: USER PROFILE FORM */}
      <div className="user-input-section w-1/3">
        <h2>Your Profile</h2>
        
        <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
          <input 
            type="number" 
            step="0.01" 
            name="cgpa" 
            value={formData.cgpa} 
            onChange={handleChange} 
            required 
            placeholder="e.g. 8.5"
          />
          <input 
            name="branch" 
            value={formData.branch} 
            onChange={handleChange} 
            required 
            placeholder="e.g. CSE"
          />
          <input 
            name="skills" 
            value={formData.skills} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Java, Python, React"
          />

          {/* Bound to onSubmit properly */}
          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Eligibility"}
          </button>
        </form>
      </div>

      {/* COLUMN 2: DYNAMIC ELIGIBILITY RESULTS */}
      <div className="results-section w-2/3">
        <h3>Live Match Analysis</h3>
        
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        {/* Replaces static data mapping with dynamic .map() logic */}
        <div className="results-grid">
          {results.length > 0 ? results.map((company, index) => (
            <div key={company.id || index} className="match-item">
              <h4>{company.companyName}</h4>
              <span>{company.matchPercentage || 0}% Match</span>
              <p>{company.status === 'eligible' ? 'Ready to apply' : 'Growth needed'}</p>
            </div>
          )) : !loading && <span className="opacity-50">Provide your profile to see matches...</span>}
        </div>
      </div>
    </div>
  );
};

export default EligibilityAnalyzer;
