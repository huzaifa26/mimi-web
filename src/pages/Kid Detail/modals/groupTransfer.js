import { Grid, makeStyles,  Avatar, Typography, Box } from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, MenuSingle, Field } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { FirebaseHelpers, getModalStyles, getTypographyStyles } from '../../../utils/helpers';
import firebase from 'firebase/app';
import clsx from 'clsx';

export const GroupTranferBody = props => {
    const { handleClose, kid } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user, defaultAvatars } = storeState;

    const [group, setGroup] = useState();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setGroups(
                (
                    await FirebaseHelpers.fetchGroups.execute({
                        user,
                    })
                ).filter(el => el.id != kid.groupId),
            );
        })();
    }, []);

    const handleSubmit = async () => {
        try {
            if (!group) throw new Error('please select a group');

            setLoading(true);

            const previousGroup = await db.collection('Institution').doc(user?._code).collection('groups').doc(kid.groupId).get();
            previousGroup.data().staffId.map(async e => {
                await db
                    .collection('Institution')
                    .doc(user?._code)
                    .collection('staff')
                    .doc(e)
                    .update({
                        kids_access: firebase.firestore.FieldValue.arrayRemove(kid.id),
                    });
            });
            await db
                .collection('Institution')
                .doc(user?._code)
                .collection('groups')
                .doc(kid.groupId)
                .update({
                    kids_ids: firebase.firestore.FieldValue.arrayRemove(kid.id),
                });
            await db.collection('Institution').doc(user?._code).collection('kid').doc(kid.id).update({
                groupName: group.name,
                groupId: group.id,
            });

            const newGroup = await db.collection('Institution').doc(user?._code).collection('groups').doc(group.id).get();
            newGroup.data().staffId.map(async e => {
                await db
                    .collection('Institution')
                    .doc(user?._code)
                    .collection('staff')
                    .doc(e)
                    .update({
                        kids_access: firebase.firestore.FieldValue.arrayUnion(kid.id),
                    });
            });
            await db
                .collection('Institution')
                .doc(user?._code)
                .collection('groups')
                .doc(group.id)
                .update({
                    kids_ids: firebase.firestore.FieldValue.arrayUnion(kid.id),
                });

            const previousTemplates = await db.collection('Institution').doc(user?._code).collection('groups').doc(kid.groupId).collection('report_templates').get();
            previousTemplates.docs.map(async e => {
                const subjectId = e.data().id;
                await db.collection('Institution').doc(user?._code).collection('kid').doc(kid.id).collection('achievements').doc(subjectId).set({
                    redPoints: 0,
                    streak: 0,
                    subjectName: e.data().name,
                    isDeleted: true,
                    subject_id: subjectId,
                });
            });
            const report_templates = await db.collection('Institution').doc(user?._code).collection('groups').doc(group.id).collection('report_templates').get();
            report_templates.docs.map(async e => {
                const subjectId = e.data().id;
                await db.collection('Institution').doc(user?._code).collection('kid').doc(kid.id).collection('achievements').doc(subjectId).set({
                    redPoints: 0,
                    streak: 0,
                    subjectName: e.data().name,
                    isDeleted: true,
                    subject_id: subjectId,
                });
                const kidScore = kid.score;
                const prevGroup = await db.collection('Institution').doc(user?._code).collection('groups').doc(kid.groupId).get();
                let prevGroupScore = Number(prevGroup.data().score) - Number(kidScore);
                const nextGroup = await db.collection('Institution').doc(user?._code).collection('groups').doc(group.id).get();
                let nextGroupScore = Number(nextGroup.data().score) + Number(kidScore);

                await db.collection('Institution').doc(user?._code).collection('groups').doc(kid.groupId).update({
                    score: prevGroupScore,
                });
                await db.collection('Institution').doc(user?._code).collection('groups').doc(group.id).update({
                    score: nextGroupScore,
                });
            });

            // ------------------------

            handleClose();
        } catch (error) {
            actions.alert(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Box display="flex" alignItems={'center'} marginY={3}>
                <Box marginRight={2}>
                    <Avatar
                        style={{
                            width: 80,
                            height: 80,
                        }}
                        src={kid.image || defaultAvatars.kid}
                    />
                </Box>

                <Box>
                    <Typography
                        className={clsx([
                            classes.default_typography_bold,
                            classes.default_typography_colorDark,
                            classes.default_typography_capitalize,
                            classes.default_typography_subHeading,
                        ])}
                    >
                        {kid.name}
                    </Typography>
                    <Typography className={clsx([classes.default_typography_colorLight, classes.default_typography_paragraph])}>
                        <FormattedMessage id="current_group" />:
                        <Box
                            component={'span'}
                            marginX={1}
                            className={clsx([classes.default_typography_bold, classes.default_typography_colorDark, classes.default_typography_capitalize])}
                        >
                            {kid.groupName}
                        </Box>
                    </Typography>
                </Box>
            </Box>

            <Field label={<FormattedMessage id="select_new_group" />}>
                <MenuSingle list={groups} label={group ? group.name : 'none'} handleChange={value => setGroup(value)} />
            </Field>

            <div className={classes.default_modal_footer}>
                <Grid container spacing={2}>
                    <Grid item xs={6} justifyContent="center">
                        <Button fullWidth disable={loading} className={classes.default_modal_buttonSecondary} onClick={handleClose}>
                            <FormattedMessage id="cancel" />
                        </Button>
                    </Grid>
                    <Grid item xs={6} justifyContent="center">
                        <Button fullWidth loading={loading} disable={loading} onClick={handleSubmit}>
                            <FormattedMessage id="transfer" />
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Fragment>
    );
};

const useStyles = makeStyles(theme => {
    return {
        ...getModalStyles(theme),
        ...getTypographyStyles(theme),
    };
});
