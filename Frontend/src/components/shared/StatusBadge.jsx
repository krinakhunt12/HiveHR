import React from "react";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

const StatusBadge = ({ status, label }) => {
  const configs = {
    present: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: <CheckCircle className="w-4 h-4" />,
      label: label || "Present",
    },
    late: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: <AlertCircle className="w-4 h-4" />,
      label: label || "Late",
    },
    absent: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <XCircle className="w-4 h-4" />,
      label: label || "Absent",
    },
  };

  const config = configs[status] || configs.absent;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
