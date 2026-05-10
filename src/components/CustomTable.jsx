import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, LayoutGrid, Type, Table as TableIcon, Trash, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

const CustomTable = ({ customTables, setCustomTables }) => {
  const [activeTableId, setActiveTableId] = useState(null);

  const handleCreateTable = () => {
    const newTable = {
      id: Date.now().toString(),
      name: 'Bảng mới ' + (customTables.length + 1),
      headers: ['Cột 1', 'Cột 2', 'Cột 3'],
      rows: [
        ['Dữ liệu 1', 'Dữ liệu 2', 'Dữ liệu 3'],
        ['Dữ liệu 4', 'Dữ liệu 5', 'Dữ liệu 6']
      ]
    };
    setCustomTables([...customTables, newTable]);
    setActiveTableId(newTable.id);
  };

  const deleteTable = (id) => {
    if (confirm('Xóa bảng này?')) {
      setCustomTables(customTables.filter(t => t.id !== id));
      if (activeTableId === id) setActiveTableId(null);
    }
  };

  const activeTable = customTables.find(t => t.id === activeTableId);

  const updateTable = (updated) => {
    setCustomTables(customTables.map(t => t.id === activeTableId ? updated : t));
  };

  const addColumn = () => {
    if (!activeTable) return;
    const updated = {
      ...activeTable,
      headers: [...activeTable.headers, 'Cột mới'],
      rows: activeTable.rows.map(row => [...row, ''])
    };
    updateTable(updated);
  };

  const addRow = () => {
    if (!activeTable) return;
    const updated = {
      ...activeTable,
      rows: [...activeTable.rows, new Array(activeTable.headers.length).fill('')]
    };
    updateTable(updated);
  };

  const removeRow = (index) => {
    const updated = {
      ...activeTable,
      rows: activeTable.rows.filter((_, i) => i !== index)
    };
    updateTable(updated);
  };

  const resetTable = () => {
    if (confirm('Reset dữ liệu bảng này?')) {
        const updated = {
            ...activeTable,
            headers: ['Tiêu đề 1'],
            rows: [['Dữ liệu 1']]
        };
        updateTable(updated);
    }
  };

  return (
    <div className="space-y-8">
      {/* Table List Header */}
      <div className="flex items-center justify-between">
         <div className="flex gap-4">
            {customTables.map(table => (
              <button
                key={table.id}
                onClick={() => setActiveTableId(table.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTableId === table.id 
                    ? "bg-ucl-neon text-ucl-dark shadow-[0_0_15px_rgba(0,242,255,0.4)]" 
                    : "bg-white/5 hover:bg-white/10"
                )}
              >
                {table.name}
              </button>
            ))}
         </div>
         <button onClick={handleCreateTable} className="ucl-button flex items-center gap-2">
           <Plus size={18} /> Tạo bảng mới
         </button>
      </div>

      {activeTable ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
             <div className="flex items-center gap-4">
               <input 
                 className="bg-transparent border-b border-white/20 focus:border-ucl-neon outline-none text-xl font-bold italic"
                 value={activeTable.name}
                 onChange={(e) => updateTable({...activeTable, name: e.target.value})}
               />
             </div>
             <div className="flex gap-2">
               <button onClick={addColumn} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs flex items-center gap-2">
                 <LayoutGrid size={14} /> Thêm cột
               </button>
               <button onClick={addRow} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs flex items-center gap-2">
                 <Plus size={14} /> Thêm hàng
               </button>
               <button onClick={resetTable} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs flex items-center gap-2 text-yellow-400">
                 <RotateCcw size={14} /> Reset
               </button>
               <button onClick={() => deleteTable(activeTable.id)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs flex items-center gap-2 text-red-500">
                 <Trash2 size={14} /> Xóa bảng
               </button>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ucl-blue/30">
                  {activeTable.headers.map((header, i) => (
                    <th key={i} className="px-6 py-4 border border-white/5">
                      <input 
                        className="bg-transparent border-none outline-none text-ucl-neon font-bold w-full uppercase tracking-widest text-xs"
                        value={header}
                        onChange={(e) => {
                          const newHeaders = [...activeTable.headers];
                          newHeaders[i] = e.target.value;
                          updateTable({...activeTable, headers: newHeaders});
                        }}
                      />
                    </th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {activeTable.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-3 border border-white/5">
                        <input 
                          className="bg-transparent border-none outline-none text-sm w-full"
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...activeTable.rows];
                            newRows[rowIndex][cellIndex] = e.target.value;
                            updateTable({...activeTable, rows: newRows});
                          }}
                        />
                      </td>
                    ))}
                    <td className="px-2 text-center">
                      <button onClick={() => removeRow(rowIndex)} className="text-white/20 hover:text-red-500 transition-colors">
                        <Trash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-40 glass-card">
           <TableIcon className="mx-auto text-ucl-blue opacity-20 mb-4" size={64} />
           <p className="text-ucl-silver italic">Chọn hoặc tạo một bảng thủ công để bắt đầu.</p>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
