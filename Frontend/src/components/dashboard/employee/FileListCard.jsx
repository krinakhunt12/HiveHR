import React from "react";
import { FileText, Download } from "lucide-react";

const FileListCard = ({ files }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <FileText className="w-5 h-5 text-slate-700" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">My Documents</h3>
      </div>
      <div className="space-y-2">
        {files.map((file, index) => (
          <button
            key={index}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded border border-slate-200">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-900 text-sm">{file.name}</p>
                <p className="text-xs text-slate-500">{file.size} • {file.date}</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default FileListCard;