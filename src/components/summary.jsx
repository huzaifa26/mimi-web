import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => {
    return {
        summaryContainer: {
            width: '100%',
            padding: 20,
            backgroundColor: '#fff',
            borderRadius: 16,
            display: 'flex',
            marginBottom: 10,
            maxWidth: 350,
            marginLeft: 'auto',
            marginRight: 'auto',
            width: 350,
            maxWidth: 350,
        },
        summaryBadge: {
            marginTop: 3,
            position: 'relative',
            background: `#00875A`,
            width: 25,
            height: 25,
            borderRadius: '50%',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: `rgba(17, 12, 46, 0.15) 0px 48px 100px 0px`,
            overflow: 'visible',
            '&::before': {
                zIndex: -1,
                position: 'absolute',
                borderRadius: '50%',
                content: '" "',
                width: 35,
                height: 35,
                background: `#00875A`,
                opacity: 0.5,
            },
            '& > .MuiTypography-root': {
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 12,
            },
        },
        summaryBodyContainer: {
            flex: 1,
            padding: `0 20px`,
        },
        summarybody: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        title: {
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 10,
            textTransform: 'capitalize',
        },
        summary: {
            textTransform: 'capitalize',
            color: `#808191`,
            fontSize: 12,
        },
    };
});

export const Summary = props => {
    const classes = useStyles();
    const { id, title, summary, figure, delimiter } = props;

    const summaryItems = (summary || '').split(delimiter || ', ');

    let _summary = summary;

    if (summaryItems.length >= 10) {
        _summary = `${summaryItems.slice(0, 11).join(', ')} and ${summaryItems.length - 10} more`;
    }

    return (
        <div className={classes.summaryContainer}>
            <div>
                <div className={classes.summaryBadge}>
                    <Typography>{id}</Typography>
                </div>
            </div>
            <div className={classes.summaryBodyContainer}>
                <div>
                    <Typography className={classes.title}>{title}</Typography>
                </div>
                <div className={classes.summarybody}>
                    {_summary && (
                        <Typography
                            style={{
                                marginRight: 40,
                            }}
                            className={classes.summary}
                        >
                            {_summary}
                        </Typography>
                    )}
                    {figure != 'undefined' && <Typography className={classes.summary}>{figure}</Typography>}
                </div>
            </div>
        </div>
    );
};
