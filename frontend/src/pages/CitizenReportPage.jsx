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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Report a Civic Issue</h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">Help us improve your city by reporting infrastructure problems.</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 rounded-3xl p-6 sm:p-10 text-center shadow-lg animate-in fade-in zoom-in"
          >
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Report Submitted!</h2>
            <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">Your report has been received. Municipal authorities will review and assign a crew shortly.</p>
            <button 
              onClick={() => { setSubmitted(false); setFormData({ issueType: '', description: '', location: '', ward: '', latitude: null, longitude: null, photos: [] }); }}
              className="w-full sm:w-auto bg-green-600 text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-green-700 transition-all shadow-md active:scale-95"
            >
              File Another Report
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white shadow-2xl border border-slate-100 rounded-3xl p-5 sm:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              
              {/* Issue Type */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Incident Category
                  {aiDetectedType && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
                      🤖 AI Suggested: {aiDetectedType}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {issueTypes.map(type => (
                    <div 
                      key={type}
                      onClick={() => setFormData({ ...formData, issueType: type })}
                      className={`cursor-pointer px-4 py-3.5 rounded-2xl border-2 transition-all flex items-center justify-center text-sm font-bold
                        ${formData.issueType === type ? 'border-blue-600 bg-blue-100 text-blue-800 shadow-md' : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:border-slate-300'}
                      `}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {/* Ward Selection */}
                 <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select Ward</label>
                   <select
                     required
                     value={formData.ward}
                     onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                     className="block w-full px-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                   >
                     <option value="">Choose Ward...</option>
                     {Array.from({ length: 24 }, (_, i) => (
                       <option key={i + 1} value={`Ward ${i + 1}`}>Ward {i + 1}</option>
                     ))}
                   </select>
                 </div>

                 {/* GPS Dropdown fallback */}
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Auto-Locate</label>
                    <button 
                      type="button"
                      onClick={handleGpsDetect}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all text-sm font-bold"
                    >
                      {gpsLoading ? (
                         <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                      ) : <Navigation className="w-4 h-4 text-blue-600" />}
                      <span>{gpsLoading ? 'Locating...' : 'Use Precise GPS'}</span>
                    </button>
                 </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Visual Evidence (Required)</label>
                <div 
                  onClick={() => document.getElementById('file-upload').click()}
                  className="relative px-6 py-10 border-2 border-slate-200 border-dashed rounded-3xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all text-center group"
                >
                  <input id="file-upload" type="file" multiple className="sr-only" onChange={handlePhotoUpload} accept="image/*" />
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-300 group-hover:text-blue-500 transition-colors mb-4" />
                  <p className="text-sm font-bold text-slate-600">Click to upload or drag files</p>
                  <p className="text-xs text-slate-400 mt-1">High resolution JPG/PNG (Up to 2 images)</p>
                </div>
                {formData.photos && formData.photos.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {formData.photos.map((p, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5" /> {p.name}
                      </div>
                    ))}
                  </div>
                )}
                {isClassifying && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-600 animate-pulse bg-amber-50 p-2 rounded-lg border border-amber-100">
                     <Activity className="w-3.5 h-3.5" /> Initializing AI Computer Vision Analysis...
                  </div>
                )}
              </div>

              {/* Location Input */}
              <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Location Description</label>
                 <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-2xl bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none" 
                      placeholder="e.g. Near Star Cineplex, MG Road"
                    />
                 </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Report Details</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-4 border border-slate-200 rounded-2xl bg-slate-50 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none" 
                  placeholder="Tell us more about the issue (e.g. size of pothole, duration of outage...)" 
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !formData.issueType}
                  className="w-full flex justify-center items-center py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:shadow-blue-200 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Uploading Report...
                    </span>
                  ) : 'Confirm and Submit Report'}
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
