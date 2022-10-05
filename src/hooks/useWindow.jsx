import React, { useEffect, useState } from 'react';
import { Orentation } from '../utils/constants';

export function useWindowDims() {
    // Initialize state with undefined width/height so server and client renders match

    const [windowDims, setWindowDims] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: null,
    });

    const handleResize = () => {
        setWindowDims(prev => ({
            ...prev,
            width: window.innerWidth,
            height: window.innerHeight,
        }));
    };

    const hanldeOrientation = () => {
        let _orientation = null;

        if (window.matchMedia('(orientation: portrait)').matches) {
            _orientation = Orentation.POTRAIT;
        }

        if (window.matchMedia('(orientation: landscape)').matches) {
            _orientation = Orentation.LANDSCAPE;
        }

        setWindowDims(prev => ({
            ...prev,
            orientation: _orientation,
        }));
    };

    const handleChanges = () => {
        handleResize();
        hanldeOrientation();
    };

    useEffect(() => {
        window.addEventListener('resize', handleChanges);
        window.addEventListener('orientationchange', handleChanges);

        return () => {
            window.removeEventListener('orientationchange', handleChanges);
            window.addEventListener('orientationchange', handleChanges);
        };
    }, []);

    return windowDims;
}
