import clsx from 'clsx';
import React, { Fragment } from 'react';
import { Typography, makeStyles, Grid, Box, Divider } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Date, GroupInfo } from '../../../components';
import { getHistoryStyles, getTypographyStyles } from '../../../utils/helpers';
import ScrollArea from 'react-scrollbar';

export const GroupGrantCouponBody = props => {
    const { data } = props;

    const { time, payload, executer } = data;
    const { group, coupons } = payload;

    const classes = useStyles();

    return (
        <Fragment>
            <Box padding={2} className={classes.default_history_headerContainer}>
                <GroupInfo group={group} />
                <Date date={time} />
            </Box>

            <Box marginBottom={2}>
                <Divider />
            </Box>

            <Box paddingX={2} paddingY={4}>
                <Grid container>
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
                        <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={'100%'}>
                            <div>
                                <Typography
                                    className={clsx(
                                        classes.default_typography_label,
                                        classes.default_typography_colorLight,
                                        classes.default_typography_bold,
                                        classes.default_typography_uppercase,
                                    )}
                                >
                                    <FormattedMessage id="executed_by" />
                                </Typography>
                                <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                                    {executer}
                                </Typography>
                            </div>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Fragment>
    );
};

const useStyles = makeStyles(theme => ({
    ...getTypographyStyles(theme),
    ...getHistoryStyles(theme),
}));
