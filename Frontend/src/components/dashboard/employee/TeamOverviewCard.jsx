import React from "react";
import { Users, Circle } from "lucide-react";

const TeamOverviewCard = ({ team }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-slate-800" />
                <h3 className="text-lg font-bold text-slate-900">Your Team</h3>
            </div>
            <div className="space-y-4">
                {team.map((member, index) => (
                    <div key={index} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                                {member.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{member.name}</p>
                                <p className="text-xs text-slate-500">{member.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Circle className={`w-2 h-2 fill-current ${member.status === 'online' ? 'text-green-500' :
                                    member.status === 'away' ? 'text-amber-500' : 'text-slate-300'
                                }`} />
                            <span className="text-[10px] font-medium text-slate-400 capitalize">{member.status}</span>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all">
                View Entire Team
            </button>
        </div>
    );
};

export default TeamOverviewCard;
