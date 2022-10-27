import React, { useState, useEffect } from 'react';
import { alpha, makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles(theme => {
    return {
        tabContainer: {
            padding: 5,
            borderRadius: 22,
            display: 'flex',
            background: alpha('#8F92A1', 0.05),
            width: 'fit-content',
        },
        tab: {
            cursor: 'pointer',
            padding: '5px 12px',
            color: '#000',
            fontWeight: 'bold',
            textTransform: 'capitalize',
            borderRadius: 16,
        },
        selected: {
            color: `#685BE7`,
            background: `#fff`,
        },
    };
});

export const TabList = React.memo(props => {
    const classes = useStyles();

    const { list, defaultValue, onChange } = props;

    const [selected, setSelected] = useState();

    useEffect(() => {
        if (defaultValue) {
            const option = list.find(el => el.id == defaultValue.id);
            setSelected(option);
        } else {
            setSelected(list[0]);
        }
    }, []);

    useEffect(() => {
        if (!selected) return;
        onChange(selected);
    }, [selected]);

    const clickHanlder = item => {
        setSelected(item);
    };

    return (
        <div className={classes.tabContainer}>
            {list.map(el => {
                return (
                    <div
                        onClick={() => clickHanlder(el)}
                        className={clsx({
                            [classes.tab]: true,
                            [classes.selected]: selected?.id === el.id,
                        })}
                    >
                        {el.label}
                    </div>
                );
            })}
        </div>
    );
});
