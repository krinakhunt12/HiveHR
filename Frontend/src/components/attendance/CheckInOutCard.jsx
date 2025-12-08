import React, { useState, useEffect } from "react";
import { Clock, MapPin, LogIn, LogOut } from "lucide-react";
import CheckInModal from "./CheckInModal";

const CheckInOutCard = ({ attendance, onCheckIn, onCheckOut }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isCheckedIn = attendance?.checkInTime && !attendance?.checkOutTime;
  const isCheckedOut = attendance?.checkInTime && attendance?.checkOutTime;

  const handleCheckInConfirm = (location) => {
    onCheckIn(location);
    setShowCheckInModal(false);
  };

  const handleCheckOutConfirm = (location) => {
    onCheckOut(location);
    setShowCheckOutModal(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Today's Attendance</h2>
            <p className="text-slate-600">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-slate-900">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-sm text-slate-600">
              {currentTime.toLocaleTimeString("en-US", {
                second: "2-digit",
              }).split(" ")[0].split(":")[2]} sec
            </div>
          </div>
        </div>

        {/* Status Display */}
        {attendance?.checkInTime && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <LogIn className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Check-in Time</p>
                  <p className="text-lg font-bold text-slate-900">{attendance.checkInTime}</p>
                </div>
              </div>
              {attendance.checkInLocation && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{attendance.checkInLocation}</span>
                </div>
              )}
            </div>

            {attendance.checkOutTime && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Check-out Time</p>
                    <p className="text-lg font-bold text-slate-900">{attendance.checkOutTime}</p>
                  </div>
                </div>
                {attendance.checkOutLocation && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{attendance.checkOutLocation}</span>
                  </div>
                )}
              </div>
            )}

            {attendance.totalHours && (
              <div className="pt-3 border-t border-slate-200">
                <p className="text-sm text-slate-600">Total Hours Worked</p>
                <p className="text-2xl font-bold text-slate-900">{attendance.totalHours}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!isCheckedIn && !isCheckedOut && (
            <button
              onClick={() => setShowCheckInModal(true)}
              className="flex-1 flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              Check In
            </button>
          )}

          {isCheckedIn && (
            <button
              onClick={() => setShowCheckOutModal(true)}
              className="flex-1 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              Check Out
            </button>
          )}

          {isCheckedOut && (
            <div className="flex-1 flex items-center justify-center gap-3 bg-slate-100 text-slate-600 px-6 py-4 rounded-lg font-semibold">
              <Clock className="w-5 h-5" />
              Attendance Completed
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onConfirm={handleCheckInConfirm}
        type="checkin"
      />
      <CheckInModal
        isOpen={showCheckOutModal}
        onClose={() => setShowCheckOutModal(false)}
        onConfirm={handleCheckOutConfirm}
        type="checkout"
      />
    </>
  );
};

export default CheckInOutCard;