import { makeStyles, TextField, InputAdornment, alpha, IconButton } from '@material-ui/core';
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
            "& input::-webkit-clear-button": {
                display: "none",
         },
            [theme.breakpoints.only('xs')]: {},
        },
        
    };
});

export const SearchBar = props => {
    
    const classes = useStyles();
    const { handleSearch, placeholder, size, value } = props;

    return (
        <div className={classes.root} style={{marginBottom:10}}> 
            <TextField
                className={classes.textField}
                type="text"
                value={value}
                placeholder={placeholder}
                size={size}
                style={{
                    paddingRight:15,
                  
                    
                }}
               
                InputProps={{
                   
                    disableUnderline: true,
                    startAdornment: (
                        <InputAdornment>
                            {Icon.search}
                        </InputAdornment>
                    ),
                   
                    endAdornment:(
                      ( value?
                        <IconButton  onClick={()=>{handleSearch('')}}>
                            {Icon.close}
                        </IconButton>
                        : null)
                    )
                   
                   
                   
                    
                }}
                onChange={e => handleSearch(e.target.value)}
            />
        </div>
    );
};
