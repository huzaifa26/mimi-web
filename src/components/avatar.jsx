import { makeStyles } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import React, { useRef, useState } from 'react';
import Level from '../assets/logo/level.png';
import { useIntersection } from '../hooks/useIntersect';

const useStyles = makeStyles(theme => {
    return {};
});

export const Avatar = props => {
    const classes = useStyles();

    const imageRef = useRef();
    const [visible] = useIntersection(imageRef);

    const [loaded, setLoaded] = useState();

    const onLoad = () => {};

    return loaded ? <img {...props} ref={imageRef.current} /> : <Skeleton />;
};
