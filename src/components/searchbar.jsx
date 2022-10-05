import { makeStyles, TextField, InputAdornment, alpha } from '@material-ui/core';
import React from 'react';
import Icon from './Icons';

const useStyles = makeStyles(theme => {
    return {
        root: {
            width: '100%',
            maxWidth: 600,
            minWidth: 200,
            padding: 5,
            backgroundColor: alpha('#8F92A10D', 0.05),
            borderRadius: '22px',
        },
        textField: {
            width: '100%',
            backgroundColor: 'transparent',
            borderBottom: 'none',
            '&&&:before': {
                borderBottom: 'none',
            },
            '&&:after': {
                borderBottom: 'none',
            },
            '& input::placeholder': {
                fontSize: '14px',
            },
            [theme.breakpoints.only('xs')]: {},
        },
    };
});

export const SearchBar = props => {
    const classes = useStyles();
    const { handleSearch, placeholder, size } = props;

    return (
        <div className={classes.root}>
            <TextField
                className={classes.textField}
                type="search"
                placeholder={placeholder}
                size={size}
                InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                        <InputAdornment className={classes.icon} position="start">
                            {Icon.search}
                        </InputAdornment>
                    ),
                }}
                onChange={e => handleSearch(e.target.value)}
            />
        </div>
    );
};
