import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook to play audio notifications when new orders are received
 * @param {Array} orders - Current orders array
 * @returns {Object} - Audio control methods and state
 */
const useOrderNotification = (orders) => {
    const previousOrdersRef = useRef([]);
    const audioRef = useRef(null);
    const isPlayingRef = useRef(false);
    const [currentTable, setCurrentTable] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Cache for preloaded audio files
    const audioCache = useRef({});

    // Preload commonly used audio files (tables 1-10) for instant playback
    useEffect(() => {
        const tablesToPreload = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        tablesToPreload.forEach(tableNum => {
            const audio = new Audio(`/Audio/tabel ${tableNum}.mp3`);
            audio.preload = 'auto';
            audio.load();
            audioCache.current[tableNum] = audio;
        });

        return () => {
            // Cleanup preloaded audio
            Object.values(audioCache.current).forEach(audio => {
                audio.src = '';
            });
            audioCache.current = {};
        };
    }, []);

    /**
     * Play audio notification for a specific table number
     */
    const playTableAudio = useCallback((tableNumber) => {
        if (isPlayingRef.current) {
            console.log('⏸️ Audio already playing, skipping');
            return;
        }

        try {
            const tableNum = typeof tableNumber === 'string'
                ? tableNumber.replace(/\D/g, '')
                : tableNumber.toString();

            if (!tableNum) {
                console.error('❌ Invalid table number:', tableNumber);
                return;
            }

            console.log(`🔔 Playing notification for Table ${tableNum}`);

            let audio;

            if (audioCache.current[tableNum]) {
                console.log(`⚡ Using preloaded audio`);
                audio = audioCache.current[tableNum];
                audio.currentTime = 0;
            } else {
                console.log(`📥 Loading on-demand`);
                if (!audioRef.current) audioRef.current = new Audio();
                audio = audioRef.current;
                audio.src = `/Audio/tabel ${tableNum}.mp3`;
            }

            audio.volume = 0.8;
            isPlayingRef.current = true;
            setIsPlaying(true);
            setCurrentTable(tableNum);

            audio.play()
                .then(() => console.log('▶️ Audio started'))
                .catch((error) => {
                    console.error('❌ Play error:', error.message);
                    isPlayingRef.current = false;
                    setIsPlaying(false);
                    setCurrentTable(null);
                });

            audio.onended = () => {
                isPlayingRef.current = false;
                setIsPlaying(false);
                setCurrentTable(null);
                console.log('✅ Audio finished');
            };

        } catch (error) {
            console.error('❌ Audio error:', error);
            isPlayingRef.current = false;
            setIsPlaying(false);
            setCurrentTable(null);
        }
    }, []);

    useEffect(() => {
        console.log('📦 Orders updated, count:', orders.length);

        if (previousOrdersRef.current.length === 0 && orders.length > 0) {
            console.log('🚀 Initial orders loaded, skipping audio');
            previousOrdersRef.current = orders;
            return;
        }

        const previousOrderIds = new Set(previousOrdersRef.current.map(order => order._id));
        const newOrders = orders.filter(order => !previousOrderIds.has(order._id));

        if (newOrders.length > 0) {
            console.log(`🆕 ${newOrders.length} new order(s) detected!`);
            newOrders.forEach(order => {
                console.log(`📋 New order for table: ${order.tableNumber}`);
                playTableAudio(order.tableNumber);
            });
        } else {
            console.log('➖ No new orders');
        }

        previousOrdersRef.current = orders;
    }, [orders, playTableAudio]);

    const playManualNotification = useCallback((tableNumber) => {
        playTableAudio(tableNumber);
    }, [playTableAudio]);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            isPlayingRef.current = false;
            setIsPlaying(false);
            setCurrentTable(null);
        }
    }, []);

    return {
        playManualNotification,
        stopAudio,
        isPlaying,
        currentTable
    };
};

export default useOrderNotification;
