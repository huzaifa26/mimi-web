import { alpha, Box, makeStyles, Typography } from '@material-ui/core';
import { useIntl } from 'react-intl';

import LevelImage from '../assets/logo/level.png';
import PlayCircleFilledWhiteIcon from '@material-ui/icons/PlayCircleFilledWhite';
import clsx from 'clsx';
const useStyles = makeStyles(theme => {
    return {
        levelContainer: {
            cursor: 'pointer',
            fontSize: 14,
            color: '#8F92A1',
            fontWeight: 400,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 12,
            padding: 10,
            width: 200,
        },
        image: {
            transform: 'translateY(10%)',
            width: 40,
        },
        label: {
            fontWeight: 'bold',
            fontSize: 16,
            color: '#000',
        },
        selected: {
            background: '#F8F8F8',
        },
        icon: {
            color: alpha('#808191', 0.3),
            marginLeft: 'auto',
        },
    };
});

export const Level = ({ level, selected, ...otherProps }) => {
    const intl = useIntl();

    const classes = useStyles();

    return (
        <div
            className={clsx({
                [classes.levelContainer]: true,
                [classes.selected]: selected,
            })}
            {...otherProps}
        >
            <Box marginRight={1}>
                <img className={classes.image} src={LevelImage} />
            </Box>
            <Typography className={classes.label}>{`${intl.formatMessage({ id: 'level' })} ${level}`}</Typography>

            {selected && <PlayCircleFilledWhiteIcon className={classes.icon} />}
        </div>
    );
};
