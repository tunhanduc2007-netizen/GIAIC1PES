import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Edit, Save, X } from 'lucide-react';
import { cn, getTeamLogo } from '../lib/utils';

const GroupStage = ({ players }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [groupData, setGroupData] = useState({});

  // Chia đội thành 12 bảng (A-L), mỗi bảng 4 đội
  const groups = {
    'A': ['Iran', 'Ai Cập', 'Bỉ', 'Saudi Arabia'],
    'B': ['Jordan', 'Iraq', 'Tây Ban Nha', 'Pháp'],
    'C': ['Thổ Nhĩ Kỳ', 'Hà Lan', 'Brazil', 'Argentina'],
    'D': ['Croatia', 'Colombia', 'Senegal', 'Thụy Sĩ'],
    'E': ['Uruguay', 'Haiti', 'Qatar', 'Bồ Đào Nha'],
    'F': ['Uzbekistan', 'New Zealand', 'Algeria', 'Hàn Quốc'],
    'G': ['Bosnia & Herzegovina', 'Paraguay', 'Áo', 'Scotland'],
    'H': ['Tunisia', 'Na Uy', 'DR Congo', 'Australia'],
    'I': ['Curaçao', 'Cape Verde', 'Canada', 'Đức'],
    'J': ['Mexico', 'CH Séc', 'Ecuador', 'Maroc'],
    'K': ['Nhật Bản', 'Ghana', 'Nam Phi', 'Thụy Điển'],
    'L': ['Anh', 'Mỹ', 'Bờ Biển Ngà', 'Panama'],
  };

  const handleCellEdit = (group, team, field, value) => {
    const key = `${group}-${team}-${field}`;
    setGroupData(prev => ({ ...prev, [key]: value }));
  };

  const getCellValue = (group, team, field) => {
    const key = `${group}-${team}-${field}`;
    return groupData[key] || '';
  };

  const GroupTable = ({ groupName, teams }) => (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-center gap-2 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-ucl-blue/20 border border-ucl-blue/40 flex items-center justify-center">
          <span className="text-ucl-blue font-black text-sm">{groupName}</span>
        </div>
        <h3 className="text-lg font-black uppercase text-white">Bảng {groupName}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-2 text-ucl-silver font-bold uppercase text-[10px]">Đội</th>
              <th className="text-center py-2 px-2 text-ucl-silver font-bold uppercase text-[10px] w-16">Đội 1</th>
              <th className="text-center py-2 px-2 text-ucl-silver font-bold uppercase text-[10px] w-16">Đội 2</th>
              <th className="text-center py-2 px-2 text-ucl-silver font-bold uppercase text-[10px] w-16">Tỉ số</th>
              <th className="text-left py-2 px-2 text-ucl-silver font-bold uppercase text-[10px]">Ghi bàn</th>
              <th className="text-left py-2 px-2 text-ucl-silver font-bold uppercase text-[10px]">Thẻ phạt</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <img src={getTeamLogo(team)} alt={team} className="w-5 h-5 object-contain" />
                    <span className="font-bold text-white text-[11px]">{team}</span>
                  </div>
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={getCellValue(groupName, team, 'team1')}
                    onChange={(e) => handleCellEdit(groupName, team, 'team1', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-white text-[11px] focus:border-ucl-neon outline-none"
                    placeholder="-"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={getCellValue(groupName, team, 'team2')}
                    onChange={(e) => handleCellEdit(groupName, team, 'team2', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-white text-[11px] focus:border-ucl-neon outline-none"
                    placeholder="-"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={getCellValue(groupName, team, 'score')}
                    onChange={(e) => handleCellEdit(groupName, team, 'score', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-white text-[11px] focus:border-ucl-neon outline-none"
                    placeholder="0-0"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={getCellValue(groupName, team, 'scorers')}
                    onChange={(e) => handleCellEdit(groupName, team, 'scorers', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-[11px] focus:border-ucl-neon outline-none"
                    placeholder="Tên cầu thủ..."
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={getCellValue(groupName, team, 'cards')}
                    onChange={(e) => handleCellEdit(groupName, team, 'cards', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-[11px] focus:border-ucl-neon outline-none"
                    placeholder="Thẻ..."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 mt-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-ucl-blue/20 border border-ucl-blue/40 flex items-center justify-center">
          <Users className="text-ucl-blue" size={28} />
        </div>
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            VÒNG <span className="text-ucl-blue">BẢNG</span>
          </h2>
          <p className="text-ucl-silver text-xs font-bold uppercase tracking-[0.2em] mt-1">
            12 bảng đấu - 48 đội tham dự
          </p>
        </div>
      </div>

      {/* Groups Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groups).map(([groupName, teams]) => (
          <GroupTable key={groupName} groupName={groupName} teams={teams} />
        ))}
      </div>
    </div>
  );
};

export default GroupStage;
