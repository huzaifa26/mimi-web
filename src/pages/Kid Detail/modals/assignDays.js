import { Grid, makeStyles, Typography, Checkbox, Box } from '@material-ui/core';
import clsx from 'clsx';
import ScrollArea from 'react-scrollbar';
import React, { Fragment, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '../../../components';
import { useStore, useUi } from '../../../store';
import { db } from '../../../utils/firebase';
import { getModalStyles } from '../../../utils/helpers';

const days = [
    {
        id: '6',
        name: <FormattedMessage id="sunday" />,
        label: <FormattedMessage id="sunday" />,
    },
    {
        id: '0',
        name: <FormattedMessage id="monday" />,
        label: <FormattedMessage id="monday" />,
    },
    {
        id: '1',
        name: <FormattedMessage id="tuesday" />,
        label: <FormattedMessage id="tuesday" />,
    },
    {
        id: '2',
        name: <FormattedMessage id="wednesday" />,
        label: <FormattedMessage id="wednesday" />,
    },
    {
        id: '3',
        name: <FormattedMessage id="thursday" />,
        label: <FormattedMessage id="thursday" />,
    },
    {
        id: '4',
        name: <FormattedMessage id="friday" />,
        label: <FormattedMessage id="friday" />,
    },
    {
        id: '5',
        name: <FormattedMessage id="saturday" />,
        label: <FormattedMessage id="saturday" />,
    },
];

export const AssignDaysBody = props => {
    const { handleClose, kid } = props;
    const classes = useStyles();
    const { state: storeState } = useStore();
    const { actions } = useUi();
    const { user } = storeState;

    const [selectedDays, setSelectedDays] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSelectedDays(kid.assigned_days);
    }, [kid]);

    const handleChange = (index, value) => {
        const _selectedDays = [...selectedDays];
        _selectedDays[index] = value;

        setSelectedDays(_selectedDays);
    };

    const handleSubmit = async () => {
        try {
            const leastSelected = selectedDays.some(el => el);
            if (!leastSelected) throw new Error('must select atleast one day');

            setLoading(true);

            await db.collection('Institution').doc(user._code).collection('kid').doc(kid.id).update({
                assigned_days: selectedDays,
            });

            handleClose();
        } catch (error) {
            actions.alert(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <section className={clsx([classes.default_page_root])}>
                <ScrollArea smoothScrolling speed={0.5}>
                    {selectedDays.map((el, idx) => {
                        const day = days.find(element => element.id === idx);

                        return (
                            <Box display={'flex'} alignItems={'center'}>
                                <Checkbox
                                    style={{
                                        color: '#685BE7',
                                    }}
                                    color="primary"
                                    checked={el}
                                    onClick={() => handleChange(idx, !el)}
                                />
                                <Typography>{day.label}</Typography>
                            </Box>
                        );
                    })}
                </ScrollArea>
            </section>

            <div className={classes.default_modal_footer}>
                <Grid container spacing={2}>
                    <Grid item xs={6} justifyContent="center">
                        <Button disable={loading} fullWidth className={classes.default_modal_buttonSecondary} onClick={handleClose}>
                            <FormattedMessage id="cancel" />
                        </Button>
                    </Grid>
                    <Grid item xs={6} justifyContent="center">
                        <Button disable={loading} fullWidth loading={loading} onClick={handleSubmit}>
                            <FormattedMessage id="save" />
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
    };
});
