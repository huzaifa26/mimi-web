import React from 'react';
import Loader_ from '../assets/logo/loader.png';

export const Loader = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                width: '100%',
            }}
        >
            <img src={Loader_} style={{ height: 100, width: 100 }} />
        </div>
    );
};
