import React from "react";
import { User, Mail, Phone, MapPin, Briefcase, Hash } from "lucide-react";

const PersonalInfoCard = ({ data }) => {
  const infoItems = [
    { icon: <Hash className="w-4 h-4" />, label: "Employee ID", value: data.employeeId },
    { icon: <Briefcase className="w-4 h-4" />, label: "Department", value: data.department },
    { icon: <User className="w-4 h-4" />, label: "Position", value: data.position },
    { icon: <Mail className="w-4 h-4" />, label: "Email", value: data.email },
    { icon: <Phone className="w-4 h-4" />, label: "Phone", value: data.phone },
    { icon: <MapPin className="w-4 h-4" />, label: "Location", value: data.location },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {data.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{data.name}</h2>
          <p className="text-slate-600">{data.position}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{item.label}</p>
              <p className="text-sm text-slate-900 font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalInfoCard;
