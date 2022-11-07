import { Box, makeStyles, Avatar, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { getTypographyStyles } from '../utils/helpers';
import { useIntl } from 'react-intl';
import { db } from '../utils/firebase';

const useStyles = makeStyles(theme => {
    return {
        ...getTypographyStyles(theme),
        image: {
            height: 60,
            width: 60,
        },
    };
});

export const KidInfo = ({ kid }) => {
    const classes = useStyles();
    const { state: storeState } = useStore('');

    const intl = useIntl();

    const { defaultAvatars, user } = storeState;

    const [image, setImage] = useState();

    useEffect(() => {
        (async () => {
            const _kid = (await db.collection('Institution').doc(user?._code).collection('kid').doc(kid.id).get()).data();
            setImage(_kid.image);
        })();
    }, []);

    return (
        <Box display={'flex'}>
            <Box marginRight={2}>
                <Avatar className={classes.image} src={image || defaultAvatars?.kid} />
            </Box>
            <Box display={'flex'} flexDirection="column" justifyContent={'center'}>
                <Typography className={clsx([classes.default_typography_paragraph, classes.default_typography_capitalize, classes.default_typography_bold])}>{kid.name}</Typography>
                <Typography className={clsx([classes.default_typography_label])}>{`${intl.formatMessage({
                    id: 'current_group',
                })}: ${kid.groupName}`}</Typography>
            </Box>
        </Box>
    );
};
