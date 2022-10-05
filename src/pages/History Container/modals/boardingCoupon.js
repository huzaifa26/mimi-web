import clsx from 'clsx';
import React, { Fragment } from 'react';
import { Typography, makeStyles, Grid, Box, Divider } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Date } from '../../../components';
import { getHistoryStyles, getTypographyStyles } from '../../../utils/helpers';
import ScrollArea from 'react-scrollbar';
import { useStore } from '../../../store';

export const BoardingCouponBody = props => {
    const { data } = props;
    const { state: storeState } = useStore();
    const { institute } = storeState;

    const { time, payload, executer } = data;
    const { groups, kids, coupons } = payload;

    const classes = useStyles();

    return (
        <Fragment>
            <Box padding={2} className={classes.default_history_headerContainer}>
                <div>
                    <Typography className={clsx([classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize])}>
                        {institute?.name}
                    </Typography>

                    <Box display={'flex'}>
                        <Box marginRight={1} className={clsx(classes.default_typography_paragraph, classes.default_typography_colorLight, classes.default_typography_uppercase)}>
                            <FormattedMessage id={'executed_by'} />
                        </Box>
                        <Box className={clsx(classes.default_typography_paragraph, classes.default_typography_bold, classes.default_typography_capitalize)}>{executer}</Box>
                    </Box>
                </div>

                <Date date={time} />
            </Box>

            <Box marginBottom={2}>
                <Divider />
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Box marginBottom={1}>
                        <Typography className={clsx([classes.default_typography_paragraph, classes.default_typography_bold, classes.default_typography_capitalize])}>
                            <FormattedMessage id={'groups'} />
                        </Typography>
                    </Box>
                    <div className={classes.default_history_scrollContainer}>
                        <ScrollArea smoothScrolling>
                            {groups.map(el => (
                                <Box
                                    marginBottom={1}
                                    className={clsx([
                                        classes.default_history_scrollItem,
                                        classes.default_typography_bold,
                                        classes.default_typography_capitalize,
                                        classes.default_typography_paragraph,
                                    ])}
                                >
                                    {el.name}
                                </Box>
                            ))}
                        </ScrollArea>
                    </div>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box marginBottom={1}>
                        <Typography className={clsx([classes.default_typography_paragraph, classes.default_typography_bold, classes.default_typography_capitalize])}>
                            <FormattedMessage id={'kids'} />
                        </Typography>
                    </Box>

                    <div className={classes.default_history_scrollContainer}>
                        <ScrollArea smoothScrolling>
                            {kids.map(el => (
                                <Box
                                    marginBottom={1}
                                    className={clsx([
                                        classes.default_history_scrollItem,
                                        classes.default_typography_bold,
                                        classes.default_typography_capitalize,
                                        classes.default_typography_paragraph,
                                    ])}
                                >
                                    {el.name}
                                </Box>
                            ))}
                        </ScrollArea>
                    </div>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box marginBottom={1}>
                        <Typography className={clsx([classes.default_typography_paragraph, classes.default_typography_bold, classes.default_typography_capitalize])}>
                            <FormattedMessage id={'coupons'} />
                        </Typography>
                    </Box>

                    <div className={classes.default_history_scrollContainer}>
                        <ScrollArea smoothScrolling>
                            {coupons.map(el => (
                                <Box
                                    marginBottom={1}
                                    className={clsx([
                                        classes.default_history_scrollItem,
                                        classes.default_typography_bold,
                                        classes.default_typography_capitalize,
                                        classes.default_typography_paragraph,
                                    ])}
                                >
                                    {el.name}
                                </Box>
                            ))}
                        </ScrollArea>
                    </div>
                </Grid>
            </Grid>
        </Fragment>
    );
};

const useStyles = makeStyles(theme => ({
    ...getTypographyStyles(theme),
    ...getHistoryStyles(theme),
}));
