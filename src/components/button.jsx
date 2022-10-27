import { Button as MuiButton, CircularProgress, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { useStore } from '../store';

const useStyles = makeStyles({
    button: {
        textTransform: 'capitalize',
        borderRadius: 14,
        fontSize: 12,
        padding: '8px 12px',
        color: '#ffffff',
        fontWeight: 'bold',
        backgroundColor: '#685BE7',
        '&:hover': {
            backgroundColor: '#5740EB',
        },

        '&.Mui-disabled': {
            color: '#fff',
            opacity: 0.7,
        },

        '&.ltr': {
            '& .MuiButton-startIcon': {
                marginRight: 10,
            },
        },
        '&.rtl': {
            '& .MuiButton-startIcon': {
                marginLeft: 10,
            },
        },
    },
});

export const Button = ({ children, loading, className, endIcon, ...otherProps }) => {
    const classes = useStyles();

    const { state: storeState } = useStore();
    const { orientation } = storeState;

    let markup = null;
    let icon = null;

    if (endIcon) {
        icon = loading ? (
            <CircularProgress
                size={20}
                style={{
                    color: '#fff',
                }}
            />
        ) : (
            endIcon
        );
        markup = children;
    } else {
        markup = loading ? (
            <CircularProgress
                size={20}
                style={{
                    color: '#fff',
                }}
            />
        ) : (
            children
        );
    }

    return (
        <MuiButton className={clsx([classes.button, className, orientation])} endIcon={icon} {...otherProps}>
            {markup}
        </MuiButton>
    );
};
