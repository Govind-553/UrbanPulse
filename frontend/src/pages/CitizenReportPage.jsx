import React, { useState } from 'react';
import { Camera, MapPin, UploadCloud, CheckCircle, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import exifr from 'exifr';
import { reportService } from '../services/api';

export default function CitizenReportPage() {
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    location: '',
    ward: '',
    latitude: null,
    longitude: null,
    photos: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiDetectedType, setAiDetectedType] = useState('');

  const issueTypes = [
    "Pothole",
    "Waterlogging",
    "Drainage Blockage",
    "Broken Streetlight",
    "Garbage Overflow"
  ];

  const handleGpsDetect = async () => {
    setGpsLoading(true);
    let coords = null;

    try {
      // 1. Try to get EXIF data first if photos exist
      if (formData.photos && formData.photos.length > 0) {
        // Try the first photo for GPS data
        const gpsData = await exifr.gps(formData.photos[0]);
        if (gpsData && gpsData.latitude && gpsData.longitude) {
          coords = { latitude: gpsData.latitude, longitude: gpsData.longitude };
        }
      }
    } catch (err) {
      console.log("No EXIF data or error extracting:", err);
    }

    // 2. Fallback to browser geolocation if no EXIF
    if (!coords) {
      try {
        coords = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
             reject(new Error("Geolocation is not supported by your browser"));
          } else {
             navigator.geolocation.getCurrentPosition(
               (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
               (error) => reject(error),
               { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
             );
          }
        });
      } catch (err) {
        console.error("Browser geolocation error:", err);
        alert("Could not detect location from image or browser. Please ensure location services are enabled.");
        setGpsLoading(false);
        return;
      }
    }

    // 3. Reverse geocoding using Nominatim
    if (coords) {
      const { latitude, longitude } = coords;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data && data.display_name) {
          setFormData(prev => ({ ...prev, location: data.display_name, latitude, longitude }));
        } else {
          setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, latitude, longitude }));
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
        setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, latitude, longitude }));
      }
    }
    
    setGpsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const categoryMap = {
        'Pothole': 'pothole',
        'Waterlogging': 'waterlogging',
        'Drainage Blockage': 'drainage',
        'Broken Streetlight': 'streetlight',
        'Garbage Overflow': 'garbage'
      };

      const submitData = new FormData();
      submitData.append('title', `${formData.issueType} Reported`);
      submitData.append('description', formData.description);
      submitData.append('category', categoryMap[formData.issueType] || 'other');
      submitData.append('ward', formData.ward || 'Ward 1'); // use selected ward
      submitData.append('location', formData.location);
      
      // We must provide generic fallback coords if the user didn't use EXIF
      const finalLat = formData.latitude || 19.0760;
      const finalLng = formData.longitude || 72.8777;
      submitData.append('latitude', finalLat);
      submitData.append('longitude', finalLng);

      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach(photo => {
          submitData.append('images', photo);
        });
      }

      await reportService.submitReport(submitData);
      
      setIsSubmitting(false);
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ issueType: '', description: '', location: '', ward: '', latitude: null, longitude: null, photos: [] });
      }, 5000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert("Error submitting the issue. Please ensure you are logged in.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    
    // Only keep up to 2 photos
    const selectedFiles = files.slice(0, 2);

    setFormData(prev => ({ ...prev, photos: selectedFiles }));
    setAiDetectedType('');
    setIsClassifying(true);

    try {
      const aiFormData = new FormData();
      aiFormData.append("file", selectedFiles[0]); // Send first image for AI classification

      const response = await fetch("http://localhost:8000/ai/classify", {
        method: "POST",
        body: aiFormData
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle HuggingFace "model is loading" error gracefully
        if (data && data.error) {
          console.warn("AI service note:", data.error);
        } else if (data && Array.isArray(data) && data.length > 0) {
          // Use top-3 labels for more accurate matching
          const labelsText = data.slice(0, 3).map(d => d.label?.toLowerCase() || '').join(' ');
          
          let detectedType = '';
          if (labelsText.includes('pothole') || labelsText.includes('road') || labelsText.includes('crack') || labelsText.includes('hole') || labelsText.includes('asphalt')) {
            detectedType = 'Pothole';
            // Trigger Roboflow pothole detection silently in the background
            fetch("http://localhost:8000/ai/detect-pothole", {
              method: "POST",
              body: aiFormData
            }).then(res => res.json())
              .then(rfData => console.log("🤖 Roboflow Detection Result:", rfData))
              .catch(err => console.warn("Roboflow background detection:", err));
          } else if (labelsText.includes('water') || labelsText.includes('flood') || labelsText.includes('rain') || labelsText.includes('puddle')) {
            detectedType = 'Waterlogging';
          } else if (labelsText.includes('drain') || labelsText.includes('sewer') || labelsText.includes('clog') || labelsText.includes('pipe')) {
            detectedType = 'Drainage Blockage';
          } else if (labelsText.includes('light') || labelsText.includes('lamp') || labelsText.includes('street') || labelsText.includes('bulb')) {
            detectedType = 'Broken Streetlight';
          } else if (labelsText.includes('garbage') || labelsText.includes('trash') || labelsText.includes('waste') || labelsText.includes('rubbish') || labelsText.includes('litter')) {
            detectedType = 'Garbage Overflow';
          }
          
          if (detectedType) {
            setFormData(prev => ({ ...prev, issueType: detectedType }));
            setAiDetectedType(detectedType);
          }
        }
      }
    } catch (error) {
      console.error("AI Classification failed", error);
    } finally {
      setIsClassifying(false);
    }
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
              onClick={() => { setSubmitted(false); setFormData({ issueType: '', description: '', location: '', latitude: null, longitude: null, photos: [] }); }}
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
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Issue Type
                  {aiDetectedType && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                      🤖 AI Detected: {aiDetectedType}
                    </span>
                  )}
                </label>
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

              {/* Ward Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Select Your Ward</label>
                <select
                  required
                  value={formData.ward}
                  onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                  className="block w-full px-4 py-3 border border-slate-300 rounded-xl leading-5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                >
                  <option value="">-- Select Ward --</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i + 1} value={`Ward ${i + 1}`}>Ward {i + 1}</option>
                  ))}
                </select>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Upload Photos (Max 2)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload files</span>
                        <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handlePhotoUpload} accept="image/*" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG up to 10MB (max 2 images)</p>
                  </div>
                </div>
                {formData.photos && formData.photos.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1">
                    {formData.photos.map((p, idx) => (
                      <p key={idx} className="text-sm text-blue-600 font-medium">Selected: {p.name}</p>
                    ))}
                  </div>
                )}
                {isClassifying && <p className="text-sm text-amber-600 font-medium mt-1 animate-pulse">Analyzing first image with AI...</p>}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Short Description</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
