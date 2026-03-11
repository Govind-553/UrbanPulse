import React, { useState } from 'react';
import { Camera, MapPin, UploadCloud, CheckCircle, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CitizenReportPage() {
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    location: '',
    photo: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const issueTypes = [
    "Pothole",
    "Waterlogging",
    "Drainage Blockage",
    "Broken Streetlight",
    "Garbage Overflow"
  ];

  const handleGpsDetect = () => {
    setGpsLoading(true);
    // Mock GPS detection
    setTimeout(() => {
      setFormData({ ...formData, location: "M.G. Road, Bengaluru (Detected)" });
      setGpsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Auto-hide success message after 5 seconds to reset form
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ issueType: '', description: '', location: '', photo: null });
      }, 5000);
    }, 2000);
  };

  return (
    <div className="flex-grow pt-20 px-4 pb-12 w-full max-w-lg mx-auto md:max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Report a Civic Issue</h1>
        <p className="text-slate-600">Help us improve your city by reporting infrastructure problems.</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center shadow-sm"
          >
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Issue Reported!</h2>
            <p className="text-slate-600 mb-6">Your report has been successfully submitted to the municipal authorities. Tracking ID: <span className="font-semibold text-slate-800">#UP-2024-1089</span></p>
            <button 
              onClick={() => { setSubmitted(false); setFormData({ issueType: '', description: '', location: '', photo: null }); }}
              className="bg-green-600 text-white font-medium py-2.5 px-6 rounded-xl hover:bg-green-700 transition"
            >
              Report Another Issue
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white shadow-xl border border-slate-100 rounded-3xl p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Issue Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Issue Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {issueTypes.map(type => (
                    <div 
                      key={type}
                      onClick={() => setFormData({ ...formData, issueType: type })}
                      className={`cursor-pointer px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-center text-sm font-medium
                        ${formData.issueType === type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-600'}
                      `}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Location details</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm" 
                      placeholder="Enter street name or landmark"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleGpsDetect}
                    className="flex-shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium p-3 rounded-xl border border-slate-300 transition-colors shadow-sm flex items-center justify-center"
                    title="Auto-detect GPS"
                  >
                    {gpsLoading ? (
                       <svg className="animate-spin h-5 w-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                    ) : <Navigation className="w-5 h-5 text-blue-600" />}
                  </button>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Upload Photo (Proof)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {formData.photo && <p className="text-sm text-blue-600 font-medium mt-2">Selected: {formData.photo.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Short Description</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-xl p-3" 
                  placeholder="Provide additional details to help authorities locate and fix the issue." 
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.issueType}
                  className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white transition-colors
                    ${isSubmitting || !formData.issueType ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 bg-[linear-gradient(110deg,#2563eb,45%,#3b82f6,55%,#2563eb)] bg-[length:200%_100%] animate-shimmer'}
                  `}
                >
                  {isSubmitting ? 'Verifying & Submitting...' : 'Submit Complaint'}
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
