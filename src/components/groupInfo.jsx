import { Box, makeStyles, Avatar, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { db } from '../utils/firebase';
import { getTypographyStyles } from '../utils/helpers';

const useStyles = makeStyles(theme => {
    return {
        ...getTypographyStyles(theme),
        image: {
            height: 60,
            width: 60,
        },
    };
});

export const GroupInfo = ({ group }) => {
    const classes = useStyles();


    
    const { state: storeState } = useStore();

    const { defaultAvatars, user } = storeState;

    const [image, setImage] = useState();

    useEffect(() => {
        (async () => {
            const _group = (await db.collection('Institution').doc(user._code).collection('groups').doc(group.id).get()).data();
            setImage(_group.image);
        })();
    }, []);

    return (
        <Box display={'flex'}>
            <Box mx={2}>
                <Avatar className={classes.image} src={image || defaultAvatars?.group} />
            </Box>

            <Box display={'flex'} flexDirection="column" justifyContent={'center'}>
                <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                    {group.name}
                </Typography>
            </Box>
        </Box>
    );
};
