import React, { useState, useEffect } from "react";
import { X, MapPin, Loader } from "lucide-react";
import { useGeolocation } from "../../hooks/useGeolocation";

const CheckInModal = ({ isOpen, onClose, onConfirm, type }) => {
  const { location, error, isLoading, getLocation } = useGeolocation();
  const [manualLocation, setManualLocation] = useState("");

  useEffect(() => {
    if (isOpen) {
      getLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const locationData = location 
      ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
      : manualLocation || "Unknown";
    onConfirm(locationData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">
            Confirm {type === "checkin" ? "Check-in" : "Check-out"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-semibold text-slate-900">Location</p>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-600">
                <Loader className="w-4 h-4 animate-spin" />
                <p className="text-sm">Detecting location...</p>
              </div>
            )}

            {error && (
              <div className="space-y-3">
                <p className="text-sm text-red-600">{error}</p>
                <input
                  type="text"
                  placeholder="Enter location manually"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
                />
              </div>
            )}

            {location && !error && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Coordinates:</p>
                <p className="text-sm font-mono bg-white px-3 py-2 rounded border border-slate-200">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ This action will be recorded with timestamp and location data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              type === "checkin"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? "Please wait..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;