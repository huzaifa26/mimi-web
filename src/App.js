import React, { useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes } from './routes';
import { StoreProvidor, UiProvidor } from './store';
import { useWindowDims } from './hooks/useWindow';

export const App = () => {
    const { width, height } = useWindowDims();

    const content = useMemo(() => {
        return (
            <StoreProvidor>
                <Routes />
            </StoreProvidor>
        );
    }, []);

    return (
        <Router>
            <div
                className="mimi-app"
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                }}
            >
                {content}
            </div>
        </Router>
    );
};
