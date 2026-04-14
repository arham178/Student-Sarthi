import { useState } from "react";
import { toast } from "sonner";

const indianStatesUTs = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export default function BookmarkletTestPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("✅ Demo form submitted! In real forms, you would submit to the government portal.");
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Banner */}
      <div className="bg-blue-800 text-white text-center py-3 text-sm">
        🧪 Demo Form — Test your Student Sarthi bookmarklet here! Real forms work the same way.
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-bold text-center text-blue-900 mb-1">Scholarship Application Form — Demo</h1>
          <p className="text-center text-gray-500 text-xs mb-6">Government of India • National Scholarship Portal</p>

          {submitted ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-lg font-bold text-green-700 mb-2">Demo Form Submitted Successfully!</h2>
              <p className="text-sm text-gray-600">In real forms, this data would go to the government portal.</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 px-4 py-2 bg-blue-700 text-white rounded text-sm">Fill Again</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="full_name" className="block text-xs font-medium text-gray-700 mb-1">Full Name / Applicant Name *</label>
                  <input id="full_name" name="full_name" placeholder="Enter full name" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="father_name" className="block text-xs font-medium text-gray-700 mb-1">Father's Name *</label>
                  <input id="father_name" name="father_name" placeholder="Enter father's name" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="mother_name" className="block text-xs font-medium text-gray-700 mb-1">Mother's Name *</label>
                  <input id="mother_name" name="mother_name" placeholder="Enter mother's name" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="date_of_birth" className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input id="date_of_birth" name="date_of_birth" type="date" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
                  <select id="gender" name="gender" className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">Category / Caste *</label>
                  <select id="category" name="category" className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Select</option>
                    <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>EWS</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="annual_income" className="block text-xs font-medium text-gray-700 mb-1">Annual Family Income (₹) *</label>
                  <input id="annual_income" name="annual_income" type="number" placeholder="e.g. 200000" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="aadhaar_number" className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Number *</label>
                  <input id="aadhaar_number" name="aadhaar_number" placeholder="Enter 12-digit Aadhaar" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-xs font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input id="mobile" name="mobile" type="text" placeholder="Enter mobile number" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email ID *</label>
                  <input id="email" name="email" type="email" placeholder="Enter email" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">Full Address *</label>
                <textarea id="address" name="address" placeholder="Enter full address" rows={2} className="w-full border rounded px-3 py-2 text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                  <select id="state" name="state" className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Select State</option>
                    {indianStatesUTs.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="district" className="block text-xs font-medium text-gray-700 mb-1">District *</label>
                  <input id="district" name="district" placeholder="Enter district" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-xs font-medium text-gray-700 mb-1">Pincode *</label>
                  <input id="pincode" name="pincode" placeholder="Enter pincode" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="education_level" className="block text-xs font-medium text-gray-700 mb-1">Education Level *</label>
                  <select id="education_level" name="education_level" className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Select</option>
                    <option>10th</option><option>11th</option><option>12th</option><option>BA</option><option>BSc</option><option>BCom</option><option>ITI</option><option>Diploma</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="institution_name" className="block text-xs font-medium text-gray-700 mb-1">School / College / Institution Name *</label>
                  <input id="institution_name" name="institution_name" placeholder="Enter institution name" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="last_percentage" className="block text-xs font-medium text-gray-700 mb-1">Last Exam Percentage / Marks *</label>
                  <input id="last_percentage" name="last_percentage" type="number" placeholder="e.g. 78" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="bank_account_no" className="block text-xs font-medium text-gray-700 mb-1">Bank Account Number *</label>
                  <input id="bank_account_no" name="bank_account_no" placeholder="Enter account number" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="ifsc_code" className="block text-xs font-medium text-gray-700 mb-1">IFSC Code *</label>
                  <input id="ifsc_code" name="ifsc_code" placeholder="e.g. SBIN0001234" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="bank_name" className="block text-xs font-medium text-gray-700 mb-1">Bank Name *</label>
                  <input id="bank_name" name="bank_name" placeholder="Enter bank name" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="photo_upload" className="block text-xs font-medium text-gray-700 mb-1">Upload Photo</label>
                <input id="photo_upload" name="photo_upload" type="file" accept="image/*" className="w-full border rounded px-3 py-2 text-sm" />
              </div>

              <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded font-semibold hover:bg-blue-800 transition-colors">
                Submit Application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
