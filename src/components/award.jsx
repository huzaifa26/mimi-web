import { alpha, Box, makeStyles, Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Badge } from './';
import clsx from 'clsx';

const useStyles = makeStyles(theme => {
    return {
        levelContainer: {
            fontWeight: 400,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 24,
            padding: '18px 14px',
            width: '100%',
        },
        index: {
            height: 40,
            width: 40,
            background: alpha(`#8F92A1`, 0.05),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
        },
        label: {
            fontWeight: 'bold',
            fontSize: 16,
            color: '#000',
        },
        selected: {
            background: alpha(`#0052CC`, 0.04),
            '& $index': {
                boxShadow: `rgba(0, 0, 0, 0.05) 0px 0px 0px 1px`,
            },
        },
        badgeContainer: {
            marginLeft: theme.direction === 'ltr' ? 'auto' : 0,
            marginRight: theme.direction === 'rtl' ? 'auto' : 0,
        },
    };
});

export const Award = ({ index, level, label, selected, ...otherProps }) => {
    const classes = useStyles();

    return (
        <div
            className={clsx({
                [classes.levelContainer]: true,
                [classes.selected]: selected,
            })}
            {...otherProps}
        >
            <Box marginRight={2}>
                <div className={classes.index}>{index}</div>
            </Box>
            <Typography className={classes.label}>
                <FormattedMessage id={label} />
            </Typography>

            <Box className={classes.badgeContainer}>
                <Badge value={level} />
            </Box>
        </div>
    );
};
