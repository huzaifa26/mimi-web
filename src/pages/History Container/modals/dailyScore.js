import React, { Fragment, useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { db } from '../../../utils/firebase';
import { Loader, KidInfo, Date } from '../../../components';
import moment from 'moment';
import { Divider, Typography, makeStyles, Box, Grid, alpha } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import ProgressBar from '@ramonak/react-progress-bar';
import ScrollArea from 'react-scrollbar';

import { getTypographyStyles, getHistoryStyles } from '../../../utils/helpers';
import Star from '../../../assets/icons/starIcon.png';
import clsx from 'clsx';

export const DailyScoreBody = props => {
    const { data } = props;
    const { time, payload, executer } = data;
    const { report: reportId, kid } = payload;

    const classes = useStyles();

    const { state: storeState } = useStore();
    const { user } = storeState;

    const [state, setState] = useState();

    useEffect(() => {
        if (!data) return;

        (async () => {
            let subject_ = [];
            let bonus = [];
            const report = await db.collection('Institution').doc(user?._code).collection('reports').doc(reportId).get();

            const subjects = await db.collection('Institution').doc(user?._code).collection('reports').doc(reportId).collection('subjects').get();

            const transformedSubjects = await Promise.all(
                subjects.docs.map(async e => {
                    const subject = e.data();

                    let subSubjects = [];

                    if (subject.hasSubSubject == true) {
                        subSubjects = (
                            await db
                                .collection('Institution')
                                .doc(user?._code)
                                .collection('reports')
                                .doc(reportId)
                                .collection('subjects')
                                .doc(subject.id)
                                .collection('subSubjects')
                                .get()
                        ).docs
                            .map(el => el.data())
                            .map(subSubject => {
                                return {
                                    ...subSubject,
                                    points: ((Number(subSubject.obtainedPoints) / Number(subSubject.totalPoints)) * Number(100)).toFixed(0),
                                };
                            });
                    }

                    return {
                        ...subject,
                        points: ((Number(subject.obtainedPoints) / Number(subject.totalPoints)) * Number(100)).toFixed(0),
                        subSubjects,
                    };
                }),
            );

            if (report?.data()?.bonus_given == true) {
                bonus.push(report?.data().bonus);
            }

            setState({
                bonus,
                subjects: transformedSubjects,
                totalScore: report?.data()?.reportTotalPoints,
                obtainedPoints: report?.data()?.reportObtainedPoints,
            });
        })();
    }, [data]);

    console.log({
        state,
    });

    return (
        <Fragment>
            <Box padding={2} className={classes.default_history_headerContainer}>
                <KidInfo kid={kid} />
                <Date date={time} />
            </Box>

            <Box marginBottom={2}>
                <Divider />
            </Box>

            {!state ? (
                <Loader />
            ) : (
                <Fragment>
                    <ScrollArea smoothScrolling>
                        {state.subjects.map(e => {
                            return (
                                <Box
                                    paddingX={3}
                                    paddingY={1}
                                    marginBottom={1}
                                    className={{
                                        [classes.children]: !!e.subSubjects.length,
                                    }}
                                >
                                    <Box marginBottom={1}>
                                        <Box display={'flex'} justifyContent="space-between" marginBottom={0.5}>
                                            <Typography
                                                className={clsx(classes.default_typography_paragraph, classes.default_typography_bold, classes.default_typography_capitalize)}
                                            >
                                                {e.name}
                                            </Typography>
                                            <Typography
                                                className={clsx(classes.default_typography_paragraph, classes.default_typography_bold, classes.default_typography_capitalize)}
                                            >
                                                {e.totalPoints}
                                            </Typography>
                                        </Box>
                                        <ProgressBar
                                            completed={Number(e.obtainedPoints).toString()}
                                            maxCompleted={e.totalPoints}
                                            bgColor="#685BE7"
                                            height="20px"
                                            transitionDuration="1s"
                                        />
                                    </Box>

                                    {/* ----------------------- */}

                                    <Box paddingLeft={12}>
                                        {e.subSubjects.map(el => {
                                            return (
                                                <Box marginBottom={1}>
                                                    <Box display={'flex'} justifyContent="space-between" marginBottom={0.5}>
                                                        <Typography
                                                            className={clsx(
                                                                classes.default_typography_paragraph,
                                                                classes.default_typography_bold,
                                                                classes.default_typography_capitalize,
                                                            )}
                                                        >
                                                            {el.name}
                                                        </Typography>
                                                        <Typography
                                                            className={clsx(
                                                                classes.default_typography_paragraph,
                                                                classes.default_typography_bold,
                                                                classes.default_typography_capitalize,
                                                            )}
                                                        >
                                                            {el.totalPoints}
                                                        </Typography>
                                                    </Box>
                                                    <ProgressBar completed={Number(e.obtainedPoints).toString()} maxCompleted={e.totalPoints} bgColor="#685BE7" height="20px" />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            );
                        })}
                        {state.bonus?.map(e => {
                            return (
                                <Box marginBottom={1} paddingX={3} paddingY={1}>
                                    <Box display={'flex'} justifyContent="space-between" marginBottom={0.5}>
                                        <Box display={'flex'}>
                                            <Typography
                                                className={clsx(classes.default_typography_paragraph, classes.default_typography_bold, classes.default_typography_capitalize)}
                                            >
                                                {e.description}
                                            </Typography>
                                            <img src={Star} className={classes.img} />
                                        </Box>

                                        <Typography className={clsx(classes.default_typography_paragraph, classes.default_typography_bold, classes.default_typography_capitalize)}>
                                            {e.totalPoints}
                                        </Typography>
                                    </Box>

                                    <ProgressBar
                                        completed={Number(e.obtainedPoints).toString()}
                                        maxCompleted={e.totalPoints}
                                        bgColor="#685BE7"
                                        height="20px"
                                        transitionDuration="1s"
                                    />
                                </Box>
                            );
                        })}
                    </ScrollArea>

                    <Box marginY={2}>
                        <Divider />
                    </Box>

                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <Typography
                                className={clsx(
                                    classes.default_typography_label,
                                    classes.default_typography_colorLight,
                                    classes.default_typography_bold,
                                    classes.default_typography_uppercase,
                                )}
                            >
                                <FormattedMessage id="score_given_by" />
                            </Typography>
                            <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                                {executer}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography
                                className={clsx(
                                    classes.default_typography_label,
                                    classes.default_typography_colorLight,
                                    classes.default_typography_bold,
                                    classes.default_typography_uppercase,
                                )}
                            >
                                <FormattedMessage id="total_score" />
                            </Typography>
                            <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                                {state.totalScore}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography
                                className={clsx(
                                    classes.default_typography_label,
                                    classes.default_typography_colorLight,
                                    classes.default_typography_bold,
                                    classes.default_typography_uppercase,
                                )}
                            >
                                <FormattedMessage id="OBTAINED_SCORE" />
                            </Typography>
                            <Typography className={clsx(classes.default_typography_subHeading, classes.default_typography_bold, classes.default_typography_capitalize)}>
                                {state.obtainedPoints}
                            </Typography>
                        </Grid>
                    </Grid>
                </Fragment>
            )}
        </Fragment>
    );
};

const useStyles = makeStyles(theme => ({
    ...getTypographyStyles(theme),
    ...getHistoryStyles(theme),
    children: {
        background: alpha('#C4C4C4', 0.2),
        borderRadius: 16,
    },
}));
