import React from 'react';
import { Bell, Volume2, VolumeX } from 'lucide-react';

/**
 * Debug panel for testing audio notifications
 */
const AudioDebugPanel = ({ playManualNotification, isPlaying, currentTable, stopAudio }) => {
    const testTables = [1, 2, 3, 4, 5, 10, 15, 20];

    const handleTest = (tableNum) => {
        console.log(`🎯 Debug panel: Testing table ${tableNum}`);
        playManualNotification(tableNum);
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl border-2 border-orange-500 p-6 max-w-md z-50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-orange-500" />
                    Audio Debug Panel
                </h3>
                {isPlaying && (
                    <button
                        onClick={stopAudio}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        title="Stop Audio"
                    >
                        <VolumeX className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isPlaying && currentTable && (
                <div className="mb-4 p-3 bg-orange-100 rounded-lg border border-orange-300">
                    <p className="text-orange-800 font-bold text-sm">
                        ▶️ Currently Playing: Table {currentTable}
                    </p>
                </div>
            )}

            <p className="text-sm text-gray-600 mb-3 font-medium">
                Click to test audio for different tables:
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
                {testTables.map(tableNum => (
                    <button
                        key={tableNum}
                        onClick={() => handleTest(tableNum)}
                        disabled={isPlaying}
                        className={`p-3 rounded-xl font-bold transition-all ${currentTable === tableNum.toString()
                                ? 'bg-orange-500 text-white shadow-lg'
                                : isPlaying
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200'
                            }`}
                    >
                        {tableNum}
                    </button>
                ))}
            </div>

            <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-medium">
                    💡 Check browser console (F12) for detailed logs
                </p>
            </div>
        </div>
    );
};

export default AudioDebugPanel;
